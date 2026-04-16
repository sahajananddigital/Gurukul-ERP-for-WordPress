<?php
/**
 * Installation and activation handler
 *
 * @package WP_ERP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WP_ERP_Install {
	
	/**
	 * Install plugin
	 */
	public static function install() {
		// Create/Update database tables
		WP_ERP_Database::create_tables();
		
		// Set default options
		if ( ! get_option( 'wp_erp_installed' ) ) {
			add_option( 'wp_erp_installed', current_time( 'mysql' ) );
		}
		
		update_option( 'wp_erp_version', WP_ERP_VERSION );
		
		// Flush rewrite rules
		flush_rewrite_rules();
		
		do_action( 'wp_erp_installed' );
	}

	/**
	 * Check for plugin updates
	 */
	public static function check_for_updates() {
		$installed_version = get_option( 'wp_erp_version' );

		if ( version_compare( $installed_version, WP_ERP_VERSION, '<' ) ) {
			self::install(); // Re-run install to update schema
		}
	}
	
	/**
	 * Deactivate plugin
	 */
	public static function deactivate() {
		flush_rewrite_rules();
		do_action( 'wp_erp_deactivated' );
	}
}
