<?php
/**
 * Module Interface
 *
 * @package SahajanandERP\Interfaces
 */

declare(strict_types=1);

namespace SahajanandERP\Interfaces;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Interface contract for all ERP modules.
 */
interface ModuleInterface {

	/**
	 * Get module slug.
	 *
	 * @return string
	 */
	public function get_slug(): string;

	/**
	 * Get module display name.
	 *
	 * @return string
	 */
	public function get_name(): string;

	/**
	 * Initialize module.
	 *
	 * @return void
	 */
	public function init(): void;

	/**
	 * Register admin menu for the module.
	 *
	 * @return void
	 */
	public function add_admin_menu(): void;
}
