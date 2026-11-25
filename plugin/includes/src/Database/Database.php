<?php
/**
 * Main Database Schema Manager
 *
 * Coordinates modular database schemas across ERP modules.
 *
 * @package SahajanandERP\Database
 */

declare(strict_types=1);

namespace SahajanandERP\Database;

use SahajanandERP\Interfaces\SchemaInterface;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Main Database manager class.
 */
class Database implements SchemaInterface {

	/**
	 * Create all database tables across all modules.
	 *
	 * @param string $charset_collate Database charset collate string.
	 * @return void
	 */
	public static function create_tables( $charset_collate = '' ) {
		global $wpdb;

		if ( empty( $charset_collate ) && is_object( $wpdb ) && method_exists( $wpdb, 'get_charset_collate' ) ) {
			$charset_collate = $wpdb->get_charset_collate();
		}

		// CRM Tables.
		CRM::create_tables( $charset_collate );

		// Accounting Tables (including vouchers, invoices, expenses).
		Accounting::create_tables( $charset_collate );

		// HR Tables.
		HR::create_tables( $charset_collate );

		// Helpdesk Tables and migrations.
		Helpdesk::create_tables( $charset_collate );

		// General, Addons, Food Pass, Donations, and Daily Content Tables.
		General::create_tables( $charset_collate );
	}
}
