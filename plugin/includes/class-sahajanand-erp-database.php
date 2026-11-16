<?php
/**
 * Database schema and migrations manager
 *
 * Coordinates modular database schemas across ERP modules.
 *
 * @package Sahajanand_ERP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Load per-module database schema files.
require_once __DIR__ . '/database/class-sahajanand-erp-database-crm.php';
require_once __DIR__ . '/database/class-sahajanand-erp-database-invoices.php';
require_once __DIR__ . '/database/class-sahajanand-erp-database-vouchers.php';
require_once __DIR__ . '/database/class-sahajanand-erp-database-expenses.php';
require_once __DIR__ . '/database/class-sahajanand-erp-database-accounting.php';
require_once __DIR__ . '/database/class-sahajanand-erp-database-hr.php';
require_once __DIR__ . '/database/class-sahajanand-erp-database-helpdesk.php';
require_once __DIR__ . '/database/class-sahajanand-erp-database-general.php';

/**
 * Main Database manager class.
 */
class SAHAJANAND_ERP_Database {

	/**
	 * Create all database tables across all modules
	 */
	public static function create_tables() {
		global $wpdb;

		$charset_collate = $wpdb->get_charset_collate();

		// CRM Tables.
		SAHAJANAND_ERP_Database_CRM::create_tables( $charset_collate );

		// Accounting Tables (including vouchers, invoices, expenses).
		SAHAJANAND_ERP_Database_Accounting::create_tables( $charset_collate );

		// HR Tables.
		SAHAJANAND_ERP_Database_HR::create_tables( $charset_collate );

		// Helpdesk Tables and migrations.
		SAHAJANAND_ERP_Database_Helpdesk::create_tables( $charset_collate );

		// General, Addons, Food Pass, Donations, and Daily Content Tables.
		SAHAJANAND_ERP_Database_General::create_tables( $charset_collate );
	}

	/**
	 * Create CRM tables (delegates to SAHAJANAND_ERP_Database_CRM)
	 *
	 * @param string $charset_collate Optional charset collate.
	 */
	public static function create_crm_tables( $charset_collate = '' ) {
		SAHAJANAND_ERP_Database_CRM::create_tables( $charset_collate );
	}

	/**
	 * Create Accounting tables (delegates to SAHAJANAND_ERP_Database_Accounting)
	 *
	 * @param string $charset_collate Optional charset collate.
	 */
	public static function create_accounting_tables( $charset_collate = '' ) {
		SAHAJANAND_ERP_Database_Accounting::create_tables( $charset_collate );
	}

	/**
	 * Create HR tables (delegates to SAHAJANAND_ERP_Database_HR)
	 *
	 * @param string $charset_collate Optional charset collate.
	 */
	public static function create_hr_tables( $charset_collate = '' ) {
		SAHAJANAND_ERP_Database_HR::create_tables( $charset_collate );
	}

	/**
	 * Create Helpdesk tables (delegates to SAHAJANAND_ERP_Database_Helpdesk)
	 *
	 * @param string $charset_collate Optional charset collate.
	 */
	public static function create_helpdesk_tables( $charset_collate = '' ) {
		SAHAJANAND_ERP_Database_Helpdesk::create_tables( $charset_collate );
	}

	/**
	 * Create Vouchers tables (delegates to SAHAJANAND_ERP_Database_Vouchers)
	 *
	 * @param string $charset_collate Optional charset collate.
	 */
	public static function create_vouchers_tables( $charset_collate = '' ) {
		SAHAJANAND_ERP_Database_Vouchers::create_tables( $charset_collate );
	}

	/**
	 * Create Invoices tables (delegates to SAHAJANAND_ERP_Database_Invoices)
	 *
	 * @param string $charset_collate Optional charset collate.
	 */
	public static function create_invoices_tables( $charset_collate = '' ) {
		SAHAJANAND_ERP_Database_Invoices::create_tables( $charset_collate );
	}

	/**
	 * Create Expenses tables (delegates to SAHAJANAND_ERP_Database_Expenses)
	 *
	 * @param string $charset_collate Optional charset collate.
	 */
	public static function create_expenses_tables( $charset_collate = '' ) {
		SAHAJANAND_ERP_Database_Expenses::create_tables( $charset_collate );
	}

	/**
	 * Create Addons table (delegates to SAHAJANAND_ERP_Database_General)
	 *
	 * @param string $charset_collate Optional charset collate.
	 */
	public static function create_addons_table( $charset_collate = '' ) {
		SAHAJANAND_ERP_Database_General::create_addons_table( $charset_collate );
	}

	/**
	 * Create Food Pass tables (delegates to SAHAJANAND_ERP_Database_General)
	 *
	 * @param string $charset_collate Optional charset collate.
	 */
	public static function create_food_pass_tables( $charset_collate = '' ) {
		SAHAJANAND_ERP_Database_General::create_food_pass_tables( $charset_collate );
	}

	/**
	 * Create Donations table (delegates to SAHAJANAND_ERP_Database_General)
	 *
	 * @param string $charset_collate Optional charset collate.
	 */
	public static function create_donations_table( $charset_collate = '' ) {
		SAHAJANAND_ERP_Database_General::create_donations_table( $charset_collate );
	}

	/**
	 * Create Daily Quotes table (delegates to SAHAJANAND_ERP_Database_General)
	 *
	 * @param string $charset_collate Optional charset collate.
	 */
	public static function create_daily_quotes_table( $charset_collate = '' ) {
		SAHAJANAND_ERP_Database_General::create_daily_quotes_table( $charset_collate );
	}

	/**
	 * Create Daily Updates table (delegates to SAHAJANAND_ERP_Database_General)
	 *
	 * @param string $charset_collate Optional charset collate.
	 */
	public static function create_daily_updates_table( $charset_collate = '' ) {
		SAHAJANAND_ERP_Database_General::create_daily_updates_table( $charset_collate );
	}

	/**
	 * Create Daily Satsang table (delegates to SAHAJANAND_ERP_Database_General)
	 *
	 * @param string $charset_collate Optional charset collate.
	 */
	public static function create_daily_satsang_table( $charset_collate = '' ) {
		SAHAJANAND_ERP_Database_General::create_daily_satsang_table( $charset_collate );
	}

	/**
	 * Create Daily Programs table (delegates to SAHAJANAND_ERP_Database_General)
	 *
	 * @param string $charset_collate Optional charset collate.
	 */
	public static function create_daily_programs_table( $charset_collate = '' ) {
		SAHAJANAND_ERP_Database_General::create_daily_programs_table( $charset_collate );
	}

	/**
	 * Create Calendar Events table (delegates to SAHAJANAND_ERP_Database_General)
	 *
	 * @param string $charset_collate Optional charset collate.
	 */
	public static function create_calendar_events_table( $charset_collate = '' ) {
		SAHAJANAND_ERP_Database_General::create_calendar_events_table( $charset_collate );
	}

	/**
	 * Migrate Helpdesk ticket columns (delegates to SAHAJANAND_ERP_Database_Helpdesk)
	 */
	public static function migrate_helpdesk_ticket_columns() {
		SAHAJANAND_ERP_Database_Helpdesk::migrate_ticket_columns();
	}

	/**
	 * Migrate Helpdesk message formatting (delegates to SAHAJANAND_ERP_Database_Helpdesk)
	 */
	public static function migrate_helpdesk_message_formatting() {
		SAHAJANAND_ERP_Database_Helpdesk::migrate_message_formatting();
	}
}
