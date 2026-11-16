<?php
/**
 * Expenses database schema
 *
 * @package Sahajanand_ERP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Expenses database schema handler.
 */
class SAHAJANAND_ERP_Database_Expenses {

	/**
	 * Create all expenses tables
	 *
	 * @param string $charset_collate Optional database charset collate.
	 */
	public static function create_tables( $charset_collate = '' ) {
		global $wpdb;

		if ( empty( $charset_collate ) ) {
			$charset_collate = $wpdb->get_charset_collate();
		}

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';

		$table_name = $wpdb->prefix . 'erp_expenses';
		$sql        = "CREATE TABLE IF NOT EXISTS $table_name (
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
		dbDelta( $sql );
	}
}
