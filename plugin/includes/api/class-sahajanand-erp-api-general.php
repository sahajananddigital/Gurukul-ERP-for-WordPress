<?php
/**
 * General/Legacy API Controller (Accounting, HR, etc.)
 *
 * @package Gurukul_ERP
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
        // Accounting Routes
		register_rest_route( $this->namespace, '/accounting/accounts', array(
			array(
				'methods' => WP_REST_Server::READABLE,
				'callback' => array( $this, 'get_accounts' ),
				'permission_callback' => array( $this, 'check_permission' ),
			),
			array(
				'methods' => WP_REST_Server::CREATABLE,
				'callback' => array( $this, 'create_account' ),
				'permission_callback' => array( $this, 'check_permission' ),
			),
		) );
		register_rest_route( $this->namespace, '/accounting/accounts/(?P<id>[\d]+)', array(
			array(
				'methods' => WP_REST_Server::READABLE,
				'callback' => array( $this, 'get_account' ),
				'permission_callback' => array( $this, 'check_permission' ),
			),
			array(
				'methods' => WP_REST_Server::EDITABLE,
				'callback' => array( $this, 'update_account' ),
				'permission_callback' => array( $this, 'check_permission' ),
			),
			array(
				'methods' => WP_REST_Server::DELETABLE,
				'callback' => array( $this, 'delete_account' ),
				'permission_callback' => array( $this, 'check_permission' ),
			),
		) );
		
		register_rest_route( $this->namespace, '/accounting/transactions', array(
			array(
				'methods' => WP_REST_Server::READABLE,
				'callback' => array( $this, 'get_transactions' ),
				'permission_callback' => array( $this, 'check_permission' ),
			),
			array(
				'methods' => WP_REST_Server::CREATABLE,
				'callback' => array( $this, 'create_transaction' ),
				'permission_callback' => array( $this, 'check_permission' ),
			),
		) );
		register_rest_route( $this->namespace, '/accounting/transactions/(?P<id>[\d]+)', array(
			array(
				'methods' => WP_REST_Server::READABLE,
				'callback' => array( $this, 'get_transaction' ),
				'permission_callback' => array( $this, 'check_permission' ),
			),
			array(
				'methods' => WP_REST_Server::EDITABLE,
				'callback' => array( $this, 'update_transaction' ),
				'permission_callback' => array( $this, 'check_permission' ),
			),
			array(
				'methods' => WP_REST_Server::DELETABLE,
				'callback' => array( $this, 'delete_transaction' ),
				'permission_callback' => array( $this, 'check_permission' ),
			),
		) );
		
		// HR Routes
		register_rest_route( $this->namespace, '/hr/employees', array(
			array(
				'methods' => WP_REST_Server::READABLE,
				'callback' => array( $this, 'get_employees' ),
				'permission_callback' => array( $this, 'check_permission' ),
			),
			array(
				'methods' => WP_REST_Server::CREATABLE,
				'callback' => array( $this, 'create_employee' ),
				'permission_callback' => array( $this, 'check_permission' ),
			),
		) );
		register_rest_route( $this->namespace, '/hr/employees/(?P<id>[\d]+)', array(
			array(
				'methods' => WP_REST_Server::READABLE,
				'callback' => array( $this, 'get_employee' ),
				'permission_callback' => array( $this, 'check_permission' ),
			),
			array(
				'methods' => WP_REST_Server::EDITABLE,
				'callback' => array( $this, 'update_employee' ),
				'permission_callback' => array( $this, 'check_permission' ),
			),
			array(
				'methods' => WP_REST_Server::DELETABLE,
				'callback' => array( $this, 'delete_employee' ),
				'permission_callback' => array( $this, 'check_permission' ),
			),
		) );
		
		// Helpdesk Routes
		register_rest_route( $this->namespace, '/helpdesk/tickets', array(
			array(
				'methods' => WP_REST_Server::READABLE,
				'callback' => array( $this, 'get_tickets' ),
				'permission_callback' => array( $this, 'check_permission' ),
			),
			array(
				'methods' => WP_REST_Server::CREATABLE,
				'callback' => array( $this, 'create_ticket' ),
				'permission_callback' => array( $this, 'check_permission' ),
			),
		) );
		register_rest_route( $this->namespace, '/helpdesk/tickets/(?P<id>[\d]+)', array(
			array(
				'methods' => WP_REST_Server::READABLE,
				'callback' => array( $this, 'get_ticket' ),
				'permission_callback' => array( $this, 'check_permission' ),
			),
			array(
				'methods' => WP_REST_Server::EDITABLE,
				'callback' => array( $this, 'update_ticket' ),
				'permission_callback' => array( $this, 'check_permission' ),
			),
			array(
				'methods' => WP_REST_Server::DELETABLE,
				'callback' => array( $this, 'delete_ticket' ),
				'permission_callback' => array( $this, 'check_permission' ),
			),
		) );
		
		// Vouchers Routes
		register_rest_route( $this->namespace, '/vouchers', array(
			array(
				'methods' => WP_REST_Server::READABLE,
				'callback' => array( $this, 'get_vouchers' ),
				'permission_callback' => array( $this, 'check_permission' ),
			),
			array(
				'methods' => WP_REST_Server::CREATABLE,
				'callback' => array( $this, 'create_voucher' ),
				'permission_callback' => array( $this, 'check_permission' ),
			),
		) );
		
		// Invoices Routes
		register_rest_route( $this->namespace, '/invoices', array(
			array(
				'methods' => WP_REST_Server::READABLE,
				'callback' => array( $this, 'get_invoices' ),
				'permission_callback' => array( $this, 'check_permission' ),
			),
			array(
				'methods' => WP_REST_Server::CREATABLE,
				'callback' => array( $this, 'create_invoice' ),
				'permission_callback' => array( $this, 'check_permission' ),
			),
		) );
		
		// Expenses Routes
		register_rest_route( $this->namespace, '/expenses', array(
			array(
				'methods' => WP_REST_Server::READABLE,
				'callback' => array( $this, 'get_expenses' ),
				'permission_callback' => array( $this, 'check_permission' ),
			),
			array(
				'methods' => WP_REST_Server::CREATABLE,
				'callback' => array( $this, 'create_expense' ),
				'permission_callback' => array( $this, 'check_permission' ),
			),
		) );
		register_rest_route( $this->namespace, '/expenses/(?P<id>[\d]+)', array(
			array(
				'methods' => WP_REST_Server::READABLE,
				'callback' => array( $this, 'get_expense' ),
				'permission_callback' => array( $this, 'check_permission' ),
			),
			array(
				'methods' => WP_REST_Server::EDITABLE,
				'callback' => array( $this, 'update_expense' ),
				'permission_callback' => array( $this, 'check_permission' ),
			),
			array(
				'methods' => WP_REST_Server::DELETABLE,
				'callback' => array( $this, 'delete_expense' ),
				'permission_callback' => array( $this, 'check_permission' ),
			),
		) );

        // Addon Routes
		register_rest_route( $this->namespace, '/addons', array(
			array(
				'methods' => WP_REST_Server::READABLE,
				'callback' => array( $this, 'get_addons' ),
				'permission_callback' => array( $this, 'check_permission' ),
			),
		) );
	}

    // Accounting Methods
	public function get_accounts( $request ) {
		$table = $this->get_wpdb()->prefix . 'erp_accounting_chart_of_accounts';
		$accounts = $this->get_wpdb()->get_results( "SELECT * FROM $table ORDER BY code" );
		return rest_ensure_response( $accounts );
	}
	
	public function get_transactions( $request ) {
		$table = $this->get_wpdb()->prefix . 'erp_accounting_transactions';
		$transactions = $this->get_wpdb()->get_results( "SELECT * FROM $table ORDER BY date DESC" );
		return rest_ensure_response( $transactions );
	}
	
	public function create_transaction( $request ) {
		$table = $this->get_wpdb()->prefix . 'erp_accounting_transactions';
		$data = $request->get_json_params();
		$result = $this->get_wpdb()->insert( $table, $data );
		if ( $result === false ) {
			return new WP_Error( 'insert_failed', __( 'Failed to create transaction.', 'sahajanand-erp' ), array( 'status' => 500 ) );
		}
		return rest_ensure_response( array( 'id' => $this->get_wpdb()->insert_id ) );
	}
	
	// HR Methods
	public function get_employees( $request ) {
		$table = $this->get_wpdb()->prefix . 'erp_hr_employees';
		$employees = $this->get_wpdb()->get_results( "SELECT * FROM $table ORDER BY created_at DESC" );
		return rest_ensure_response( $employees );
	}
	
	// Helpdesk Methods
	public function get_tickets( $request ) {
		$table = $this->get_wpdb()->prefix . 'erp_helpdesk_tickets';
		$tickets = $this->get_wpdb()->get_results( "SELECT * FROM $table ORDER BY created_at DESC" );
		return rest_ensure_response( $tickets );
	}
	
	public function create_ticket( $request ) {
		$table = $this->get_wpdb()->prefix . 'erp_helpdesk_tickets';
		$data = $request->get_json_params();
		$data['ticket_no'] = 'TKT-' . time();
		$result = $this->get_wpdb()->insert( $table, $data );
		if ( $result === false ) {
			return new WP_Error( 'insert_failed', __( 'Failed to create ticket.', 'sahajanand-erp' ), array( 'status' => 500 ) );
		}
		return rest_ensure_response( array( 'id' => $this->get_wpdb()->insert_id ) );
	}
	
	// Vouchers Methods
	public function get_vouchers( $request ) {
		$table = $this->get_wpdb()->prefix . 'erp_vouchers';
		$vouchers = $this->get_wpdb()->get_results( "SELECT * FROM $table ORDER BY date DESC" );
		return rest_ensure_response( $vouchers );
	}
	
	public function create_voucher( $request ) {
		$table = $this->get_wpdb()->prefix . 'erp_vouchers';
		$data = $request->get_json_params();
		$data['voucher_no'] = 'VCH-' . time();
		$data['created_by'] = get_current_user_id();
		$result = $this->get_wpdb()->insert( $table, $data );
		if ( $result === false ) {
			return new WP_Error( 'insert_failed', __( 'Failed to create voucher.', 'sahajanand-erp' ), array( 'status' => 500 ) );
		}
		return rest_ensure_response( array( 'id' => $this->get_wpdb()->insert_id ) );
	}
	
	// Invoices Methods
	public function get_invoices( $request ) {
		$table = $this->get_wpdb()->prefix . 'erp_invoices';
		$invoices = $this->get_wpdb()->get_results( "SELECT * FROM $table ORDER BY invoice_date DESC" );
		return rest_ensure_response( $invoices );
	}
	
	public function create_invoice( $request ) {
		$table = $this->get_wpdb()->prefix . 'erp_invoices';
		$data = $request->get_json_params();
		$data['invoice_no'] = 'INV-' . time();
		$data['created_by'] = get_current_user_id();
		$result = $this->get_wpdb()->insert( $table, $data );
		if ( $result === false ) {
			return new WP_Error( 'insert_failed', __( 'Failed to create invoice.', 'sahajanand-erp' ), array( 'status' => 500 ) );
		}
		return rest_ensure_response( array( 'id' => $this->get_wpdb()->insert_id ) );
	}
	
	// Expenses Methods
	public function get_expenses( $request ) {
		$table = $this->get_wpdb()->prefix . 'erp_expenses';
		$expenses = $this->get_wpdb()->get_results( "SELECT * FROM $table ORDER BY date DESC" );
		return rest_ensure_response( $expenses );
	}
	
	public function create_expense( $request ) {
		$table = $this->get_wpdb()->prefix . 'erp_expenses';
		$data = $request->get_json_params();
		$data['expense_no'] = 'EXP-' . time();
		$data['created_by'] = get_current_user_id();
		$result = $this->get_wpdb()->insert( $table, $data );
		if ( $result === false ) {
			return new WP_Error( 'insert_failed', __( 'Failed to create expense.', 'sahajanand-erp' ), array( 'status' => 500 ) );
		}
		return rest_ensure_response( array( 'id' => $this->get_wpdb()->insert_id ) );
	}

    // Addon Methods
	public function get_addons( $request ) {
		$erp = Sahajanand_ERP();
		$addons = $erp->addons->get_addons();
		return rest_ensure_response( $addons );
	}
}
