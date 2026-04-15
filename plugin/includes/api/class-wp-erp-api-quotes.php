<?php
/**
 * Daily Quotes API Controller
 *
 * @package Gurukul_ERP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/class-wp-erp-api-controller.php';

class WP_ERP_API_Quotes extends WP_ERP_API_Controller {

	/**
	 * Register routes
	 */
	public function register_routes() {
		register_rest_route( $this->namespace, '/content/daily-quotes', array(
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

        register_rest_route( $this->namespace, '/content/daily-quotes/(?P<id>\d+)', array(
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
        $table_name = $wpdb->prefix . 'erp_daily_quotes';
        
        $results = $wpdb->get_results( "SELECT * FROM $table_name ORDER BY created_at DESC LIMIT 100" );

        // Process images
        foreach ( $results as $key => $item ) {
            if ( $item->image_id ) {
                $image_url = wp_get_attachment_image_url( $item->image_id, 'large' );
                if ( ! $image_url ) {
                     $image_url = wp_get_attachment_image_url( $item->image_id, 'full' );
                }
                
                if ( $image_url ) {
                    $results[$key]->image_url = $image_url;
                }
            }
        }
        
		return rest_ensure_response( $results );
	}

    /**
     * Create Item
     */
    public function create_item( $request ) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'erp_daily_quotes';
        $params = $request->get_json_params();

        if ( empty( $params['date'] ) || empty( $params['text'] ) ) {
            return new WP_Error( 'missing_params', 'Date and Text are required', array( 'status' => 400 ) );
        }

        $image_id = !empty($params['image_id']) ? intval($params['image_id']) : null;

        $inserted = $wpdb->insert(
            $table_name,
            array(
                'quote_date' => sanitize_text_field( $params['date'] ),
                'quote_text' => sanitize_textarea_field( $params['text'] ),
                'author'     => sanitize_text_field( $params['author'] ?? '' ),
                'image_id'   => $image_id
            ),
            array( '%s', '%s', '%s', '%d' )
        );

        if ( false === $inserted ) {
            return new WP_Error( 'db_error', 'Could not insert quote', array( 'status' => 500 ) );
        }

        return rest_ensure_response( array( 'id' => $wpdb->insert_id, 'message' => 'Quote created successfully' ) );
    }

    /**
     * Update Item
     */
    public function update_item( $request ) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'erp_daily_quotes';
        $id = (int) $request['id'];
        $params = $request->get_json_params();

        $data = array();
        $format = array();

        if ( isset( $params['date'] ) ) {
            $data['quote_date'] = sanitize_text_field( $params['date'] );
            $format[] = '%s';
        }
        if ( isset( $params['text'] ) ) {
            $data['quote_text'] = sanitize_textarea_field( $params['text'] );
            $format[] = '%s';
        }
        if ( isset( $params['author'] ) ) {
            $data['author'] = sanitize_text_field( $params['author'] );
            $format[] = '%s';
        }
        if ( isset( $params['image_id'] ) ) {
            $data['image_id'] = $params['image_id'] ? intval( $params['image_id'] ) : null;
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

        if ( false === $updated ) {
            return new WP_Error( 'db_error', 'Could not update quote', array( 'status' => 500 ) );
        }

        return rest_ensure_response( array( 'id' => $id, 'message' => 'Quote updated successfully' ) );
    }

    /**
     * Delete Item
     */
    public function delete_item( $request ) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'erp_daily_quotes';
        $id = (int) $request['id'];

        $deleted = $wpdb->delete(
            $table_name,
            array( 'id' => $id ),
            array( '%d' )
        );

        if ( false === $deleted ) {
            return new WP_Error( 'db_error', 'Could not delete quote', array( 'status' => 500 ) );
        }

        return rest_ensure_response( array( 'id' => $id, 'message' => 'Quote deleted successfully' ) );
    }
}
