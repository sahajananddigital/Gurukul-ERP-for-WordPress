<?php
/**
 * PHPUnit Tests for WP ERP
 *
 * @package Sahajanand_ERP
 */

class SAHAJANAND_ERP_Test extends WP_UnitTestCase {
	
	/**
	 * Test plugin activation
	 */
	public function test_plugin_activation() {
		SAHAJANAND_ERP_Install::install();
		
		$this->assertEquals( SAHAJANAND_ERP_VERSION, get_option( 'sahajanand_erp_version' ) );
		$this->assertNotEmpty( get_option( 'sahajanand_erp_installed' ) );
	}
	
	/**
	 * Test database tables creation
	 */
	public function test_database_tables_created() {
		global $wpdb;
		
		SAHAJANAND_ERP_Database::create_tables();
		
		$tables = array(
			$wpdb->prefix . 'erp_crm_contacts',
			$wpdb->prefix . 'erp_crm_activities',
			$wpdb->prefix . 'erp_accounting_chart_of_accounts',
			$wpdb->prefix . 'erp_accounting_transactions',
			$wpdb->prefix . 'erp_accounting_transaction_entries',
			$wpdb->prefix . 'erp_hr_employees',
			$wpdb->prefix . 'erp_hr_leave_requests',
			$wpdb->prefix . 'erp_helpdesk_tickets',
			$wpdb->prefix . 'erp_helpdesk_ticket_replies',
			$wpdb->prefix . 'erp_vouchers',
			$wpdb->prefix . 'erp_invoices',
			$wpdb->prefix . 'erp_invoice_items',
			$wpdb->prefix . 'erp_expenses',
			$wpdb->prefix . 'erp_food_passes',
			$wpdb->prefix . 'erp_food_pass_usage',
			$wpdb->prefix . 'erp_addons',
		);
		
		foreach ( $tables as $table ) {
			$this->assertEquals( $table, $wpdb->get_var( "SHOW TABLES LIKE '$table'" ) );
		}
	}
	
	/**
	 * Test module registration
	 */
	public function test_module_registration() {
		$erp = Sahajanand_ERP();
		
		// Test all core modules
		$modules = array(
			'crm' => 'SAHAJANAND_ERP_CRM',
			'accounting' => 'SAHAJANAND_ERP_Accounting',
			'hr' => 'SAHAJANAND_ERP_HR',
			'helpdesk' => 'SAHAJANAND_ERP_Helpdesk',
			'vouchers' => 'SAHAJANAND_ERP_Vouchers',
			'invoices' => 'SAHAJANAND_ERP_Invoices',
			'expenses' => 'SAHAJANAND_ERP_Expenses',
			'food-pass' => 'SAHAJANAND_ERP_Food_Pass',
		);
		
		foreach ( $modules as $slug => $class_name ) {
			$module = $erp->modules->get_module( $slug );
			$this->assertInstanceOf( $class_name, $module, "Module $slug should be instance of $class_name" );
			$this->assertTrue( $erp->modules->is_module_active( $slug ), "Module $slug should be active" );
		}
	}
	
	/**
	 * Test CRM API
	 */
	public function test_crm_api() {
		global $wpdb;
		$table = $wpdb->prefix . 'erp_crm_contacts';
		
		// Create test contact
		$contact_data = array(
			'first_name' => 'Test',
			'last_name' => 'User',
			'email' => 'test@example.com',
			'phone' => '1234567890',
			'status' => 'lead',
		);
		
		$result = $wpdb->insert( $table, $contact_data );
		$this->assertNotFalse( $result, 'Contact should be inserted' );
		
		$contact_id = $wpdb->insert_id;
		$contact = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table WHERE id = %d", $contact_id ) );
		
		$this->assertEquals( 'Test', $contact->first_name );
		$this->assertEquals( 'User', $contact->last_name );
		$this->assertEquals( 'test@example.com', $contact->email );
	}
	
	/**
	 * Test Vouchers API
	 */
	public function test_vouchers_api() {
		global $wpdb;
		$table = $wpdb->prefix . 'erp_vouchers';
		
		$voucher_data = array(
			'voucher_no' => 'VCH-TEST-001',
			'voucher_type' => 'payment',
			'date' => date( 'Y-m-d' ),
			'party_name' => 'Test Party',
			'amount' => 1000.00,
			'status' => 'draft',
			'created_by' => 1,
		);
		
		$result = $wpdb->insert( $table, $voucher_data );
		$this->assertNotFalse( $result, 'Voucher should be inserted' );
		
		$voucher_id = $wpdb->insert_id;
		$voucher = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table WHERE id = %d", $voucher_id ) );
		
		$this->assertEquals( 'VCH-TEST-001', $voucher->voucher_no );
		$this->assertEquals( 'payment', $voucher->voucher_type );
		$this->assertEquals( 1000.00, $voucher->amount );
	}
	
	/**
	 * Test Invoices API
	 */
	public function test_invoices_api() {
		global $wpdb;
		$table = $wpdb->prefix . 'erp_invoices';
		
		$invoice_data = array(
			'invoice_no' => 'INV-TEST-001',
			'invoice_date' => date( 'Y-m-d' ),
			'subtotal' => 1000.00,
			'tax_amount' => 180.00,
			'total_amount' => 1180.00,
			'status' => 'draft',
			'created_by' => 1,
		);
		
		$result = $wpdb->insert( $table, $invoice_data );
		$this->assertNotFalse( $result, 'Invoice should be inserted' );
		
		$invoice_id = $wpdb->insert_id;
		$invoice = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table WHERE id = %d", $invoice_id ) );
		
		$this->assertEquals( 'INV-TEST-001', $invoice->invoice_no );
		$this->assertEquals( 1180.00, $invoice->total_amount );
	}
	
	/**
	 * Test Expenses API
	 */
	public function test_expenses_api() {
		global $wpdb;
		$table = $wpdb->prefix . 'erp_expenses';
		
		$expense_data = array(
			'expense_no' => 'EXP-TEST-001',
			'expense_type' => 'travel',
			'date' => date( 'Y-m-d' ),
			'amount' => 500.00,
			'category' => 'Transportation',
			'payment_method' => 'cash',
			'status' => 'pending',
			'created_by' => 1,
		);
		
		$result = $wpdb->insert( $table, $expense_data );
		$this->assertNotFalse( $result, 'Expense should be inserted' );
		
		$expense_id = $wpdb->insert_id;
		$expense = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table WHERE id = %d", $expense_id ) );
		
		$this->assertEquals( 'EXP-TEST-001', $expense->expense_no );
		$this->assertEquals( 'travel', $expense->expense_type );
		$this->assertEquals( 500.00, $expense->amount );
	}
	
	/**
	 * Test Food Pass API
	 */
	public function test_food_pass_api() {
		global $wpdb;
		$table = $wpdb->prefix . 'erp_food_passes';
		
		$food_pass_data = array(
			'pass_no' => 'FP-TEST-001',
			'issue_date' => date( 'Y-m-d' ),
			'valid_from' => date( 'Y-m-d' ),
			'valid_to' => date( 'Y-m-d', strtotime( '+30 days' ) ),
			'meals_per_day' => 2,
			'total_meals' => 60,
			'used_meals' => 0,
			'status' => 'active',
			'created_by' => 1,
		);
		
		$result = $wpdb->insert( $table, $food_pass_data );
		$this->assertNotFalse( $result, 'Food pass should be inserted' );
		
		$pass_id = $wpdb->insert_id;
		$food_pass = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table WHERE id = %d", $pass_id ) );
		
		$this->assertEquals( 'FP-TEST-001', $food_pass->pass_no );
		$this->assertEquals( 2, $food_pass->meals_per_day );
		$this->assertEquals( 60, $food_pass->total_meals );
	}
	
	/**
	 * Test REST API endpoints exist
	 */
	public function test_rest_api_routes() {
		$routes = rest_get_server()->get_routes();
		
		$expected_routes = array(
			'/sahajanand-erp/v1/crm/contacts',
			'/sahajanand-erp/v1/accounting/accounts',
			'/sahajanand-erp/v1/hr/employees',
			'/sahajanand-erp/v1/helpdesk/tickets',
			'/sahajanand-erp/v1/vouchers',
			'/sahajanand-erp/v1/invoices',
			'/sahajanand-erp/v1/expenses',
			'/sahajanand-erp/v1/food-pass',
			'/sahajanand-erp/v1/auth/me',
			'/sahajanand-erp/v1/content/dashboard',
			'/sahajanand-erp/v1/content/daily-darshan',
			'/sahajanand-erp/v1/content/daily-quotes',
			'/sahajanand-erp/v1/content/daily-updates',
			'/sahajanand-erp/v1/content/daily-satsang',
			'/sahajanand-erp/v1/content/daily-programs',
			'/sahajanand-erp/v1/content/calendar-events',
		);
		
		foreach ( $expected_routes as $route ) {
			$this->assertArrayHasKey( $route, $routes, "Route $route should be registered" );
		}
	}
	
	/**
	 * Test addon manager
	 */
	public function test_addon_manager() {
		$erp = Sahajanand_ERP();
		$addons = $erp->addons->get_addons();
		
		$this->assertIsArray( $addons );
	}
}

