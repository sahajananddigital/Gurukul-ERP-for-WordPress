<?php
/**
 * General API Controller (dashboard summary, addons).
 *
 * @package Sahajanand_ERP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/class-sahajanand-erp-api-controller.php';

class SAHAJANAND_ERP_API_General extends SAHAJANAND_ERP_API_Controller {

	/**
	 * Register routes
	 */
	public function register_routes() {
		register_rest_route(
			$this->namespace,
			'/addons',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_addons' ),
					'permission_callback' => array( $this, 'check_permission' ),
				),
			)
		);
		register_rest_route(
			$this->namespace,
			'/addons/(?P<key>[a-zA-Z0-9_\-]+)',
			array(
				array(
					'methods'             => WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'set_addon_status' ),
					'permission_callback' => array( $this, 'check_permission' ),
				),
			)
		);
		register_rest_route(
			$this->namespace,
			'/dashboard/summary',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_dashboard_summary' ),
					'permission_callback' => array( $this, 'check_permission' ),
				),
			)
		);
	}

	/**
	 * Module-wise summary used by the dashboards.
	 */
	public function get_dashboard_summary( $request ) {
		if ( ! class_exists( 'SAHAJANAND_ERP_Summary' ) ) {
			return new WP_Error( 'summary_unavailable', __( 'Summary data is unavailable.', 'sahajanand-erp' ), array( 'status' => 500 ) );
		}
		return rest_ensure_response( SAHAJANAND_ERP_Summary::get_module_summary() );
	}

	// Addon methods.
	/**
	 * List installed addons.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response
	 */
	public function get_addons( $request ) {
		$erp = Sahajanand_ERP();

		if ( ! $erp || ! isset( $erp->addons ) ) {
			return rest_ensure_response( array() );
		}

		return rest_ensure_response( $erp->addons->get_installed_addons() );
	}

	/**
	 * Activate or deactivate an addon.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function set_addon_status( $request ) {
		$erp = Sahajanand_ERP();

		if ( ! $erp || ! isset( $erp->addons ) ) {
			return new WP_Error( 'addons_unavailable', __( 'Addon manager is unavailable.', 'sahajanand-erp' ), array( 'status' => 500 ) );
		}

		$key    = sanitize_text_field( $request['key'] );
		$params = (array) $request->get_json_params();
		$active = ! empty( $params['active'] );

		if ( $active ) {
			$erp->addons->activate_addon( $key );
		} else {
			$erp->addons->deactivate_addon( $key );
		}

		return rest_ensure_response(
			array(
				'key'    => $key,
				'active' => $active ? 1 : 0,
			)
		);
	}
}
