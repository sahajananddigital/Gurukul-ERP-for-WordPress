<?php
/**
 * API Controller Base Class
 *
 * @package Gurukul_ERP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

abstract class WP_ERP_API_Controller {

	/**
	 * Namespace
	 *
	 * @var string
	 */
	protected $namespace = 'wp-erp/v1';

	/**
	 * Register routes
	 */
	abstract public function register_routes();

	/**
	 * Check permission
	 *
	 * @return bool
	 */
	public function check_permission() {
		// Allow if user has manage_options capability
		if ( current_user_can( 'manage_options' ) ) {
			return true;
		}

		// Also allow if we are using Application Passwords/Auth for mobile app specific roles (future proof checks)
		return is_user_logged_in();
	}

	/**
	 * Check specific capability
	 *
	 * @param string $cap Capability to check
	 * @return bool
	 */
	public function check_cap( $cap ) {
		return current_user_can( $cap );
	}

	/**
	 * Set caching headers
	 *
	 * @param string $last_modified Last modified timestamp (e.g. '2023-01-01 12:00:00')
	 */
	protected function set_cache_headers( $last_modified ) {
		if ( empty( $last_modified ) ) {
			return;
		}

		$timestamp = strtotime( $last_modified );
		
        if ( ! $timestamp ) {
            return;
        }

		$etag = md5( $last_modified );
		
		header( 'Last-Modified: ' . gmdate( 'D, d M Y H:i:s', $timestamp ) . ' GMT' );
		header( 'ETag: "' . $etag . '"' );
        header( 'Cache-Control: public, max-age=3600' ); // Cache for 1 hour by default
	}

    /**
     * Get Database Instance
     * 
     * @return wpdb
     */
    protected function get_wpdb() {
        global $wpdb;
        return $wpdb;
    }
}
