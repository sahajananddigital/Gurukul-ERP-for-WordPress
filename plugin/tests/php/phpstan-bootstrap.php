<?php
/**
 * PHPStan bootstrap stubs for WordPress globals used by the plugin.
 *
 * @package Sahajanand_ERP
 */

define( 'ABSPATH', __DIR__ . '/../../' );
define( 'WPINC', 'wp-includes' );
define( 'HOUR_IN_SECONDS', 3600 );
define( 'ARRAY_A', 'ARRAY_A' );

if ( ! function_exists( 'plugin_dir_path' ) ) {
	/**
	 * @param string $file File path.
	 * @return string
	 */
	function plugin_dir_path( $file ) {
		return trailingslashit( dirname( $file ) );
	}
}

if ( ! function_exists( 'trailingslashit' ) ) {
	/**
	 * @param string $string Path.
	 * @return string
	 */
	function trailingslashit( $string ) {
		return rtrim( $string, '/\\' ) . '/';
	}
}
