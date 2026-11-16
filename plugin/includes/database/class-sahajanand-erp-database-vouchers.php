<?php
/**
 * Vouchers database schema
 *
 * @package Sahajanand_ERP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Vouchers database schema handler.
 */
class SAHAJANAND_ERP_Database_Vouchers {

	/**
	 * Create all vouchers tables
	 *
	 * @param string $charset_collate Optional database charset collate.
	 */
	public static function create_tables( $charset_collate = '' ) {
		global $wpdb;

		if ( empty( $charset_collate ) ) {
			$charset_collate = $wpdb->get_charset_collate();
		}

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';

		$table_name = $wpdb->prefix . 'erp_vouchers';
		$sql        = "CREATE TABLE IF NOT EXISTS $table_name (
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
		dbDelta( $sql );
	}
}
