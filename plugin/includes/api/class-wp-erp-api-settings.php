<?php
/**
 * Settings API
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WP_ERP_API_Settings extends WP_ERP_API_Controller {
	
	protected $namespace = 'wp-erp/v1';
	protected $rest_base = 'settings';
	
	public function register_routes() {
		register_rest_route( $this->namespace, '/' . $this->rest_base, array(
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_settings' ),
				'permission_callback' => array( $this, 'check_permission' ),
			),
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'update_settings' ),
				'permission_callback' => array( $this, 'check_permission' ),
			),
		) );
	}

	public function get_settings( $request ) {
		$settings = get_option( 'wp_erp_settings', array( 'company_name' => '' ) );
		return rest_ensure_response( $settings );
	}

	public function update_settings( $request ) {
		$data = $request->get_json_params();
		$settings = get_option( 'wp_erp_settings', array() );
		
		if ( isset( $data['company_name'] ) ) {
			$settings['company_name'] = sanitize_text_field( $data['company_name'] );
		}
		
		update_option( 'wp_erp_settings', $settings );
		
		return rest_ensure_response( array( 'success' => true, 'settings' => $settings ) );
	}
}
