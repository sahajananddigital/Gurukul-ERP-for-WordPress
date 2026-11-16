<?php
/**
 * Financials API Controller (vouchers, invoices, expenses).
 *
 * @package Sahajanand_ERP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/class-sahajanand-erp-api-controller.php';

class SAHAJANAND_ERP_API_Financials extends SAHAJANAND_ERP_API_Controller {

	/**
	 * Register routes
	 */
	public function register_routes() {
		// Vouchers endpoints (root and under accounting)
		foreach ( array( '/vouchers', '/accounting/vouchers' ) as $route ) {
			register_rest_route(
				$this->namespace,
				$route,
				array(
					array(
						'methods'             => WP_REST_Server::READABLE,
						'callback'            => array( $this, 'get_vouchers' ),
						'permission_callback' => array( $this, 'check_permission' ),
					),
					array(
						'methods'             => WP_REST_Server::CREATABLE,
						'permission_callback' => '__return_true',
						'callback'            => array( $this, 'create_voucher' ),
						'permission_callback' => array( $this, 'check_permission' ),
					),
				)
			);
		}

		// Invoices endpoints (root and under accounting)
		foreach ( array( '/invoices', '/accounting/invoices' ) as $route ) {
			register_rest_route(
				$this->namespace,
				$route,
				array(
					array(
						'methods'             => WP_REST_Server::READABLE,
						'callback'            => array( $this, 'get_invoices' ),
						'permission_callback' => array( $this, 'check_permission' ),
					),
					array(
						'methods'             => WP_REST_Server::CREATABLE,
						'permission_callback' => '__return_true',
						'callback'            => array( $this, 'create_invoice' ),
						'permission_callback' => array( $this, 'check_permission' ),
					),
				)
			);
		}

		// Expenses endpoints (root and under accounting)
		foreach ( array( '/expenses', '/accounting/expenses' ) as $route ) {
			register_rest_route(
				$this->namespace,
				$route,
				array(
					array(
						'methods'             => WP_REST_Server::READABLE,
						'callback'            => array( $this, 'get_expenses' ),
						'permission_callback' => array( $this, 'check_permission' ),
					),
					array(
						'methods'             => WP_REST_Server::CREATABLE,
						'permission_callback' => '__return_true',
						'callback'            => array( $this, 'create_expense' ),
						'permission_callback' => array( $this, 'check_permission' ),
					),
				)
			);
		}

		foreach ( array( '/expenses/(?P<id>[\d]+)', '/accounting/expenses/(?P<id>[\d]+)' ) as $route ) {
			register_rest_route(
				$this->namespace,
				$route,
				array(
					array(
						'methods'             => WP_REST_Server::READABLE,
						'callback'            => array( $this, 'get_expense' ),
						'permission_callback' => array( $this, 'check_permission' ),
					),
					array(
						'methods'             => WP_REST_Server::EDITABLE,
						'callback'            => array( $this, 'update_expense' ),
						'permission_callback' => array( $this, 'check_permission' ),
					),
					array(
						'methods'             => WP_REST_Server::DELETABLE,
						'callback'            => array( $this, 'delete_expense' ),
						'permission_callback' => array( $this, 'check_permission' ),
					),
				)
			);
		}
	}

	// Vouchers Methods
	public function get_vouchers( $request ) {
		$table    = $this->get_wpdb()->prefix . 'erp_vouchers';
		$vouchers = $this->get_wpdb()->get_results( "SELECT * FROM $table ORDER BY date DESC" );
		return rest_ensure_response( $vouchers );
	}

	public function create_voucher( $request ) {
		$table              = $this->get_wpdb()->prefix . 'erp_vouchers';
		$data               = $request->get_json_params();
		$data['voucher_no'] = 'VCH-' . time();
		$data['created_by'] = get_current_user_id();
		$result             = $this->get_wpdb()->insert( $table, $data );
		if ( $result === false ) {
			return new WP_Error( 'insert_failed', __( 'Failed to create voucher.', 'sahajanand-erp' ), array( 'status' => 500 ) );
		}
		return rest_ensure_response( array( 'id' => $this->get_wpdb()->insert_id ) );
	}

	// Invoices Methods
	public function get_invoices( $request ) {
		$table    = $this->get_wpdb()->prefix . 'erp_invoices';
		$invoices = $this->get_wpdb()->get_results( "SELECT * FROM $table ORDER BY invoice_date DESC" );
		return rest_ensure_response( $invoices );
	}

	public function create_invoice( $request ) {
		$table              = $this->get_wpdb()->prefix . 'erp_invoices';
		$data               = $request->get_json_params();
		$data['invoice_no'] = 'INV-' . time();
		$data['created_by'] = get_current_user_id();
		$result             = $this->get_wpdb()->insert( $table, $data );
		if ( $result === false ) {
			return new WP_Error( 'insert_failed', __( 'Failed to create invoice.', 'sahajanand-erp' ), array( 'status' => 500 ) );
		}
		return rest_ensure_response( array( 'id' => $this->get_wpdb()->insert_id ) );
	}

	// Expenses Methods
	public function get_expenses( $request ) {
		$table    = $this->get_wpdb()->prefix . 'erp_expenses';
		$expenses = $this->get_wpdb()->get_results( "SELECT * FROM $table ORDER BY date DESC" );
		return rest_ensure_response( $expenses );
	}

	public function create_expense( $request ) {
		$table              = $this->get_wpdb()->prefix . 'erp_expenses';
		$data               = $request->get_json_params();
		$data['expense_no'] = 'EXP-' . time();
		$data['created_by'] = get_current_user_id();
		$result             = $this->get_wpdb()->insert( $table, $data );
		if ( $result === false ) {
			return new WP_Error( 'insert_failed', __( 'Failed to create expense.', 'sahajanand-erp' ), array( 'status' => 500 ) );
		}
		return rest_ensure_response( array( 'id' => $this->get_wpdb()->insert_id ) );
	}

	public function get_expense( $request ) {
		$id      = intval( $request['id'] );
		$table   = $this->get_wpdb()->prefix . 'erp_expenses';
		$expense = $this->get_wpdb()->get_row( $this->get_wpdb()->prepare( "SELECT * FROM $table WHERE id = %d", $id ) );
		if ( ! $expense ) {
			return new WP_Error( 'not_found', __( 'Expense not found.', 'sahajanand-erp' ), array( 'status' => 404 ) );
		}
		return rest_ensure_response( $expense );
	}

	public function update_expense( $request ) {
		$id     = intval( $request['id'] );
		$table  = $this->get_wpdb()->prefix . 'erp_expenses';
		$data   = $request->get_json_params();
		$result = $this->get_wpdb()->update( $table, $data, array( 'id' => $id ) );
		if ( $result === false ) {
			return new WP_Error( 'update_failed', __( 'Failed to update expense.', 'sahajanand-erp' ), array( 'status' => 500 ) );
		}
		return rest_ensure_response( array( 'updated' => true ) );
	}

	public function delete_expense( $request ) {
		$id     = intval( $request['id'] );
		$table  = $this->get_wpdb()->prefix . 'erp_expenses';
		$result = $this->get_wpdb()->delete( $table, array( 'id' => $id ) );
		if ( ! $result ) {
			return new WP_Error( 'delete_failed', __( 'Failed to delete expense.', 'sahajanand-erp' ), array( 'status' => 500 ) );
		}
		return rest_ensure_response( array( 'deleted' => true ) );
	}
}
