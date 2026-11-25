<?php
/**
 * Modern Settings API Controller
 *
 * @package SahajanandERP\API
 */

declare(strict_types=1);

namespace SahajanandERP\API;

use SahajanandERP\Abstracts\AbstractController;
use WP_REST_Server;
use WP_Error;
use WP_REST_Response;
use WP_REST_Request;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Controller for general settings and settings import/export.
 */
class Settings extends AbstractController {

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = 'settings';

	/**
	 * Register routes.
	 *
	 * @return void
	 */
	public function register_routes() {
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base,
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_settings' ),
					'permission_callback' => array( $this, 'check_permission' ),
				),
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'update_settings' ),
					'permission_callback' => array( $this, 'check_permission' ),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/export',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'export_settings' ),
					'permission_callback' => array( $this, 'check_permission' ),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/import',
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'import_settings' ),
					'permission_callback' => array( $this, 'check_permission' ),
				),
			)
		);
	}

	/**
	 * Get ERP settings.
	 *
	 * @param WP_REST_Request $request Request instance.
	 * @return WP_REST_Response
	 */
	public function get_settings( $request ) {
		$defaults = array(
			'company_name'   => '',
			'currency'       => 'USD',
			'date_format'    => 'Y-m-d',
			'fiscal_year_end'=> '12-31',
		);
		$settings = wp_parse_args( get_option( 'sahajanand_erp_settings', array() ), $defaults );
		return rest_ensure_response( $settings );
	}

	/**
	 * Update ERP settings.
	 *
	 * @param WP_REST_Request $request Request instance.
	 * @return WP_REST_Response
	 */
	public function update_settings( $request ) {
		$data     = $request->get_json_params();
		$settings = get_option( 'sahajanand_erp_settings', array() );

		$allowed_fields = array(
			'company_name'    => 'sanitize_text_field',
			'currency'        => 'sanitize_text_field',
			'date_format'     => 'sanitize_text_field',
			'fiscal_year_end' => 'sanitize_text_field',
			'email'           => 'sanitize_email',
			'phone'           => 'sanitize_text_field',
			'address'         => 'sanitize_textarea_field',
		);

		foreach ( $allowed_fields as $field => $sanitizer ) {
			if ( isset( $data[ $field ] ) ) {
				$settings[ $field ] = call_user_func( $sanitizer, $data[ $field ] );
			}
		}

		update_option( 'sahajanand_erp_settings', $settings );

		return rest_ensure_response(
			array(
				'success'  => true,
				'settings' => $settings,
			)
		);
	}

	/**
	 * Export ERP settings to JSON.
	 *
	 * @param WP_REST_Request $request Request instance.
	 * @return WP_REST_Response|void
	 */
	public function export_settings( $request ) {
		$settings       = get_option( 'sahajanand_erp_settings', array() );
		$active_modules = get_option( 'sahajanand_erp_active_modules', array() );

		$payload = array(
			'version'        => defined( 'SAHAJANAND_ERP_VERSION' ) ? SAHAJANAND_ERP_VERSION : '1.0.0',
			'exported_at'    => gmdate( 'c' ),
			'type'           => 'settings',
			'settings'       => $settings,
			'active_modules' => $active_modules,
		);

		if ( $request->get_param( 'download' ) ) {
			$filename = 'sahajanand-erp-settings-' . gmdate( 'Y-m-d' ) . '.json';
			header( 'Content-Type: application/json; charset=utf-8' );
			header( 'Content-Disposition: attachment; filename=' . $filename );
			echo wp_json_encode( $payload, JSON_PRETTY_PRINT );
			exit;
		}

		return rest_ensure_response( $payload );
	}

	/**
	 * Import ERP settings from JSON.
	 *
	 * @param WP_REST_Request $request Request instance.
	 * @return WP_REST_Response|WP_Error
	 */
	public function import_settings( $request ) {
		$files = $request->get_file_params();
		$payload = null;

		if ( ! empty( $files['file']['tmp_name'] ) ) {
			$raw_content = file_get_contents( $files['file']['tmp_name'] );
			if ( $raw_content === false ) {
				return new WP_Error( 'file_read_error', __( 'Could not read uploaded settings file.', 'sahajanand-erp' ), array( 'status' => 400 ) );
			}
			$payload = json_decode( $raw_content, true );
		} else {
			$payload = $request->get_json_params();
		}

		if ( ! is_array( $payload ) ) {
			return new WP_Error( 'invalid_json', __( 'Invalid JSON payload provided.', 'sahajanand-erp' ), array( 'status' => 400 ) );
		}

		$settings_data = isset( $payload['settings'] ) && is_array( $payload['settings'] )
			? $payload['settings']
			: $payload;

		$current_settings = get_option( 'sahajanand_erp_settings', array() );

		$allowed_fields = array(
			'company_name'    => 'sanitize_text_field',
			'currency'        => 'sanitize_text_field',
			'date_format'     => 'sanitize_text_field',
			'fiscal_year_end' => 'sanitize_text_field',
			'email'           => 'sanitize_email',
			'phone'           => 'sanitize_text_field',
			'address'         => 'sanitize_textarea_field',
		);

		foreach ( $allowed_fields as $field => $sanitizer ) {
			if ( isset( $settings_data[ $field ] ) ) {
				$current_settings[ $field ] = call_user_func( $sanitizer, $settings_data[ $field ] );
			}
		}

		update_option( 'sahajanand_erp_settings', $current_settings );

		if ( isset( $payload['active_modules'] ) && is_array( $payload['active_modules'] ) ) {
			$sanitized_modules = array_map( 'sanitize_key', $payload['active_modules'] );
			update_option( 'sahajanand_erp_active_modules', $sanitized_modules );
		}

		do_action( 'sahajanand_erp_settings_imported', $current_settings );

		return rest_ensure_response(
			array(
				'success'  => true,
				'message'  => __( 'Settings imported successfully.', 'sahajanand-erp' ),
				'settings' => $current_settings,
			)
		);
	}
}
