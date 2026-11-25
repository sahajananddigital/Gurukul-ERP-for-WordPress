<?php
/**
 * Abstract API Controller Base Class
 *
 * @package SahajanandERP\Abstracts
 */

declare(strict_types=1);

namespace SahajanandERP\Abstracts;

use SahajanandERP\Interfaces\ControllerInterface;
use SahajanandERP\Traits\PermissionTrait;
use WP_REST_Response;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Abstract base class for all REST API controllers.
 */
abstract class AbstractController implements ControllerInterface {

	use PermissionTrait;

	/**
	 * REST route namespace.
	 *
	 * @var string
	 */
	protected $namespace = 'sahajanand-erp/v1';

	/**
	 * Register REST API routes.
	 *
	 * @return void
	 */
	abstract public function register_routes();

	/**
	 * Set HTTP caching headers (ETag, Last-Modified, Cache-Control).
	 *
	 * @param WP_REST_Response $response Response object.
	 * @param string|null      $last_modified Last modified timestamp string.
	 * @return WP_REST_Response
	 */
	protected function set_cache_headers( $response, ?string $last_modified = null ) {
		if ( empty( $last_modified ) ) {
			return $response;
		}

		$etag    = md5( (string) $last_modified );
		$gm_date = gmdate( 'D, d M Y H:i:s', (int) strtotime( (string) $last_modified ) ) . ' GMT';

		$response->header( 'ETag', '"' . $etag . '"' );
		$response->header( 'Last-Modified', $gm_date );
		$response->header( 'Cache-Control', 'max-age=60, must-revalidate' );

		// Check If-None-Match header.
		$if_none_match = isset( $_SERVER['HTTP_IF_NONE_MATCH'] ) ? trim( (string) wp_unslash( $_SERVER['HTTP_IF_NONE_MATCH'] ), '"' ) : '';
		if ( $if_none_match === $etag ) {
			$response->set_status( 304 );
			$response->set_data( null );
			return $response;
		}

		// Check If-Modified-Since header.
		if ( isset( $_SERVER['HTTP_IF_MODIFIED_SINCE'] ) ) {
			$if_modified_since = strtotime( (string) wp_unslash( $_SERVER['HTTP_IF_MODIFIED_SINCE'] ) );
			if ( false !== $if_modified_since && $if_modified_since >= strtotime( (string) $last_modified ) ) {
				$response->set_status( 304 );
				$response->set_data( null );
				return $response;
			}
		}

		return $response;
	}

	/**
	 * Get Database instance.
	 *
	 * @return \wpdb
	 */
	protected function get_wpdb() {
		global $wpdb;
		return $wpdb;
	}

	/**
	 * Create a formatted REST response.
	 *
	 * @param mixed $data Response payload.
	 * @param int   $status HTTP status code.
	 * @param array $headers Headers array.
	 * @return WP_REST_Response
	 */
	protected function respond( mixed $data = null, int $status = 200, array $headers = array() ): WP_REST_Response {
		return new WP_REST_Response( $data, $status, $headers );
	}
}
