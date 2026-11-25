<?php
/**
 * Accounting database schema
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
 * Accounting database schema handler.
 */
class Accounting implements SchemaInterface {

	/**
	 * Create all accounting tables (accounts, transactions, vouchers, invoices, expenses)
	 *
	 * @param string $charset_collate Optional database charset collate.
	 */
	public static function create_tables( $charset_collate = '' ) {
		global $wpdb;

		if ( empty( $charset_collate ) ) {
			$charset_collate = $wpdb->get_charset_collate();
		}

		self::create_chart_of_accounts_tables( $charset_collate );
		self::create_transaction_tables( $charset_collate );
		self::create_vouchers_tables( $charset_collate );
		self::create_invoices_tables( $charset_collate );
		self::create_expenses_tables( $charset_collate );
	}

	/**
	 * Create Chart of Accounts table
	 *
	 * @param string $charset_collate Optional database charset collate.
	 */
	public static function create_chart_of_accounts_tables( $charset_collate = '' ) {
		global $wpdb;

		if ( empty( $charset_collate ) ) {
			$charset_collate = $wpdb->get_charset_collate();
		}

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';

		$table_name = $wpdb->prefix . 'erp_accounting_chart_of_accounts';
		$sql        = "CREATE TABLE IF NOT EXISTS $table_name (
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
		dbDelta( $sql );
	}

	/**
	 * Create Transactions and entries tables
	 *
	 * @param string $charset_collate Optional database charset collate.
	 */
	public static function create_transaction_tables( $charset_collate = '' ) {
		global $wpdb;

		if ( empty( $charset_collate ) ) {
			$charset_collate = $wpdb->get_charset_collate();
		}

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';

		// Transactions.
		$table_name = $wpdb->prefix . 'erp_accounting_transactions';
		$sql        = "CREATE TABLE IF NOT EXISTS $table_name (
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

		// Transaction entries.
		$table_name = $wpdb->prefix . 'erp_accounting_transaction_entries';
		$sql        = "CREATE TABLE IF NOT EXISTS $table_name (
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
	 * Create Vouchers tables
	 *
	 * @param string $charset_collate Optional database charset collate.
	 */
	public static function create_vouchers_tables( $charset_collate = '' ) {
		Vouchers::create_tables( $charset_collate );
	}

	/**
	 * Create Invoices tables
	 *
	 * @param string $charset_collate Optional database charset collate.
	 */
	public static function create_invoices_tables( $charset_collate = '' ) {
		Invoices::create_tables( $charset_collate );
	}

	/**
	 * Create Expenses tables
	 *
	 * @param string $charset_collate Optional database charset collate.
	 */
	public static function create_expenses_tables( $charset_collate = '' ) {
		Expenses::create_tables( $charset_collate );
	}
}
