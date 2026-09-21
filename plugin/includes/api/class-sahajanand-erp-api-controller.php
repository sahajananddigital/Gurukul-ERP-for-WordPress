<?php
/**
 * API Controller Base Class
 *
 * @package Gurukul_ERP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

abstract class SAHAJANAND_ERP_API_Controller {

	/**
	 * Namespace
	 *
	 * @var string
	 */
	protected $namespace = 'sahajanand-erp/v1';

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
	 * @param WP_REST_Response $response The response object
	 * @param string $last_modified Last modified timestamp (e.g. '2023-01-01 12:00:00')
	 * @return WP_REST_Response
	 */
	protected function set_cache_headers( $response, $last_modified ) {
		if ( empty( $last_modified ) ) {
			return $response;
		}

		$timestamp = strtotime( $last_modified );
		
        if ( ! $timestamp ) {
            return $response;
        }

		$etag = md5( $last_modified );
		
		$response->header( 'Last-Modified', gmdate( 'D, d M Y H:i:s', $timestamp ) . ' GMT' );
		$response->header( 'ETag', '"' . $etag . '"' );
        $response->header( 'Cache-Control', 'public, max-age=3600' ); // Cache for 1 hour by default
        
        return $response;
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
