<?php
/**
 * General and Addon database schema
 *
 * @package Sahajanand_ERP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * General and Addon database schema handler.
 */
class SAHAJANAND_ERP_Database_General {

	/**
	 * Create all general, addons, food pass, donations, and daily content tables
	 *
	 * @param string $charset_collate Optional database charset collate.
	 */
	public static function create_tables( $charset_collate = '' ) {
		global $wpdb;

		if ( empty( $charset_collate ) ) {
			$charset_collate = $wpdb->get_charset_collate();
		}

		self::create_addons_table( $charset_collate );
		self::create_food_pass_tables( $charset_collate );
		self::create_donations_table( $charset_collate );
		self::create_daily_quotes_table( $charset_collate );
		self::create_daily_updates_table( $charset_collate );
		self::create_daily_satsang_table( $charset_collate );
		self::create_daily_programs_table( $charset_collate );
		self::create_calendar_events_table( $charset_collate );
	}

	/**
	 * Create addons table
	 *
	 * @param string $charset_collate Optional database charset collate.
	 */
	public static function create_addons_table( $charset_collate = '' ) {
		global $wpdb;

		if ( empty( $charset_collate ) ) {
			$charset_collate = $wpdb->get_charset_collate();
		}

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';

		$table_name = $wpdb->prefix . 'erp_addons';
		$sql        = "CREATE TABLE IF NOT EXISTS $table_name (
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
		dbDelta( $sql );
	}

	/**
	 * Create Food Pass tables
	 *
	 * @param string $charset_collate Optional database charset collate.
	 */
	public static function create_food_pass_tables( $charset_collate = '' ) {
		global $wpdb;

		if ( empty( $charset_collate ) ) {
			$charset_collate = $wpdb->get_charset_collate();
		}

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';

		$table_name = $wpdb->prefix . 'erp_food_passes';
		$sql        = "CREATE TABLE IF NOT EXISTS $table_name (
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
		dbDelta( $sql );

		// Food pass usage log.
		$table_name = $wpdb->prefix . 'erp_food_pass_usage';
		$sql        = "CREATE TABLE IF NOT EXISTS $table_name (
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
	 * Create Donations table
	 *
	 * @param string $charset_collate Optional database charset collate.
	 */
	public static function create_donations_table( $charset_collate = '' ) {
		global $wpdb;

		if ( empty( $charset_collate ) ) {
			$charset_collate = $wpdb->get_charset_collate();
		}

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';

		$table_name = $wpdb->prefix . 'erp_donations';
		$sql        = "CREATE TABLE IF NOT EXISTS $table_name (
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
		dbDelta( $sql );
	}

	/**
	 * Create Daily Quick Quotes table
	 *
	 * @param string $charset_collate Optional database charset collate.
	 */
	public static function create_daily_quotes_table( $charset_collate = '' ) {
		global $wpdb;

		if ( empty( $charset_collate ) ) {
			$charset_collate = $wpdb->get_charset_collate();
		}

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';

		$table_name = $wpdb->prefix . 'erp_daily_quotes';
		$sql        = "CREATE TABLE IF NOT EXISTS $table_name (
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
		dbDelta( $sql );
	}

	/**
	 * Create Daily Updates table
	 *
	 * @param string $charset_collate Optional database charset collate.
	 */
	public static function create_daily_updates_table( $charset_collate = '' ) {
		global $wpdb;

		if ( empty( $charset_collate ) ) {
			$charset_collate = $wpdb->get_charset_collate();
		}

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';

		$table_name = $wpdb->prefix . 'erp_daily_updates';
		$sql        = "CREATE TABLE IF NOT EXISTS $table_name (
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
		dbDelta( $sql );
	}

	/**
	 * Create Daily Satsang table
	 *
	 * @param string $charset_collate Optional database charset collate.
	 */
	public static function create_daily_satsang_table( $charset_collate = '' ) {
		global $wpdb;

		if ( empty( $charset_collate ) ) {
			$charset_collate = $wpdb->get_charset_collate();
		}

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';

		$table_name = $wpdb->prefix . 'erp_daily_satsang';
		$sql        = "CREATE TABLE IF NOT EXISTS $table_name (
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
		dbDelta( $sql );
	}

	/**
	 * Create Daily Programs table
	 *
	 * @param string $charset_collate Optional database charset collate.
	 */
	public static function create_daily_programs_table( $charset_collate = '' ) {
		global $wpdb;

		if ( empty( $charset_collate ) ) {
			$charset_collate = $wpdb->get_charset_collate();
		}

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';

		$table_name = $wpdb->prefix . 'erp_daily_programs';
		$sql        = "CREATE TABLE IF NOT EXISTS $table_name (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			program_date date NOT NULL,
			image_id bigint(20) unsigned NOT NULL,
			created_at datetime DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY (id),
			KEY program_date (program_date),
			KEY created_at (created_at)
		) $charset_collate;";
		dbDelta( $sql );
	}

	/**
	 * Create Calendar Events table
	 *
	 * @param string $charset_collate Optional database charset collate.
	 */
	public static function create_calendar_events_table( $charset_collate = '' ) {
		global $wpdb;

		if ( empty( $charset_collate ) ) {
			$charset_collate = $wpdb->get_charset_collate();
		}

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';

		$table_name = $wpdb->prefix . 'erp_calendar_events';
		$sql        = "CREATE TABLE IF NOT EXISTS $table_name (
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
		dbDelta( $sql );
	}
}
