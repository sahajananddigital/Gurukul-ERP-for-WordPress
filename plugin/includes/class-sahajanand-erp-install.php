<?php
/**
 * Installation and activation handler
 *
 * @package Sahajanand_ERP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class SAHAJANAND_ERP_Install {
	
	/**
	 * Install plugin
	 */
	public static function install() {
		// Create/Update database tables
		SAHAJANAND_ERP_Database::create_tables();
		
		// Set default options
		if ( ! get_option( 'sahajanand_erp_installed' ) ) {
			add_option( 'sahajanand_erp_installed', current_time( 'mysql' ) );
		}
		
		update_option( 'sahajanand_erp_version', SAHAJANAND_ERP_VERSION );
		
		// Flush rewrite rules
		flush_rewrite_rules();
		
		do_action( 'sahajanand_erp_installed' );
	}

	/**
	 * Check for plugin updates
	 */
	public static function check_for_updates() {
		$installed_version = get_option( 'sahajanand_erp_version' );

		if ( version_compare( $installed_version, SAHAJANAND_ERP_VERSION, '<' ) ) {
			self::install(); // Re-run install to update schema
		}
	}
	
	/**
	 * Deactivate plugin
	 */
	public static function deactivate() {
		flush_rewrite_rules();
		do_action( 'sahajanand_erp_deactivated' );
	}
}
