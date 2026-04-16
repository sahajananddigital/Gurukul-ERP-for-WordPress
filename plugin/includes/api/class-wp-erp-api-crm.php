<?php
/**
 * CRM API Controller
 *
 * @package Gurukul_ERP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/class-wp-erp-api-controller.php';

class WP_ERP_API_CRM extends WP_ERP_API_Controller {

	/**
	 * Register routes
	 */
	public function register_routes() {
		register_rest_route( $this->namespace, '/crm/contacts', array(
			array(
				'methods' => WP_REST_Server::READABLE,
				'callback' => array( $this, 'get_contacts' ),
				'permission_callback' => array( $this, 'check_permission' ),
			),
			array(
				'methods' => WP_REST_Server::CREATABLE,
				'callback' => array( $this, 'create_contact' ),
				'permission_callback' => array( $this, 'check_permission' ),
			),
		) );

		register_rest_route( $this->namespace, '/crm/import', array(
			array(
				'methods' => WP_REST_Server::CREATABLE,
				'callback' => array( $this, 'import_contacts' ),
				'permission_callback' => array( $this, 'check_permission' ),
			),
		) );

		register_rest_route( $this->namespace, '/crm/import/sample', array(
			array(
				'methods' => WP_REST_Server::READABLE,
				'callback' => array( $this, 'download_sample_csv' ),
				'permission_callback' => array( $this, 'check_permission' ),
			),
		) );

		register_rest_route( $this->namespace, '/crm/export', array(
			array(
				'methods' => WP_REST_Server::READABLE,
				'callback' => array( $this, 'export_contacts' ),
				'permission_callback' => array( $this, 'check_permission' ),
			),
		) );
		
		register_rest_route( $this->namespace, '/crm/contacts/(?P<id>\d+)', array(
			array(
				'methods' => WP_REST_Server::READABLE,
				'callback' => array( $this, 'get_contact' ),
				'permission_callback' => array( $this, 'check_permission' ),
			),
			array(
				'methods' => WP_REST_Server::EDITABLE,
				'callback' => array( $this, 'update_contact' ),
				'permission_callback' => array( $this, 'check_permission' ),
			),
			array(
				'methods' => WP_REST_Server::DELETABLE,
				'callback' => array( $this, 'delete_contact' ),
				'permission_callback' => array( $this, 'check_permission' ),
			),
		) );
	}

	/**
	 * Get Contacts
	 */
	public function get_contacts( $request ) {
		global $wpdb;
		$table = $wpdb->prefix . 'erp_crm_contacts';
		
		$params = $request->get_params();
		$where = array( '1=1' );
		$args = array();

		// Status
		if ( ! empty( $params['status'] ) && $params['status'] !== 'all' ) {
			$where[] = 'status = %s';
			$args[] = sanitize_text_field( $params['status'] );
		}

		// Type (Student, Guardian, Teacher)
		if ( ! empty( $params['type'] ) && $params['type'] !== 'all' ) {
			$where[] = 'type = %s';
			$args[] = sanitize_text_field( $params['type'] );
		}

		// Search (Name/Email/Phone)
		if ( ! empty( $params['search'] ) ) {
			$search = '%' . $wpdb->esc_like( sanitize_text_field( $params['search'] ) ) . '%';
			$where[] = '(first_name LIKE %s OR last_name LIKE %s OR email LIKE %s OR phone LIKE %s)';
			$args[] = $search;
			$args[] = $search;
			$args[] = $search;
			$args[] = $search;
		}

		$where_sql = implode( ' AND ', $where );
		
		if ( ! empty( $args ) ) {
			$sql = $wpdb->prepare( "SELECT * FROM $table WHERE $where_sql ORDER BY created_at DESC", $args );
		} else {
			$sql = "SELECT * FROM $table WHERE $where_sql ORDER BY created_at DESC";
		}
		
		$contacts = $wpdb->get_results( $sql );

		// Set Cache Headers based on latest item.
		if ( ! empty( $contacts ) ) {
			$latest = $contacts[0]->updated_at ?? $contacts[0]->created_at;
			$this->set_cache_headers( $latest );
		}

		return rest_ensure_response( $contacts );
	}

	/**
	 * Create Contact
	 *
	 * @param WP_REST_Request $request Full data about the request.
	 * @return WP_REST_Response|WP_Error Response object on success, or WP_Error object on failure.
	 */
	public function create_contact( $request ) {
		global $wpdb;
		$table = $wpdb->prefix . 'erp_crm_contacts';

		$data = $request->get_json_params();

		$result = $wpdb->insert( $table, $data );

		if ( false === $result ) {
			return new WP_Error( 'insert_failed', __( 'Failed to create contact.', 'wp-erp' ), array( 'status' => 500 ) );
		}

		$contact_id = $wpdb->insert_id;

		/**
		 * Action after CRM contact created
		 *
		 * @param int   $contact_id Contact ID.
		 * @param array $data       Contact data.
		 */
		do_action( 'wp_erp_crm_contact_created', $contact_id, $data );

		return rest_ensure_response( array( 'id' => $contact_id ) );
	}

	/**
	 * Import Contacts from CSV
	 *
	 * @param WP_REST_Request $request Request data.
	 * @return WP_REST_Response|WP_Error Response object on success, or WP_Error object on failure.
	 */
	public function import_contacts( $request ) {
		global $wpdb;
		$table = $wpdb->prefix . 'erp_crm_contacts';

		$files = $request->get_file_params();
		if ( empty( $files['file'] ) ) {
			return new WP_Error( 'missing_file', __( 'No file uploaded.', 'wp-erp' ), array( 'status' => 400 ) );
		}

		$file_path = $files['file']['tmp_name'];
		$handle    = fopen( $file_path, 'r' );
		if ( ! $handle ) {
			return new WP_Error( 'file_error', __( 'Could not open file.', 'wp-erp' ), array( 'status' => 500 ) );
		}

		$header         = fgetcsv( $handle );
		$imported_count = 0;

		while ( ( $row = fgetcsv( $handle ) ) !== false ) {
			$contact_data = array_combine( $header, $row );

			// Sanitize and filter data.
			$sanitized_data = array();
			$allowed_keys   = array(
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
			);

			foreach ( $allowed_keys as $key ) {
				if ( isset( $contact_data[ $key ] ) ) {
					$sanitized_data[ $key ] = sanitize_text_field( $contact_data[ $key ] );
				}
			}

			if ( ! empty( $sanitized_data['first_name'] ) ) {
				$result = $wpdb->insert( $table, $sanitized_data );
				if ( $result ) {
					$imported_count++;
					do_action( 'wp_erp_crm_contact_created', $wpdb->insert_id, $sanitized_data );
				}
			}
		}

		fclose( $handle );
		return rest_ensure_response(
			array(
				'success'  => true,
				'imported' => $imported_count,
			)
		);
	}

	/**
	 * Download Sample CSV for Import
	 */
	public function download_sample_csv() {
		$headers = array(
			'first_name', 'last_name', 'email', 'phone', 'company', 
			'address_line_1', 'address_line_2', 'city', 'state', 
			'postal_code', 'country', 'birthday', 'anniversary', 
			'status', 'type'
		);

		$sample_data = array(
			'John', 'Doe', 'john@example.com', '1234567890', 'ACME Corp',
			'123 Street', '', 'City Name', 'State', 
			'12345', 'Country', '1990-01-01', '', 
			'customer', 'contact'
		);

		header( 'Content-Type: text/csv; charset=utf-8' );
		header( 'Content-Disposition: attachment; filename=crm-contacts-sample.csv' );

		$output = fopen( 'php://output', 'w' );
		fputcsv( $output, $headers );
		fputcsv( $output, $sample_data );
		fclose( $output );
		exit;
	}

	/**
	 * Export Contacts
	 */
	public function export_contacts( $request ) {
		global $wpdb;
		$table = $wpdb->prefix . 'erp_crm_contacts';
		$format = $request->get_param( 'format' ) ?: 'csv';

		$contacts = $wpdb->get_results( "SELECT * FROM $table ORDER BY created_at DESC", ARRAY_A );

		if ( $format === 'csv' ) {
			header( 'Content-Type: text/csv; charset=utf-8' );
			header( 'Content-Disposition: attachment; filename=contacts-export-' . date( 'Y-m-d' ) . '.csv' );

			$output = fopen( 'php://output', 'w' );
			if ( ! empty( $contacts ) ) {
				fputcsv( $output, array_keys( $contacts[0] ) );
				foreach ( $contacts as $contact ) {
					fputcsv( $output, $contact );
				}
			}
			fclose( $output );
			exit;
		} elseif ( $format === 'pdf' ) {
			// For PDF, we'll return a basic HTML table that can be printed or converted
			// In a real production environment, you'd use Dompdf or similar
			header( 'Content-Type: text/html; charset=utf-8' );
			?>
			<html>
			<head>
				<style>
					table { width: 100%; border-collapse: collapse; font-family: sans-serif; }
					th, td { border: 1px solid #ccc; padding: 8px; text-align: left; font-size: 12px; }
					th { background-color: #f0f0f0; }
					h1 { text-align: center; }
				</style>
			</head>
			<body onload="window.print()">
				<h1>CRM Contacts Export</h1>
				<table>
					<thead>
						<tr>
							<th>ID</th>
							<th>Name</th>
							<th>Email</th>
							<th>Phone</th>
							<th>Status</th>
							<th>Type</th>
						</tr>
					</thead>
					<tbody>
						<?php foreach ( $contacts as $contact ) : ?>
						<tr>
							<td><?php echo esc_html( $contact['id'] ); ?></td>
							<td><?php echo esc_html( $contact['first_name'] . ' ' . $contact['last_name'] ); ?></td>
							<td><?php echo esc_html( $contact['email'] ); ?></td>
							<td><?php echo esc_html( $contact['phone'] ); ?></td>
							<td><?php echo esc_html( $contact['status'] ); ?></td>
							<td><?php echo esc_html( $contact['type'] ); ?></td>
						</tr>
						<?php endforeach; ?>
					</tbody>
				</table>
			</body>
			</html>
			<?php
			exit;
		}

		return new WP_Error( 'invalid_format', __( 'Invalid export format.', 'wp-erp' ), array( 'status' => 400 ) );
	}

	/**
	 * Get Single Contact
	 */
	public function get_contact( $request ) {
		global $wpdb;
		$table = $wpdb->prefix . 'erp_crm_contacts';
		$contact = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table WHERE id = %d", $request['id'] ) );
        
        if ( $contact ) {
             $this->set_cache_headers( $contact->updated_at ?? $contact->created_at );
        }
        
		return rest_ensure_response( $contact );
	}

	/**
	 * Update Contact
	 */
	public function update_contact( $request ) {
		global $wpdb;
		$table = $wpdb->prefix . 'erp_crm_contacts';
		$data = $request->get_json_params();
		$wpdb->update( $table, $data, array( 'id' => $request['id'] ) );
		
		/**
		 * Action after CRM contact updated
		 * 
		 * @param int $contact_id
		 * @param array $data
		 */
		do_action( 'wp_erp_crm_contact_updated', $request['id'], $data );
		
		return rest_ensure_response( array( 'success' => true ) );
	}

	/**
	 * Delete Contact
	 */
	public function delete_contact( $request ) {
		global $wpdb;
		$table = $wpdb->prefix . 'erp_crm_contacts';
		$wpdb->delete( $table, array( 'id' => $request['id'] ) );
		return rest_ensure_response( array( 'success' => true ) );
	}
}
