<?php
/**
 * Invoices database schema
 *
 * @package Sahajanand_ERP
 */


declare(strict_types=1);

namespace SahajanandERP\Database;

use SahajanandERP\Interfaces\SchemaInterface;
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Invoices database schema handler.
 */
class Invoices implements SchemaInterface {

	/**
	 * Create all invoices tables
	 *
	 * @param string $charset_collate Optional database charset collate.
	 */
	public static function create_tables( $charset_collate = '' ) {
		global $wpdb;

		if ( empty( $charset_collate ) ) {
			$charset_collate = $wpdb->get_charset_collate();
		}

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';

		// Invoices.
		$table_name = $wpdb->prefix . 'erp_invoices';
		$sql        = "CREATE TABLE IF NOT EXISTS $table_name (
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
		dbDelta( $sql );

		// Invoice items.
		$table_name = $wpdb->prefix . 'erp_invoice_items';
		$sql        = "CREATE TABLE IF NOT EXISTS $table_name (
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
}
