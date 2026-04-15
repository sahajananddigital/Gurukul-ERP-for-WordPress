<?php
/**
 * Auth API Controller
 *
 * @package Gurukul_ERP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/class-wp-erp-api-controller.php';

class WP_ERP_API_Auth extends WP_ERP_API_Controller {

	/**
	 * Register routes
	 */
	public function register_routes() {
		register_rest_route( $this->namespace, '/auth/me', array(
			array(
				'methods' => WP_REST_Server::READABLE,
				'callback' => array( $this, 'get_current_user' ),
				'permission_callback' => array( $this, 'check_permission' ),
			),
		) );
	}

	/**
	 * Get Current User Info
	 */
	public function get_current_user( $request ) {
		$user = wp_get_current_user();
		
		if ( ! $user->ID ) {
			return new WP_Error( 'rest_not_logged_in', __( 'You are not currently logged in.' ), array( 'status' => 401 ) );
		}

		$data = array(
			'id'     => $user->ID,
			'name'   => $user->display_name,
			'email'  => $user->user_email,
			'phone'  => get_user_meta( $user->ID, 'billing_phone', true ) ?: get_user_meta( $user->ID, 'phone', true ),
			'avatar' => get_avatar_url( $user->ID ),
            'roles'  => $user->roles,
		);

		return rest_ensure_response( $data );
	}
}
