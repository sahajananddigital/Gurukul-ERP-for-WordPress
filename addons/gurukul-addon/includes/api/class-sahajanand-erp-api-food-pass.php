<?php
/**
 * Food Pass API Controller
 *
 * @package Gurukul_ERP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! class_exists( 'SAHAJANAND_ERP_API_Controller' ) && defined( 'SAHAJANAND_ERP_PLUGIN_DIR' ) ) {
	require_once SAHAJANAND_ERP_PLUGIN_DIR . 'includes/api/class-sahajanand-erp-api-controller.php';
}

class SAHAJANAND_ERP_API_Food_Pass extends SAHAJANAND_ERP_API_Controller {

	/**
	 * Register routes
	 */
	public function register_routes() {
		register_rest_route( $this->namespace, '/food-pass', array(
			array(
				'methods' => WP_REST_Server::READABLE,
				'callback' => array( $this, 'get_food_passes' ),
				'permission_callback' => array( $this, 'check_permission' ),
			),
			array(
				'methods' => WP_REST_Server::CREATABLE,
				'callback' => array( $this, 'create_food_pass' ),
				'permission_callback' => array( $this, 'check_permission' ),
			),
		) );
	}

	/**
	 * Get Food Passes
	 */
	public function get_food_passes( $request ) {
		global $wpdb;
		$table = $wpdb->prefix . 'erp_food_passes';
		
		$food_passes = $wpdb->get_results( "SELECT * FROM $table ORDER BY issue_date DESC" );
        
        $response = rest_ensure_response( $food_passes );
        if ( ! empty( $food_passes ) ) {
            $response = $this->set_cache_headers( $response, $food_passes[0]->issue_date );
        }
        
        return $response;
	}

	/**
	 * Create Food Pass
	 */
	public function create_food_pass( $request ) {
		global $wpdb;
		$table = $wpdb->prefix . 'erp_food_passes';
		
		$data = $request->get_json_params();
		$data['pass_no'] = 'FP-' . time();
		$data['created_by'] = get_current_user_id();
		$data['used_meals'] = 0;
		
		$result = $wpdb->insert( $table, $data );
		
		if ( $result === false ) {
			return new WP_Error( 'insert_failed', __( 'Failed to create food pass.', 'sahajanand-erp' ), array( 'status' => 500 ) );
		}
		
		return rest_ensure_response( array( 'id' => $wpdb->insert_id ) );
	}
}
