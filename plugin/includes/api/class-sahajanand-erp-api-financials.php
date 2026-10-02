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
		register_rest_route(
			$this->namespace,
			'/vouchers',
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
		register_rest_route(
			$this->namespace,
			'/invoices',
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
		register_rest_route(
			$this->namespace,
			'/expenses',
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
		register_rest_route(
			$this->namespace,
			'/expenses/(?P<id>[\d]+)',
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
}
