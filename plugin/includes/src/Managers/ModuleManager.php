<?php
/**
 * Module Manager
 *
 * @package SahajanandERP\Managers
 */

declare(strict_types=1);

namespace SahajanandERP\Managers;

use SahajanandERP\Interfaces\ModuleInterface;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Manager class for ERP modules.
 */
class ModuleManager {

	/**
	 * Registered modules.
	 *
	 * @var array<string, object>
	 */
	private array $modules = array();

	/**
	 * Register a module.
	 *
	 * @param string $slug Module slug.
	 * @param object $module Module instance.
	 * @return void
	 */
	public function register_module( string $slug, object $module ): void {
		$this->modules[ $slug ] = $module;
	}

	/**
	 * Get registered modules.
	 *
	 * @return array<string, object>
	 */
	public function get_registered_modules(): array {
		return $this->modules;
	}

	/**
	 * Get registered modules (alias).
	 *
	 * @return array<string, object>
	 */
	public function get_modules(): array {
		return $this->get_registered_modules();
	}

	/**
	 * Get a specific module by slug.
	 *
	 * @param string $slug Module slug.
	 * @return object|null
	 */
	public function get_module( string $slug ): ?object {
		if ( in_array( $slug, array( 'invoices', 'vouchers', 'expenses' ), true ) ) {
			$accounting = $this->modules['accounting'] ?? null;
			if ( $accounting && isset( $accounting->$slug ) && $accounting->$slug ) {
				return $accounting->$slug;
			}
			return $accounting;
		}

		return $this->modules[ $slug ] ?? null;
	}

	/**
	 * Check if module is active.
	 *
	 * @param string $slug Module slug.
	 * @return bool
	 */
	public function is_module_active( string $slug ): bool {
		$module = $this->get_module( $slug );
		if ( ! $module ) {
			return false;
		}

		// shortcut: all registered core modules active by default, upgrade when module toggles exist.
		return true;
	}
}
