<?php
/**
 * PHPUnit Bootstrap
 *
 * @package Sahajanand_ERP
 */

$_tests_dir = getenv( 'WP_TESTS_DIR' );

if ( ! $_tests_dir ) {
	$_tests_dir = rtrim( sys_get_temp_dir(), '/\\' ) . '/wordpress-tests-lib';
}

if ( ! file_exists( $_tests_dir . '/includes/functions.php' ) ) {
	throw new Exception( "Could not find $_tests_dir/includes/functions.php, have you run bin/install-wp-tests.sh ?" );
}

// The WP test suite needs the PHPUnit Polyfills library shipped in this plugin's vendor dir.
if ( ! defined( 'WP_TESTS_PHPUNIT_POLYFILLS_PATH' ) ) {
	$_polyfills_dir = dirname( __DIR__, 2 ) . '/vendor/yoast/phpunit-polyfills';
	if ( is_dir( $_polyfills_dir ) ) {
		define( 'WP_TESTS_PHPUNIT_POLYFILLS_PATH', $_polyfills_dir );
	}
	unset( $_polyfills_dir );
}

// Give access to tests_add_filter() function.
require_once $_tests_dir . '/includes/functions.php';

function _manually_load_plugin() {
	require dirname( __DIR__, 2 ) . '/sahajanand-erp.php';
}
tests_add_filter( 'muplugins_loaded', '_manually_load_plugin' );

// Start up the WP testing environment.
require $_tests_dir . '/includes/bootstrap.php';

