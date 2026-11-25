<?php
/**
 * Modern Installation and Activation Handler
 *
 * @package SahajanandERP
 */

declare(strict_types=1);

namespace SahajanandERP;

use SahajanandERP\Database\Database;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Handles plugin installation, upgrades, and deactivation.
 */
class Install {

	/**
	 * Install plugin.
	 *
	 * @return void
	 */
	public static function install(): void {
		Database::create_tables();

		if ( ! get_option( 'sahajanand_erp_installed' ) ) {
			add_option( 'sahajanand_erp_installed', current_time( 'mysql' ) );
		}

		update_option( 'sahajanand_erp_version', SAHAJANAND_ERP_VERSION );

		flush_rewrite_rules();

		do_action( 'sahajanand_erp_installed' );
	}

	/**
	 * Check for plugin updates.
	 *
	 * @return void
	 */
	public static function check_for_updates(): void {
		$installed_version = get_option( 'sahajanand_erp_version' );

		if ( version_compare( (string) $installed_version, SAHAJANAND_ERP_VERSION, '<' ) ) {
			self::install();
		}
	}

	/**
	 * Deactivate plugin.
	 *
	 * @return void
	 */
	public static function deactivate(): void {
		flush_rewrite_rules();
		do_action( 'sahajanand_erp_deactivated' );
	}
}
