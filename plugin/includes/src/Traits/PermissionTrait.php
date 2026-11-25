<?php
/**
 * Permission Trait
 *
 * @package SahajanandERP\Traits
 */

declare(strict_types=1);

namespace SahajanandERP\Traits;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Trait providing permission and capability checks for controllers and modules.
 */
trait PermissionTrait {

	/**
	 * Check base permission for ERP operations.
	 *
	 * @return bool
	 */
	public function check_permission(): bool {
		// Allow if user has manage_options capability.
		if ( current_user_can( 'manage_options' ) ) {
			return true;
		}

		// Allow logged in users.
		return is_user_logged_in();
	}

	/**
	 * Check specific capability.
	 *
	 * @param string $cap Capability name.
	 * @return bool
	 */
	public function check_cap( string $cap ): bool {
		return current_user_can( $cap );
	}
}
