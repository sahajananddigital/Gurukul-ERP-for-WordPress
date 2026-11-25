<?php
/**
 * Database Schema Interface
 *
 * @package SahajanandERP\Interfaces
 */

declare(strict_types=1);

namespace SahajanandERP\Interfaces;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Interface contract for database schema and migration definitions.
 */
interface SchemaInterface {

	/**
	 * Create database tables for module.
	 *
	 * @param string $charset_collate Database charset collate string.
	 * @return void
	 */
	public static function create_tables( $charset_collate = '' );
}
