<?php
/**
 * Modern REST API Server
 *
 * @package SahajanandERP\API
 */

declare(strict_types=1);

namespace SahajanandERP\API;

use WP_Error;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Main REST API bootstrap and route coordinator.
 */
class Server {

	/**
	 * Controller class names to register.
	 *
	 * @var array<class-string>
	 */
	private array $controllers = array(
		General::class,
		Helpdesk::class,
		Accounting::class,
		HR::class,
		Financials::class,
		CRM::class,
		Leads::class,
		Deals::class,
		Organizations::class,
		Settings::class,
		UserAccess::class,
		Auth::class,
		Data::class,
	);

	/**
	 * Constructor.
	 */
	public function __construct() {
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
		add_filter( 'determine_current_user', array( $this, 'handle_basic_auth' ), 20 );
	}

	/**
	 * Handle Basic Authentication.
	 *
	 * @param int|false $user Current user ID or false.
	 * @return int|false
	 */
	public function handle_basic_auth( $user ) {
		if ( ! empty( $user ) ) {
			return $user;
		}

		$username = null;
		$password = null;

		if ( isset( $_SERVER['PHP_AUTH_USER'] ) ) {
			$username = sanitize_text_field( (string) $_SERVER['PHP_AUTH_USER'] );
			$password = (string) ( $_SERVER['PHP_AUTH_PW'] ?? '' );
		} elseif ( isset( $_SERVER['HTTP_AUTHORIZATION'] ) || isset( $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ) ) {
			$auth_header = (string) ( $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '' );
			if ( preg_match( '/Basic\s+(.*)$/i', $auth_header, $matches ) ) {
				$decoded     = base64_decode( $matches[1], true );
				$credentials = $decoded ? explode( ':', $decoded, 2 ) : array();
				if ( count( $credentials ) === 2 ) {
					$username = sanitize_text_field( $credentials[0] );
					$password = $credentials[1];
				}
			}
		}

		if ( ! $username ) {
			return $user;
		}

		$authenticated_user = wp_authenticate( $username, $password );

		if ( is_wp_error( $authenticated_user ) ) {
			return $user;
		}

		return $authenticated_user->ID;
	}

	/**
	 * Register all REST API routes.
	 *
	 * @return void
	 */
	public function register_routes(): void {
		foreach ( $this->controllers as $controller_class ) {
			if ( class_exists( $controller_class ) ) {
				$controller = new $controller_class();
				if ( method_exists( $controller, 'register_routes' ) ) {
					$controller->register_routes();
				}
			}
		}
	}
}
