<?php
/**
 * Daily Programs API Controller
 *
 * @package Gurukul_ERP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/class-sahajanand-erp-api-controller.php';

class SAHAJANAND_ERP_API_Programs extends SAHAJANAND_ERP_API_Controller {

	/**
	 * Register routes
	 */
	public function register_routes() {
		register_rest_route( $this->namespace, '/content/daily-programs', array(
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

        register_rest_route( $this->namespace, '/content/daily-programs/(?P<id>\d+)', array(
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
        $table_name = $wpdb->prefix . 'erp_daily_programs';
        
        $limit = 20;
        $results = $wpdb->get_results( "SELECT * FROM $table_name ORDER BY program_date DESC LIMIT $limit" );

        foreach ( $results as $key => $item ) {
            if ( $item->image_id ) {
                $results[$key]->image_url = wp_get_attachment_image_url( $item->image_id, 'full' );
            }
        }
        
		return rest_ensure_response( $results );
	}

    /**
     * Create Item
     */
    public function create_item( $request ) {
        try {
            global $wpdb;
            $table_name = $wpdb->prefix . 'erp_daily_programs';
            $params = $request->get_json_params();

            if ( empty( $params['date'] ) || empty( $params['image_id'] ) ) {
                return new WP_Error( 'missing_params', 'Date and Image are required', array( 'status' => 400 ) );
            }

            $inserted = $wpdb->insert(
                $table_name,
                array(
                    'program_date' => sanitize_text_field( $params['date'] ),
                    'image_id'     => intval( $params['image_id'] )
                ),
                array( '%s', '%d' )
            );

            if ( false === $inserted ) {
                return new WP_Error( 'db_error', 'Could not insert program. DB Error: ' . $wpdb->last_error, array( 'status' => 500 ) );
            }

            return rest_ensure_response( array( 'id' => $wpdb->insert_id, 'message' => 'Program created successfully' ) );
        } catch ( Exception $e ) {
            return new WP_Error( 'exception', 'Exception: ' . $e->getMessage(), array( 'status' => 500 ) );
        }
    }

    /**
     * Update Item
     */
    public function update_item( $request ) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'erp_daily_programs';
        $id = (int) $request['id'];
        $params = $request->get_json_params();

        $data = array();
        $format = array();

        if ( isset( $params['date'] ) ) {
            $data['program_date'] = sanitize_text_field( $params['date'] );
            $format[] = '%s';
        }
        if ( isset( $params['image_id'] ) ) {
            $data['image_id'] = intval( $params['image_id'] );
            $format[] = '%d';
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

        return rest_ensure_response( array( 'id' => $id, 'message' => 'Program saved' ) );
    }

    /**
     * Delete Item
     */
    public function delete_item( $request ) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'erp_daily_programs';
        $id = (int) $request['id'];

        $deleted = $wpdb->delete(
            $table_name,
            array( 'id' => $id ),
            array( '%d' )
        );

        return rest_ensure_response( array( 'id' => $id, 'message' => 'Program deleted' ) );
    }
}
