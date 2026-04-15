<?php
/**
 * REST API Handler
 *
 * @package Gurukul_ERP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/api/class-wp-erp-api-crm.php';
require_once __DIR__ . '/api/class-wp-erp-api-donations.php';
require_once __DIR__ . '/api/class-wp-erp-api-food-pass.php';
require_once __DIR__ . '/api/class-wp-erp-api-general.php';
require_once __DIR__ . '/api/class-wp-erp-api-content.php';
require_once __DIR__ . '/api/class-wp-erp-api-quotes.php';
require_once __DIR__ . '/api/class-wp-erp-api-updates.php';
require_once __DIR__ . '/api/class-wp-erp-api-satsang.php';
require_once __DIR__ . '/api/class-wp-erp-api-programs.php';
require_once __DIR__ . '/api/class-wp-erp-api-calendar.php';
require_once __DIR__ . '/api/class-wp-erp-api-auth.php';

class WP_ERP_API {
    
    /**
     * Initialize API
     */
    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ) );
        add_filter( 'determine_current_user', array( $this, 'handle_basic_auth' ), 20 );
    }

    /**
     * Handle Basic Authentication
     * 
     * This is required for the mobile app to log in with regular WP credentials
     * since WordPress REST API doesn't support Basic Auth by default for regular passwords.
     */
    public function handle_basic_auth( $user ) {
        // If user is already determined, don't do anything
        if ( ! empty( $user ) ) {
            return $user;
        }

        $username = null;
        $password = null;

        // Try PHP_AUTH_USER
        if ( isset( $_SERVER['PHP_AUTH_USER'] ) ) {
            $username = $_SERVER['PHP_AUTH_USER'];
            $password = $_SERVER['PHP_AUTH_PW'];
        } 
        // Try HTTP_AUTHORIZATION or REDIRECT_HTTP_AUTHORIZATION (common in Apache/CGI)
        else {
            $auth_header = null;
            if ( isset( $_SERVER['HTTP_AUTHORIZATION'] ) ) {
                $auth_header = $_SERVER['HTTP_AUTHORIZATION'];
            } elseif ( isset( $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ) ) {
                $auth_header = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
            }

            if ( $auth_header && preg_match( '/Basic\s+(.*)$/i', $auth_header, $matches ) ) {
                $credentials = explode( ':', base64_decode( $matches[1] ), 2 );
                if ( count( $credentials ) === 2 ) {
                    $username = $credentials[0];
                    $password = $credentials[1];
                }
            }
        }

        if ( ! $username ) {
            return $user;
        }

        // Authenticate user
        $authenticated_user = wp_authenticate( $username, $password );

        if ( is_wp_error( $authenticated_user ) ) {
            return $user;
        }

        return $authenticated_user->ID;
    }

    /**
     * Register REST API routes
     */
    public function register_routes() {
        $general = new WP_ERP_API_General();
        $general->register_routes();

        $crm = new WP_ERP_API_CRM();
        $crm->register_routes();

        $food_pass = new WP_ERP_API_Food_Pass();
        $food_pass->register_routes();

        $donations = new WP_ERP_API_Donations();
        $donations->register_routes();
        
        $content = new WP_ERP_API_Content();
        $content->register_routes();

        $quotes = new WP_ERP_API_Quotes();
        $quotes->register_routes();

        $updates = new WP_ERP_API_Updates();
        $updates->register_routes();

        $satsang = new WP_ERP_API_Satsang();
        $satsang->register_routes();
        
        $programs = new WP_ERP_API_Programs();
        $programs->register_routes();

        $calendar = new WP_ERP_API_Calendar();
        $calendar->register_routes();

        $auth = new WP_ERP_API_Auth();
        $auth->register_routes();
    }
}
