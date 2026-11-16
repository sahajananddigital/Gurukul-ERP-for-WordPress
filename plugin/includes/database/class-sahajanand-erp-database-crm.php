<?php
/**
 * CRM database schema
 *
 * @package Sahajanand_ERP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * CRM database schema handler.
 */
class SAHAJANAND_ERP_Database_CRM {

	/**
	 * Create all CRM tables
	 *
	 * @param string $charset_collate Optional database charset collate.
	 */
	public static function create_tables( $charset_collate = '' ) {
		global $wpdb;

		if ( empty( $charset_collate ) ) {
			$charset_collate = $wpdb->get_charset_collate();
		}

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';

		// CRM Contacts.
		$table_name = $wpdb->prefix . 'erp_crm_contacts';
		$sql        = "CREATE TABLE IF NOT EXISTS $table_name (
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
		dbDelta( $sql );

		// CRM Activities.
		$table_name = $wpdb->prefix . 'erp_crm_activities';
		$sql        = "CREATE TABLE IF NOT EXISTS $table_name (
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

		// CRM Leads.
		$table_name = $wpdb->prefix . 'erp_crm_leads';
		$sql        = "CREATE TABLE IF NOT EXISTS $table_name (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			first_name varchar(50) NOT NULL,
			last_name varchar(50) NOT NULL,
			email varchar(100) NOT NULL,
			phone varchar(50) DEFAULT NULL,
			status varchar(20) DEFAULT 'New' NOT NULL,
			created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
			updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY (id),
			KEY status (status)
		) $charset_collate;";
		dbDelta( $sql );

		// CRM Deals.
		$table_name = $wpdb->prefix . 'erp_crm_deals';
		$sql        = "CREATE TABLE IF NOT EXISTS $table_name (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			title varchar(150) NOT NULL,
			amount decimal(15,2) DEFAULT '0.00' NOT NULL,
			stage varchar(30) DEFAULT 'Prospecting' NOT NULL,
			contact_id bigint(20) unsigned DEFAULT NULL,
			organization_id bigint(20) unsigned DEFAULT NULL,
			created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
			updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY (id),
			KEY stage (stage),
			KEY contact_id (contact_id),
			KEY organization_id (organization_id)
		) $charset_collate;";
		dbDelta( $sql );

		// CRM Organizations.
		$table_name = $wpdb->prefix . 'erp_crm_organizations';
		$sql        = "CREATE TABLE IF NOT EXISTS $table_name (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			name varchar(100) NOT NULL,
			industry varchar(50) DEFAULT '' NOT NULL,
			website varchar(150) DEFAULT '' NOT NULL,
			created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
			updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY (id)
		) $charset_collate;";
		dbDelta( $sql );
	}
}
