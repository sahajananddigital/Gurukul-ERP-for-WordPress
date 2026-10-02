<?php
/**
 * Accounting API Controller (accounts, transactions).
 *
 * @package Sahajanand_ERP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/class-sahajanand-erp-api-controller.php';

class SAHAJANAND_ERP_API_Accounting extends SAHAJANAND_ERP_API_Controller {

	/**
	 * Register routes
	 */
	public function register_routes() {
		register_rest_route(
			$this->namespace,
			'/accounting/accounts',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_accounts' ),
					'permission_callback' => array( $this, 'check_permission' ),
				),
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'permission_callback' => '__return_true',
					'callback'            => array( $this, 'create_account' ),
					'permission_callback' => array( $this, 'check_permission' ),
				),
			)
		);
		register_rest_route(
			$this->namespace,
			'/accounting/accounts/(?P<id>[\d]+)',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_account' ),
					'permission_callback' => array( $this, 'check_permission' ),
				),
				array(
					'methods'             => WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'update_account' ),
					'permission_callback' => array( $this, 'check_permission' ),
				),
				array(
					'methods'             => WP_REST_Server::DELETABLE,
					'callback'            => array( $this, 'delete_account' ),
					'permission_callback' => array( $this, 'check_permission' ),
				),
			)
		);
		register_rest_route(
			$this->namespace,
			'/accounting/transactions',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_transactions' ),
					'permission_callback' => array( $this, 'check_permission' ),
				),
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'permission_callback' => '__return_true',
					'callback'            => array( $this, 'create_transaction' ),
					'permission_callback' => array( $this, 'check_permission' ),
				),
			)
		);
		register_rest_route(
			$this->namespace,
			'/accounting/transactions/(?P<id>[\d]+)',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_transaction' ),
					'permission_callback' => array( $this, 'check_permission' ),
				),
				array(
					'methods'             => WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'update_transaction' ),
					'permission_callback' => array( $this, 'check_permission' ),
				),
				array(
					'methods'             => WP_REST_Server::DELETABLE,
					'callback'            => array( $this, 'delete_transaction' ),
					'permission_callback' => array( $this, 'check_permission' ),
				),
			)
		);
	}

	// Accounting Methods
	public function get_accounts( $request ) {
		$table    = $this->get_wpdb()->prefix . 'erp_accounting_chart_of_accounts';
		$accounts = $this->get_wpdb()->get_results( "SELECT * FROM $table ORDER BY code" );
		return rest_ensure_response( $accounts );
	}

	public function get_transactions( $request ) {
		$table        = $this->get_wpdb()->prefix . 'erp_accounting_transactions';
		$transactions = $this->get_wpdb()->get_results( "SELECT * FROM $table ORDER BY date DESC" );
		return rest_ensure_response( $transactions );
	}

	public function create_transaction( $request ) {
		$table  = $this->get_wpdb()->prefix . 'erp_accounting_transactions';
		$data   = $request->get_json_params();
		$result = $this->get_wpdb()->insert( $table, $data );
		if ( $result === false ) {
			return new WP_Error( 'insert_failed', __( 'Failed to create transaction.', 'sahajanand-erp' ), array( 'status' => 500 ) );
		}
		return rest_ensure_response( array( 'id' => $this->get_wpdb()->insert_id ) );
	}
}
