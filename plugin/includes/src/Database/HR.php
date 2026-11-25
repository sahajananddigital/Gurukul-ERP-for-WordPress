<?php
/**
 * HR database schema
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
 * HR database schema handler.
 */
class HR implements SchemaInterface {

	/**
	 * Create all HR tables
	 *
	 * @param string $charset_collate Optional database charset collate.
	 */
	public static function create_tables( $charset_collate = '' ) {
		global $wpdb;

		if ( empty( $charset_collate ) ) {
			$charset_collate = $wpdb->get_charset_collate();
		}

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';

		// Employees.
		$table_name = $wpdb->prefix . 'erp_hr_employees';
		$sql        = "CREATE TABLE IF NOT EXISTS $table_name (
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
		dbDelta( $sql );

		// Leave requests.
		$table_name = $wpdb->prefix . 'erp_hr_leave_requests';
		$sql        = "CREATE TABLE IF NOT EXISTS $table_name (
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
}
