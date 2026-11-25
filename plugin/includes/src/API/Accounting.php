<?php
/**
 * Accounting API Controller (accounts, transactions).
 *
 * @package Sahajanand_ERP
 */


declare(strict_types=1);

namespace SahajanandERP\API;

use SahajanandERP\Abstracts\AbstractController;
use WP_REST_Server;
use WP_Error;
use WP_REST_Response;
use WP_REST_Request;
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Accounting extends AbstractController {

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

	/**
	 * Get chart of accounts.
	 *
	 * @param WP_REST_Request $request Request instance.
	 * @return WP_REST_Response
	 */
	public function get_accounts( $request ) {
		$table    = $this->get_wpdb()->prefix . 'erp_accounting_chart_of_accounts';
		$accounts = $this->get_wpdb()->get_results( "SELECT * FROM $table ORDER BY code" );
		return rest_ensure_response( $accounts );
	}

	/**
	 * Get a single account.
	 *
	 * @param WP_REST_Request $request Request instance.
	 * @return WP_REST_Response|WP_Error
	 */
	public function get_account( $request ) {
		$id      = (int) $request->get_param( 'id' );
		$table   = $this->get_wpdb()->prefix . 'erp_accounting_chart_of_accounts';
		$account = $this->get_wpdb()->get_row( $this->get_wpdb()->prepare( "SELECT * FROM $table WHERE id = %d", $id ) );
		if ( ! $account ) {
			return new WP_Error( 'not_found', __( 'Account not found.', 'sahajanand-erp' ), array( 'status' => 404 ) );
		}
		return rest_ensure_response( $account );
	}

	/**
	 * Create an account.
	 *
	 * @param WP_REST_Request $request Request instance.
	 * @return WP_REST_Response|WP_Error
	 */
	public function create_account( $request ) {
		$table  = $this->get_wpdb()->prefix . 'erp_accounting_chart_of_accounts';
		$data   = $request->get_json_params();
		$result = $this->get_wpdb()->insert( $table, $data );
		if ( $result === false ) {
			return new WP_Error( 'insert_failed', __( 'Failed to create account.', 'sahajanand-erp' ), array( 'status' => 500 ) );
		}
		return rest_ensure_response( array( 'id' => $this->get_wpdb()->insert_id ) );
	}

	/**
	 * Update an account.
	 *
	 * @param WP_REST_Request $request Request instance.
	 * @return WP_REST_Response|WP_Error
	 */
	public function update_account( $request ) {
		$id     = (int) $request->get_param( 'id' );
		$table  = $this->get_wpdb()->prefix . 'erp_accounting_chart_of_accounts';
		$data   = $request->get_json_params();
		$result = $this->get_wpdb()->update( $table, $data, array( 'id' => $id ) );
		if ( $result === false ) {
			return new WP_Error( 'update_failed', __( 'Failed to update account.', 'sahajanand-erp' ), array( 'status' => 500 ) );
		}
		return rest_ensure_response( array( 'updated' => true ) );
	}

	/**
	 * Delete an account.
	 *
	 * @param WP_REST_Request $request Request instance.
	 * @return WP_REST_Response|WP_Error
	 */
	public function delete_account( $request ) {
		$id     = (int) $request->get_param( 'id' );
		$table  = $this->get_wpdb()->prefix . 'erp_accounting_chart_of_accounts';
		$result = $this->get_wpdb()->delete( $table, array( 'id' => $id ) );
		if ( $result === false ) {
			return new WP_Error( 'delete_failed', __( 'Failed to delete account.', 'sahajanand-erp' ), array( 'status' => 500 ) );
		}
		return rest_ensure_response( array( 'deleted' => true ) );
	}

	/**
	 * Get transactions.
	 *
	 * @param WP_REST_Request $request Request instance.
	 * @return WP_REST_Response
	 */
	public function get_transactions( $request ) {
		$table        = $this->get_wpdb()->prefix . 'erp_accounting_transactions';
		$transactions = $this->get_wpdb()->get_results( "SELECT * FROM $table ORDER BY date DESC" );
		return rest_ensure_response( $transactions );
	}

	/**
	 * Get a single transaction.
	 *
	 * @param WP_REST_Request $request Request instance.
	 * @return WP_REST_Response|WP_Error
	 */
	public function get_transaction( $request ) {
		$id          = (int) $request->get_param( 'id' );
		$table       = $this->get_wpdb()->prefix . 'erp_accounting_transactions';
		$transaction = $this->get_wpdb()->get_row( $this->get_wpdb()->prepare( "SELECT * FROM $table WHERE id = %d", $id ) );
		if ( ! $transaction ) {
			return new WP_Error( 'not_found', __( 'Transaction not found.', 'sahajanand-erp' ), array( 'status' => 404 ) );
		}
		return rest_ensure_response( $transaction );
	}

	/**
	 * Create a transaction.
	 *
	 * @param WP_REST_Request $request Request instance.
	 * @return WP_REST_Response|WP_Error
	 */
	public function create_transaction( $request ) {
		$table  = $this->get_wpdb()->prefix . 'erp_accounting_transactions';
		$data   = $request->get_json_params();
		$result = $this->get_wpdb()->insert( $table, $data );
		if ( $result === false ) {
			return new WP_Error( 'insert_failed', __( 'Failed to create transaction.', 'sahajanand-erp' ), array( 'status' => 500 ) );
		}
		return rest_ensure_response( array( 'id' => $this->get_wpdb()->insert_id ) );
	}

	/**
	 * Update a transaction.
	 *
	 * @param WP_REST_Request $request Request instance.
	 * @return WP_REST_Response|WP_Error
	 */
	public function update_transaction( $request ) {
		$id     = (int) $request->get_param( 'id' );
		$table  = $this->get_wpdb()->prefix . 'erp_accounting_transactions';
		$data   = $request->get_json_params();
		$result = $this->get_wpdb()->update( $table, $data, array( 'id' => $id ) );
		if ( $result === false ) {
			return new WP_Error( 'update_failed', __( 'Failed to update transaction.', 'sahajanand-erp' ), array( 'status' => 500 ) );
		}
		return rest_ensure_response( array( 'updated' => true ) );
	}

	/**
	 * Delete a transaction.
	 *
	 * @param WP_REST_Request $request Request instance.
	 * @return WP_REST_Response|WP_Error
	 */
	public function delete_transaction( $request ) {
		$id     = (int) $request->get_param( 'id' );
		$table  = $this->get_wpdb()->prefix . 'erp_accounting_transactions';
		$result = $this->get_wpdb()->delete( $table, array( 'id' => $id ) );
		if ( $result === false ) {
			return new WP_Error( 'delete_failed', __( 'Failed to delete transaction.', 'sahajanand-erp' ), array( 'status' => 500 ) );
		}
		return rest_ensure_response( array( 'deleted' => true ) );
	}
}
