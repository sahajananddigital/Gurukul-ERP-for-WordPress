<?php
/**
 * Modern ERP Data Import and Export Controller
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
 * Handles cross-module ERP data import and export for CRM, Accounting, HR, and Helpdesk.
 */
class Data extends AbstractController {

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = 'data';

	/**
	 * Dataset configurations with corresponding table and allowed columns.
	 *
	 * @var array<string, array<string, mixed>>
	 */
	private static array $datasets = array(
		'contacts'      => array(
			'table'   => 'erp_crm_contacts',
			'module'  => 'crm',
			'columns' => array(
				'first_name',
				'last_name',
				'email',
				'phone',
				'company',
				'address_line_1',
				'address_line_2',
				'city',
				'state',
				'postal_code',
				'country',
				'birthday',
				'anniversary',
				'status',
				'type',
			),
		),
		'leads'          => array(
			'table'   => 'erp_crm_leads',
			'module'  => 'crm',
			'columns' => array(
				'first_name',
				'last_name',
				'email',
				'phone',
				'status',
			),
		),
		'deals'          => array(
			'table'   => 'erp_crm_deals',
			'module'  => 'crm',
			'columns' => array(
				'title',
				'amount',
				'stage',
				'contact_id',
				'organization_id',
			),
		),
		'organizations'  => array(
			'table'   => 'erp_crm_organizations',
			'module'  => 'crm',
			'columns' => array(
				'name',
				'industry',
				'website',
			),
		),
		'accounts'       => array(
			'table'   => 'erp_accounting_chart_of_accounts',
			'module'  => 'accounting',
			'columns' => array(
				'code',
				'name',
				'type',
				'balance',
				'parent_id',
			),
		),
		'invoices'       => array(
			'table'   => 'erp_invoices',
			'module'  => 'accounting',
			'columns' => array(
				'invoice_no',
				'contact_id',
				'invoice_date',
				'due_date',
				'subtotal',
				'tax_amount',
				'total_amount',
				'status',
				'notes',
			),
		),
		'expenses'       => array(
			'table'   => 'erp_expenses',
			'module'  => 'accounting',
			'columns' => array(
				'expense_no',
				'expense_type',
				'date',
				'amount',
				'description',
				'category',
				'payment_method',
				'receipt_url',
				'status',
			),
		),
		'vouchers'       => array(
			'table'   => 'erp_vouchers',
			'module'  => 'accounting',
			'columns' => array(
				'voucher_no',
				'voucher_type',
				'date',
				'party_name',
				'amount',
				'description',
				'status',
			),
		),
		'employees'      => array(
			'table'   => 'erp_hr_employees',
			'module'  => 'hr',
			'columns' => array(
				'employee_id',
				'designation',
				'department',
				'joining_date',
				'status',
			),
		),
		'mailboxes'      => array(
			'table'   => 'erp_helpdesk_mailboxes',
			'module'  => 'helpdesk',
			'columns' => array(
				'name',
				'email_address',
				'imap_host',
				'imap_port',
				'imap_user',
				'smtp_host',
				'smtp_port',
				'smtp_user',
				'signature',
			),
		),
		'saved_replies'  => array(
			'table'   => 'erp_helpdesk_saved_replies',
			'module'  => 'helpdesk',
			'columns' => array(
				'title',
				'content',
			),
		),
		'tickets'        => array(
			'table'   => 'erp_helpdesk_tickets',
			'module'  => 'helpdesk',
			'columns' => array(
				'ticket_no',
				'subject',
				'description',
				'priority',
				'status',
			),
		),
	);

	/**
	 * Register REST routes.
	 *
	 * @return void
	 */
	public function register_routes() {
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/export',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'export_data' ),
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
					'callback'            => array( $this, 'import_data' ),
					'permission_callback' => array( $this, 'check_permission' ),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/schema',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_schema' ),
					'permission_callback' => array( $this, 'check_permission' ),
				),
			)
		);
	}

	/**
	 * Export ERP data (JSON or CSV).
	 *
	 * @param WP_REST_Request $request Request instance.
	 * @return WP_REST_Response|WP_Error|void
	 */
	public function export_data( $request ) {
		$format        = sanitize_key( $request->get_param( 'format' ) ?: 'json' );
		$module_filter = sanitize_text_field( $request->get_param( 'modules' ) ?: 'all' );
		$dataset_param = sanitize_key( $request->get_param( 'dataset' ) ?: '' );
		$is_download   = (bool) $request->get_param( 'download' );

		$active_modules = ( 'all' === $module_filter )
			? array( 'crm', 'accounting', 'hr', 'helpdesk' )
			: array_map( 'trim', explode( ',', $module_filter ) );

		if ( 'csv' === $format ) {
			return $this->export_csv( $dataset_param, $is_download );
		}

		$export_data = array();
		foreach ( self::$datasets as $key => $config ) {
			if ( ! in_array( $config['module'], $active_modules, true ) ) {
				continue;
			}

			$table = $this->get_wpdb()->prefix . $config['table'];
			$cols  = implode( ', ', array_map( 'sanitize_key', $config['columns'] ) );
			// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			$rows  = $this->get_wpdb()->get_results( "SELECT $cols FROM $table ORDER BY id ASC", ARRAY_A );

			$module = $config['module'];
			if ( ! isset( $export_data[ $module ] ) ) {
				$export_data[ $module ] = array();
			}
			$export_data[ $module ][ $key ] = $rows ? $rows : array();
		}

		$payload = array(
			'version'     => defined( 'SAHAJANAND_ERP_VERSION' ) ? SAHAJANAND_ERP_VERSION : '1.0.0',
			'exported_at' => gmdate( 'c' ),
			'type'        => 'data_backup',
			'modules'     => $active_modules,
			'data'        => $export_data,
		);

		if ( $is_download ) {
			$filename = 'sahajanand-erp-data-' . gmdate( 'Y-m-d' ) . '.json';
			header( 'Content-Type: application/json; charset=utf-8' );
			header( 'Content-Disposition: attachment; filename=' . $filename );
			echo wp_json_encode( $payload, JSON_PRETTY_PRINT );
			exit;
		}

		return rest_ensure_response( $payload );
	}

	/**
	 * Export a single dataset as CSV.
	 *
	 * @param string $dataset     Dataset identifier.
	 * @param bool   $is_download Whether to output download headers.
	 * @return WP_REST_Response|WP_Error|void
	 */
	private function export_csv( string $dataset, bool $is_download ) {
		if ( empty( $dataset ) || ! isset( self::$datasets[ $dataset ] ) ) {
			$available = implode( ', ', array_keys( self::$datasets ) );
			return new WP_Error(
				'invalid_dataset',
				/* translators: %s: available datasets list */
				sprintf( __( 'Please specify a valid dataset for CSV export. Available: %s', 'sahajanand-erp' ), $available ),
				array( 'status' => 400 )
			);
		}

		$config = self::$datasets[ $dataset ];
		$table  = $this->get_wpdb()->prefix . $config['table'];
		$cols   = implode( ', ', array_map( 'sanitize_key', $config['columns'] ) );
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$rows   = $this->get_wpdb()->get_results( "SELECT $cols FROM $table ORDER BY id ASC", ARRAY_A );

		$filename = sprintf( 'sahajanand-erp-%s-%s.csv', $dataset, gmdate( 'Y-m-d' ) );

		if ( $is_download ) {
			header( 'Content-Type: text/csv; charset=utf-8' );
			header( 'Content-Disposition: attachment; filename=' . $filename );
		}

		$output = fopen( 'php://output', 'w' );
		if ( ! $output ) {
			return new WP_Error( 'export_failed', __( 'Could not generate CSV stream.', 'sahajanand-erp' ), array( 'status' => 500 ) );
		}

		fputcsv( $output, $config['columns'] );
		if ( ! empty( $rows ) ) {
			foreach ( $rows as $row ) {
				fputcsv( $output, array_values( $row ) );
			}
		}
		fclose( $output );

		if ( $is_download ) {
			exit;
		}

		return rest_ensure_response( array( 'success' => true ) );
	}

	/**
	 * Import ERP data from JSON or CSV.
	 *
	 * @param WP_REST_Request $request Request instance.
	 * @return WP_REST_Response|WP_Error
	 */
	public function import_data( $request ) {
		$files       = $request->get_file_params();
		$mode        = sanitize_key( $request->get_param( 'mode' ) ?: 'append' );
		$csv_dataset = sanitize_key( $request->get_param( 'dataset' ) ?: '' );

		if ( ! empty( $files['file']['tmp_name'] ) ) {
			$file_path = $files['file']['tmp_name'];
			$file_name = isset( $files['file']['name'] ) ? (string) $files['file']['name'] : '';

			if ( preg_match( '/\.csv$/i', $file_name ) ) {
				return $this->import_csv_file( $file_path, $csv_dataset, $mode );
			}

			$raw_content = file_get_contents( $file_path );
			if ( false === $raw_content ) {
				return new WP_Error( 'file_read_error', __( 'Could not read uploaded file.', 'sahajanand-erp' ), array( 'status' => 400 ) );
			}
			$payload = json_decode( $raw_content, true );
		} else {
			$payload = $request->get_json_params();
		}

		if ( ! is_array( $payload ) ) {
			return new WP_Error( 'invalid_data', __( 'No valid data provided for import.', 'sahajanand-erp' ), array( 'status' => 400 ) );
		}

		$data_tree = isset( $payload['data'] ) && is_array( $payload['data'] ) ? $payload['data'] : $payload;

		$imported_counts = array();
		$errors          = array();

		foreach ( self::$datasets as $dataset_key => $config ) {
			$rows_to_insert = array();

			// Look for direct key e.g. $data_tree['contacts'].
			if ( isset( $data_tree[ $dataset_key ] ) && is_array( $data_tree[ $dataset_key ] ) ) {
				$rows_to_insert = $data_tree[ $dataset_key ];
			} elseif ( isset( $data_tree[ $config['module'] ][ $dataset_key ] ) && is_array( $data_tree[ $config['module'] ][ $dataset_key ] ) ) {
				// Nested module structure e.g. $data_tree['crm']['contacts'].
				$rows_to_insert = $data_tree[ $config['module'] ][ $dataset_key ];
			}

			if ( empty( $rows_to_insert ) ) {
				continue;
			}

			$table = $this->get_wpdb()->prefix . $config['table'];

			// Handle replace mode.
			if ( 'replace' === $mode ) {
				// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				$this->get_wpdb()->query( "TRUNCATE TABLE $table" );
			}

			$count = 0;
			foreach ( $rows_to_insert as $row ) {
				if ( ! is_array( $row ) ) {
					continue;
				}

				$insert_data = array();
				foreach ( $config['columns'] as $col ) {
					if ( isset( $row[ $col ] ) ) {
						$insert_data[ $col ] = sanitize_text_field( (string) $row[ $col ] );
					}
				}

				if ( ! empty( $insert_data ) ) {
					$res = $this->get_wpdb()->insert( $table, $insert_data );
					if ( false !== $res ) {
						$count++;
					} else {
						$errors[] = sprintf( 'Failed to insert row into %s: %s', $dataset_key, $this->get_wpdb()->last_error );
					}
				}
			}

			$imported_counts[ $dataset_key ] = $count;
		}

		do_action( 'sahajanand_erp_data_imported', $imported_counts, $mode );

		return rest_ensure_response(
			array(
				'success'  => true,
				'mode'     => $mode,
				'imported' => $imported_counts,
				'total'    => array_sum( $imported_counts ),
				'errors'   => $errors,
			)
		);
	}

	/**
	 * Import a CSV file into a specific dataset.
	 *
	 * @param string $file_path   Path to uploaded CSV file.
	 * @param string $dataset_key Dataset key.
	 * @param string $mode        Import mode (append or replace).
	 * @return WP_REST_Response|WP_Error
	 */
	private function import_csv_file( string $file_path, string $dataset_key, string $mode ) {
		if ( empty( $dataset_key ) || ! isset( self::$datasets[ $dataset_key ] ) ) {
			return new WP_Error(
				'missing_dataset',
				__( 'Please select which dataset this CSV corresponds to (e.g. contacts, accounts, employees).', 'sahajanand-erp' ),
				array( 'status' => 400 )
			);
		}

		$config = self::$datasets[ $dataset_key ];
		$table  = $this->get_wpdb()->prefix . $config['table'];

		$handle = fopen( $file_path, 'r' );
		if ( ! $handle ) {
			return new WP_Error( 'file_error', __( 'Could not open CSV file.', 'sahajanand-erp' ), array( 'status' => 500 ) );
		}

		$header = fgetcsv( $handle );
		if ( ! is_array( $header ) ) {
			fclose( $handle );
			return new WP_Error( 'invalid_csv', __( 'CSV header row is missing or empty.', 'sahajanand-erp' ), array( 'status' => 400 ) );
		}

		// Normalize headers to snake_case trim.
		$header = array_map(
			function( $h ) {
				return strtolower( trim( (string) $h ) );
			},
			$header
		);

		if ( 'replace' === $mode ) {
			// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			$this->get_wpdb()->query( "TRUNCATE TABLE $table" );
		}

		$imported = 0;
		$errors   = array();

		while ( ( $row = fgetcsv( $handle ) ) !== false ) {
			if ( count( $header ) !== count( $row ) ) {
				continue;
			}

			$data_map = array_combine( $header, $row );
			if ( ! is_array( $data_map ) ) {
				continue;
			}

			$insert_data = array();
			foreach ( $config['columns'] as $col ) {
				if ( isset( $data_map[ $col ] ) ) {
					$insert_data[ $col ] = sanitize_text_field( (string) $data_map[ $col ] );
				}
			}

			if ( ! empty( $insert_data ) ) {
				$res = $this->get_wpdb()->insert( $table, $insert_data );
				if ( false !== $res ) {
					$imported++;
				} else {
					$errors[] = $this->get_wpdb()->last_error;
				}
			}
		}

		fclose( $handle );

		return rest_ensure_response(
			array(
				'success'  => true,
				'dataset'  => $dataset_key,
				'imported' => array( $dataset_key => $imported ),
				'total'    => $imported,
				'errors'   => $errors,
			)
		);
	}

	/**
	 * Get schema info for import/export datasets.
	 *
	 * @param WP_REST_Request $request Request instance.
	 * @return WP_REST_Response
	 */
	public function get_schema( $request ) {
		return rest_ensure_response(
			array(
				'version'  => defined( 'SAHAJANAND_ERP_VERSION' ) ? SAHAJANAND_ERP_VERSION : '1.0.0',
				'datasets' => self::$datasets,
			)
		);
	}
}
