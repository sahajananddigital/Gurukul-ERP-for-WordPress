<?php
/**
 * Database schema and migrations
 *
 * @package WP_ERP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WP_ERP_Database {
	
	/**
	 * Create all database tables
	 */
	public static function create_tables() {
		global $wpdb;
		
		$charset_collate = $wpdb->get_charset_collate();
		
		// CRM Tables
		self::create_crm_tables( $charset_collate );
		
		// Accounting Tables
		self::create_accounting_tables( $charset_collate );
		
		// HR Tables
		self::create_hr_tables( $charset_collate );
		
		// Helpdesk Tables
		self::create_helpdesk_tables( $charset_collate );
		
		// Vouchers Tables
		self::create_vouchers_tables( $charset_collate );
		
		// Invoices Tables
		self::create_invoices_tables( $charset_collate );
		
		// Expenses Tables
		self::create_expenses_tables( $charset_collate );
		
		// Food Pass Tables
		self::create_food_pass_tables( $charset_collate );

		// Donations Tables
		self::create_donations_table( $charset_collate );
		
		// Addons table
		self::create_addons_table( $charset_collate );
        
        // Daily Quotes Table
        self::create_daily_quotes_table( $charset_collate );

        // Daily Updates Table
        self::create_daily_updates_table( $charset_collate );

        // Daily Satsang Table
        self::create_daily_satsang_table( $charset_collate );

        // Daily Programs Table
        self::create_daily_programs_table( $charset_collate );

        // Calendar Events Table
        self::create_calendar_events_table( $charset_collate );
	}
	
	/**
	 * Create Daily Quick Quotes table
	 */
	private static function create_daily_quotes_table( $charset_collate ) {
		global $wpdb;
		
		$table_name = $wpdb->prefix . 'erp_daily_quotes';
		
		$sql = "CREATE TABLE IF NOT EXISTS $table_name (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			quote_date date NOT NULL,
			quote_text text NOT NULL,
			author varchar(255) DEFAULT NULL,
			image_id bigint(20) unsigned DEFAULT NULL,
			created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY (id),
			KEY quote_date (quote_date),
			KEY created_at (created_at)
		) $charset_collate;";
		
		require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
		dbDelta( $sql );
	}

    /**
     * Create Daily Updates table
     */
    private static function create_daily_updates_table( $charset_collate ) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'erp_daily_updates';
        
        $sql = "CREATE TABLE IF NOT EXISTS $table_name (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            update_date date NOT NULL,
            title varchar(255) NOT NULL,
            description text,
            image_id bigint(20) unsigned DEFAULT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY update_date (update_date),
            KEY created_at (created_at)
        ) $charset_collate;";
        
        require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
        dbDelta( $sql );
    }

    /**
     * Create Daily Satsang table
     */
    private static function create_daily_satsang_table( $charset_collate ) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'erp_daily_satsang';
        
        $sql = "CREATE TABLE IF NOT EXISTS $table_name (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            satsang_date date NOT NULL,
            title varchar(255) NOT NULL,
            description text,
            video_url varchar(500) DEFAULT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY satsang_date (satsang_date),
            KEY created_at (created_at)
        ) $charset_collate;";
        
        require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
        dbDelta( $sql );
    }

    /**
     * Create Daily Programs table
     */
    private static function create_daily_programs_table( $charset_collate ) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'erp_daily_programs';
        
        $sql = "CREATE TABLE IF NOT EXISTS $table_name (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            program_date date NOT NULL,
            image_id bigint(20) unsigned NOT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY program_date (program_date),
            KEY created_at (created_at)
        ) $charset_collate;";
        
        require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
        dbDelta( $sql );
    }

    /**
     * Create Calendar Events table
     */
    private static function create_calendar_events_table( $charset_collate ) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'erp_calendar_events';
        
        $sql = "CREATE TABLE IF NOT EXISTS $table_name (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            event_date date NOT NULL,
            title varchar(255) NOT NULL,
            description text,
            event_type varchar(50) DEFAULT 'general',
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY event_date (event_date),
            KEY event_type (event_type),
            KEY created_at (created_at)
        ) $charset_collate;";
        
        require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
        dbDelta( $sql );
    }
	
	/**
	 * Create CRM tables
	 */
	private static function create_crm_tables( $charset_collate ) {
		global $wpdb;
		
		$table_name = $wpdb->prefix . 'erp_crm_contacts';
		
		$sql = "CREATE TABLE IF NOT EXISTS $table_name (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			user_id bigint(20) unsigned DEFAULT NULL,
			first_name varchar(100) NOT NULL,
			last_name varchar(100) NOT NULL,
			email varchar(100) DEFAULT NULL,
			phone varchar(50) DEFAULT NULL,
			company varchar(200) DEFAULT NULL,
			address_line_1 varchar(255) DEFAULT NULL,
			address_line_2 varchar(255) DEFAULT NULL,
			city varchar(100) DEFAULT NULL,
			state varchar(100) DEFAULT NULL,
			postal_code varchar(20) DEFAULT NULL,
			country varchar(100) DEFAULT NULL,
			birthday date DEFAULT NULL,
			anniversary date DEFAULT NULL,
			status varchar(20) DEFAULT 'lead',
			type varchar(20) DEFAULT 'contact',
			created_at datetime DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY (id),
			KEY user_id (user_id),
			KEY email (email),
			KEY status (status)
		) $charset_collate;";
		
		require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
		dbDelta( $sql );
		
		// CRM Activities
		$table_name = $wpdb->prefix . 'erp_crm_activities';
		
		$sql = "CREATE TABLE IF NOT EXISTS $table_name (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			contact_id bigint(20) unsigned NOT NULL,
			user_id bigint(20) unsigned NOT NULL,
			type varchar(50) NOT NULL,
			subject varchar(255) DEFAULT NULL,
			description text,
			created_at datetime DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY (id),
			KEY contact_id (contact_id),
			KEY user_id (user_id),
			KEY type (type)
		) $charset_collate;";
		
		dbDelta( $sql );
	}
	
	/**
	 * Create Accounting tables
	 */
	private static function create_accounting_tables( $charset_collate ) {
		global $wpdb;
		
		$table_name = $wpdb->prefix . 'erp_accounting_chart_of_accounts';
		
		$sql = "CREATE TABLE IF NOT EXISTS $table_name (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			code varchar(50) NOT NULL,
			name varchar(255) NOT NULL,
			parent_id bigint(20) unsigned DEFAULT NULL,
			type varchar(50) NOT NULL,
			balance decimal(15,2) DEFAULT 0.00,
			created_at datetime DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY (id),
			UNIQUE KEY code (code),
			KEY parent_id (parent_id),
			KEY type (type)
		) $charset_collate;";
		
		require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
		dbDelta( $sql );
		
		// Transactions
		$table_name = $wpdb->prefix . 'erp_accounting_transactions';
		
		$sql = "CREATE TABLE IF NOT EXISTS $table_name (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			voucher_no varchar(50) NOT NULL,
			type varchar(50) NOT NULL,
			date date NOT NULL,
			reference varchar(255) DEFAULT NULL,
			description text,
			total decimal(15,2) NOT NULL,
			created_by bigint(20) unsigned NOT NULL,
			created_at datetime DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY (id),
			UNIQUE KEY voucher_no (voucher_no),
			KEY type (type),
			KEY date (date)
		) $charset_collate;";
		
		dbDelta( $sql );
		
		// Transaction entries
		$table_name = $wpdb->prefix . 'erp_accounting_transaction_entries';
		
		$sql = "CREATE TABLE IF NOT EXISTS $table_name (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			transaction_id bigint(20) unsigned NOT NULL,
			account_id bigint(20) unsigned NOT NULL,
			debit decimal(15,2) DEFAULT 0.00,
			credit decimal(15,2) DEFAULT 0.00,
			PRIMARY KEY (id),
			KEY transaction_id (transaction_id),
			KEY account_id (account_id)
		) $charset_collate;";
		
		dbDelta( $sql );
	}
	
	/**
	 * Create HR tables
	 */
	private static function create_hr_tables( $charset_collate ) {
		global $wpdb;
		
		$table_name = $wpdb->prefix . 'erp_hr_employees';
		
		$sql = "CREATE TABLE IF NOT EXISTS $table_name (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			user_id bigint(20) unsigned NOT NULL,
			employee_id varchar(50) NOT NULL,
			designation varchar(100) DEFAULT NULL,
			department varchar(100) DEFAULT NULL,
			joining_date date DEFAULT NULL,
			status varchar(20) DEFAULT 'active',
			created_at datetime DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY (id),
			UNIQUE KEY user_id (user_id),
			UNIQUE KEY employee_id (employee_id),
			KEY status (status)
		) $charset_collate;";
		
		require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
		dbDelta( $sql );
		
		// Leave requests
		$table_name = $wpdb->prefix . 'erp_hr_leave_requests';
		
		$sql = "CREATE TABLE IF NOT EXISTS $table_name (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			employee_id bigint(20) unsigned NOT NULL,
			leave_type varchar(50) NOT NULL,
			start_date date NOT NULL,
			end_date date NOT NULL,
			days decimal(5,2) NOT NULL,
			status varchar(20) DEFAULT 'pending',
			reason text,
			created_at datetime DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY (id),
			KEY employee_id (employee_id),
			KEY status (status)
		) $charset_collate;";
		
		dbDelta( $sql );
	}
	
	/**
	 * Create Helpdesk tables
	 */
	private static function create_helpdesk_tables( $charset_collate ) {
		global $wpdb;
		
		$table_name = $wpdb->prefix . 'erp_helpdesk_tickets';
		
		$sql = "CREATE TABLE IF NOT EXISTS $table_name (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			ticket_no varchar(50) NOT NULL,
			subject varchar(255) NOT NULL,
			description text NOT NULL,
			contact_id bigint(20) unsigned DEFAULT NULL,
			user_id bigint(20) unsigned DEFAULT NULL,
			priority varchar(20) DEFAULT 'medium',
			status varchar(20) DEFAULT 'open',
			created_at datetime DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY (id),
			UNIQUE KEY ticket_no (ticket_no),
			KEY contact_id (contact_id),
			KEY user_id (user_id),
			KEY status (status),
			KEY priority (priority)
		) $charset_collate;";
		
		require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
		dbDelta( $sql );
		
		// Ticket replies
		$table_name = $wpdb->prefix . 'erp_helpdesk_ticket_replies';
		
		$sql = "CREATE TABLE IF NOT EXISTS $table_name (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			ticket_id bigint(20) unsigned NOT NULL,
			user_id bigint(20) unsigned NOT NULL,
			message text NOT NULL,
			created_at datetime DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY (id),
			KEY ticket_id (ticket_id),
			KEY user_id (user_id)
		) $charset_collate;";
		
		dbDelta( $sql );
	}
	
	/**
	 * Create Vouchers tables
	 */
	private static function create_vouchers_tables( $charset_collate ) {
		global $wpdb;
		
		$table_name = $wpdb->prefix . 'erp_vouchers';
		
		$sql = "CREATE TABLE IF NOT EXISTS $table_name (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			voucher_no varchar(50) NOT NULL,
			voucher_type varchar(50) NOT NULL,
			date date NOT NULL,
			party_name varchar(255) DEFAULT NULL,
			amount decimal(15,2) NOT NULL DEFAULT 0.00,
			description text,
			status varchar(20) DEFAULT 'draft',
			created_by bigint(20) unsigned NOT NULL,
			created_at datetime DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY (id),
			UNIQUE KEY voucher_no (voucher_no),
			KEY voucher_type (voucher_type),
			KEY date (date),
			KEY status (status)
		) $charset_collate;";
		
		require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
		dbDelta( $sql );
	}
	
	/**
	 * Create Invoices tables
	 */
	private static function create_invoices_tables( $charset_collate ) {
		global $wpdb;
		
		$table_name = $wpdb->prefix . 'erp_invoices';
		
		$sql = "CREATE TABLE IF NOT EXISTS $table_name (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			invoice_no varchar(50) NOT NULL,
			contact_id bigint(20) unsigned DEFAULT NULL,
			invoice_date date NOT NULL,
			due_date date DEFAULT NULL,
			subtotal decimal(15,2) NOT NULL DEFAULT 0.00,
			tax_amount decimal(15,2) DEFAULT 0.00,
			total_amount decimal(15,2) NOT NULL DEFAULT 0.00,
			status varchar(20) DEFAULT 'draft',
			notes text,
			created_by bigint(20) unsigned NOT NULL,
			created_at datetime DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY (id),
			UNIQUE KEY invoice_no (invoice_no),
			KEY contact_id (contact_id),
			KEY invoice_date (invoice_date),
			KEY status (status)
		) $charset_collate;";
		
		require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
		dbDelta( $sql );
		
		// Invoice items
		$table_name = $wpdb->prefix . 'erp_invoice_items';
		
		$sql = "CREATE TABLE IF NOT EXISTS $table_name (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			invoice_id bigint(20) unsigned NOT NULL,
			item_name varchar(255) NOT NULL,
			description text,
			quantity decimal(10,2) DEFAULT 1.00,
			unit_price decimal(15,2) NOT NULL,
			total decimal(15,2) NOT NULL,
			PRIMARY KEY (id),
			KEY invoice_id (invoice_id)
		) $charset_collate;";
		
		dbDelta( $sql );
	}
	
	/**
	 * Create Expenses tables
	 */
	private static function create_expenses_tables( $charset_collate ) {
		global $wpdb;
		
		$table_name = $wpdb->prefix . 'erp_expenses';
		
		$sql = "CREATE TABLE IF NOT EXISTS $table_name (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			expense_no varchar(50) NOT NULL,
			expense_type varchar(50) NOT NULL,
			date date NOT NULL,
			amount decimal(15,2) NOT NULL,
			description text,
			category varchar(100) DEFAULT NULL,
			payment_method varchar(50) DEFAULT NULL,
			receipt_url varchar(500) DEFAULT NULL,
			status varchar(20) DEFAULT 'pending',
			created_by bigint(20) unsigned NOT NULL,
			created_at datetime DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY (id),
			UNIQUE KEY expense_no (expense_no),
			KEY expense_type (expense_type),
			KEY date (date),
			KEY category (category),
			KEY status (status)
		) $charset_collate;";
		
		require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
		dbDelta( $sql );
	}
	
	/**
	 * Create Donations tables
	 */
	private static function create_donations_table( $charset_collate ) {
		global $wpdb;
		
		$table_name = $wpdb->prefix . 'erp_donations';
		
		$sql = "CREATE TABLE IF NOT EXISTS $table_name (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			donor_name varchar(255) NOT NULL,
			phone varchar(50) NOT NULL,
			ledger varchar(100) NOT NULL,
			amount decimal(10,2) NOT NULL,
			notes text,
			issue_date date NOT NULL,
			created_by bigint(20) unsigned DEFAULT NULL,
			created_at datetime DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY (id),
			KEY donor_name (donor_name),
			KEY phone (phone),
			KEY issue_date (issue_date)
		) $charset_collate;";
		
		require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
		dbDelta( $sql );
	}
	
	/**
	 * Create Food Pass tables
	 */
	private static function create_food_pass_tables( $charset_collate ) {
		global $wpdb;
		
		$table_name = $wpdb->prefix . 'erp_food_passes';
		
		$sql = "CREATE TABLE IF NOT EXISTS $table_name (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			pass_no varchar(50) NOT NULL,
			employee_id bigint(20) unsigned DEFAULT NULL,
			contact_id bigint(20) unsigned DEFAULT NULL,
			issue_date date NOT NULL,
			valid_from date NOT NULL,
			valid_to date NOT NULL,
			meals_per_day int(11) DEFAULT 1,
			total_meals int(11) DEFAULT 0,
			used_meals int(11) DEFAULT 0,
			status varchar(20) DEFAULT 'active',
			notes text,
			created_by bigint(20) unsigned NOT NULL,
			created_at datetime DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY (id),
			UNIQUE KEY pass_no (pass_no),
			KEY employee_id (employee_id),
			KEY contact_id (contact_id),
			KEY status (status),
			KEY valid_from (valid_from),
			KEY valid_to (valid_to)
		) $charset_collate;";
		
		require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
		dbDelta( $sql );
		
		// Food pass usage log
		$table_name = $wpdb->prefix . 'erp_food_pass_usage';
		
		$sql = "CREATE TABLE IF NOT EXISTS $table_name (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			pass_id bigint(20) unsigned NOT NULL,
			meal_date date NOT NULL,
			meal_type varchar(20) DEFAULT 'lunch',
			used_at datetime DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY (id),
			KEY pass_id (pass_id),
			KEY meal_date (meal_date)
		) $charset_collate;";
		
		dbDelta( $sql );
	}
	
	/**
	 * Create addons table
	 */
	private static function create_addons_table( $charset_collate ) {
		global $wpdb;
		
		$table_name = $wpdb->prefix . 'erp_addons';
		
		$sql = "CREATE TABLE IF NOT EXISTS $table_name (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			addon_key varchar(100) NOT NULL,
			name varchar(255) NOT NULL,
			version varchar(20) NOT NULL,
			active tinyint(1) DEFAULT 0,
			settings longtext,
			installed_at datetime DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY (id),
			UNIQUE KEY addon_key (addon_key)
		) $charset_collate;";
		
		require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
		dbDelta( $sql );
	}
}

