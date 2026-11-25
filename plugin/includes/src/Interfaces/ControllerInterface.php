<?php
/**
 * Controller Interface
 *
 * @package SahajanandERP\Interfaces
 */

declare(strict_types=1);

namespace SahajanandERP\Interfaces;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Interface contract for all REST API controllers.
 */
interface ControllerInterface {

	/**
	 * Register REST API routes.
	 *
	 * @return void
	 */
	public function register_routes();

	/**
	 * Check base request permission.
	 *
	 * @return bool
	 */
	public function check_permission(): bool;
}
