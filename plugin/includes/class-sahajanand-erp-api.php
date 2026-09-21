<?php
/**
 * REST API Handler
 *
 * @package Gurukul_ERP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/api/class-sahajanand-erp-api-crm.php';
require_once __DIR__ . '/api/class-sahajanand-erp-api-leads.php';
require_once __DIR__ . '/api/class-sahajanand-erp-api-deals.php';
require_once __DIR__ . '/api/class-sahajanand-erp-api-organizations.php';
require_once __DIR__ . '/api/class-sahajanand-erp-api-settings.php';
require_once __DIR__ . '/api/class-sahajanand-erp-api-user-access.php';
require_once __DIR__ . '/api/class-sahajanand-erp-api-general.php';
require_once __DIR__ . '/api/class-sahajanand-erp-api-auth.php';

class SAHAJANAND_ERP_API {
    
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
        $general = new SAHAJANAND_ERP_API_General();
        $general->register_routes();

        $crm = new SAHAJANAND_ERP_API_CRM();
        $crm->register_routes();

        $leads = new SAHAJANAND_ERP_API_Leads();
        $leads->register_routes();

        $deals = new SAHAJANAND_ERP_API_Deals();
        $deals->register_routes();

        $orgs = new SAHAJANAND_ERP_API_Organizations();
        $orgs->register_routes();

        $settings = new SAHAJANAND_ERP_API_Settings();
        $settings->register_routes();

        $user_access = new SAHAJANAND_ERP_API_User_Access();
        $user_access->register_routes();

        $auth = new SAHAJANAND_ERP_API_Auth();
        $auth->register_routes();
    }
}
