<?php
/**
 * Daily Satsang API Controller
 *
 * @package Gurukul_ERP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/class-sahajanand-erp-api-controller.php';

class SAHAJANAND_ERP_API_Satsang extends SAHAJANAND_ERP_API_Controller {

	/**
	 * Register routes
	 */
	public function register_routes() {
		register_rest_route( $this->namespace, '/content/daily-satsang', array(
			array(
				'methods' => WP_REST_Server::READABLE,
				'callback' => array( $this, 'get_items' ),
				'permission_callback' => '__return_true',
			),
			array(
				'methods' => WP_REST_Server::CREATABLE,
				'callback' => array( $this, 'create_item' ),
				'permission_callback' => array( $this, 'check_permission' ),
			),
		) );

        register_rest_route( $this->namespace, '/content/daily-satsang/(?P<id>\d+)', array(
			array(
				'methods' => WP_REST_Server::EDITABLE,
				'callback' => array( $this, 'update_item' ),
				'permission_callback' => array( $this, 'check_permission' ),
			),
            array(
				'methods' => WP_REST_Server::DELETABLE,
				'callback' => array( $this, 'delete_item' ),
				'permission_callback' => array( $this, 'check_permission' ),
			),
		) );
	}

	/**
	 * Get Items
	 */
	public function get_items( $request ) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'erp_daily_satsang';
        
        $limit = 20;
        $results = $wpdb->get_results( "SELECT * FROM $table_name ORDER BY satsang_date DESC LIMIT $limit" );
        
		return rest_ensure_response( $results );
	}

    /**
     * Create Item
     */
    public function create_item( $request ) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'erp_daily_satsang';
        $params = $request->get_json_params();

        if ( empty( $params['date'] ) || empty( $params['title'] ) ) {
            return new WP_Error( 'missing_params', 'Date and Title are required', array( 'status' => 400 ) );
        }

        $inserted = $wpdb->insert(
            $table_name,
            array(
                'satsang_date' => sanitize_text_field( $params['date'] ),
                'title'        => sanitize_text_field( $params['title'] ),
                'description'  => sanitize_textarea_field( $params['description'] ?? '' ),
                'video_url'    => esc_url_raw( $params['video_url'] ?? '' )
            ),
            array( '%s', '%s', '%s', '%s' )
        );

        if ( false === $inserted ) {
            return new WP_Error( 'db_error', 'Could not insert satsang', array( 'status' => 500 ) );
        }

        return rest_ensure_response( array( 'id' => $wpdb->insert_id, 'message' => 'Satsang created successfully' ) );
    }

    /**
     * Update Item
     */
    public function update_item( $request ) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'erp_daily_satsang';
        $id = (int) $request['id'];
        $params = $request->get_json_params();

        $data = array();
        $format = array();

        if ( isset( $params['date'] ) ) {
            $data['satsang_date'] = sanitize_text_field( $params['date'] );
            $format[] = '%s';
        }
        if ( isset( $params['title'] ) ) {
            $data['title'] = sanitize_text_field( $params['title'] );
            $format[] = '%s';
        }
        if ( isset( $params['description'] ) ) {
            $data['description'] = sanitize_textarea_field( $params['description'] );
            $format[] = '%s';
        }
        if ( isset( $params['video_url'] ) ) {
            $data['video_url'] = esc_url_raw( $params['video_url'] );
            $format[] = '%s';
        }

        if ( empty( $data ) ) {
            return rest_ensure_response( array( 'id' => $id, 'message' => 'No changes' ) );
        }

        $updated = $wpdb->update(
            $table_name,
            $data,
            array( 'id' => $id ),
            $format,
            array( '%d' )
        );

        return rest_ensure_response( array( 'id' => $id, 'message' => 'Satsang saved' ) );
    }

    /**
     * Delete Item
     */
    public function delete_item( $request ) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'erp_daily_satsang';
        $id = (int) $request['id'];

        $deleted = $wpdb->delete(
            $table_name,
            array( 'id' => $id ),
            array( '%d' )
        );

        return rest_ensure_response( array( 'id' => $id, 'message' => 'Satsang deleted' ) );
    }
}
