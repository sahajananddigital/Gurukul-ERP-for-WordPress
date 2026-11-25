<?php
/**
 * Donations Module
 *
 * @package Sahajanand_ERP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class SAHAJANAND_ERP_Donations extends \SahajanandERP\Abstracts\AbstractModule {

	/**
	 * Module slug
	 *
	 * @var string
	 */
	public string $slug = 'donations';

	/**
	 * Module name
	 *
	 * @var string
	 */
	public string $name = 'Donations';

	/**
	 * Initialize module
	 */
	public function init(): void {
		// Create tables on init (simplified for this proof of concept)
		add_action( 'init', array( $this, 'create_tables' ) );
		
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	/**
	 * Create database tables
	 */
	public function create_tables() {
		global $wpdb;

		$table_name = $wpdb->prefix . 'erp_donations';
		$charset_collate = $wpdb->get_charset_collate();

		$sql = "CREATE TABLE $table_name (
			id mediumint(9) NOT NULL AUTO_INCREMENT,
			donor_name varchar(255) NOT NULL,
			phone varchar(50) NOT NULL,
			ledger varchar(100) NOT NULL,
			amount decimal(10,2) NOT NULL,
			notes text DEFAULT '',
			issue_date date NOT NULL,
			created_by bigint(20) unsigned DEFAULT NULL,
			created_at datetime DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY  (id)
		) $charset_collate;";

		require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
		dbDelta( $sql );
	}

	/**
	 * Add admin menu
	 */
	public function add_admin_menu(): void {
		add_menu_page(
			__( 'Donations', 'sahajanand-erp' ),
			__( 'Donations', 'sahajanand-erp' ),
			'erp_manage_donations',
			'sahajanand-erp-donations',
			array( $this, 'render_page' ),
			'dashicons-heart', // Heart icon for donations
			35 // Position
		);
	}

	/**
	 * Render Donations page
	 */
	public function render_page(): void {
		?>
		<div id="sahajanand-erp-donations-root"></div>
		<?php
	}

	/**
	 * Register REST API routes
	 */
	public function register_routes() {
		$namespace = 'sahajanand-erp/v1';
		$base      = 'donations';

		// Get all donations
		register_rest_route( $namespace, '/' . $base, array(
			'methods'             => 'GET',
			'callback'            => array( $this, 'get_donations' ),
			'permission_callback' => '__return_true', // Simplified for demo
		) );

		// Create donation
		register_rest_route( $namespace, '/' . $base, array(
			'methods'             => 'POST',
			'callback'            => array( $this, 'create_donation' ),
			'permission_callback' => '__return_true',
		) );
		
		// Update donation
		register_rest_route( $namespace, '/' . $base . '/(?P<id>\d+)', array(
			'methods'             => 'POST',
			'callback'            => array( $this, 'update_donation' ),
			'permission_callback' => '__return_true',
		) );
		
		// Lookup donor by phone
		register_rest_route( $namespace, '/' . $base . '/donor', array(
			'methods'             => 'GET',
			'callback'            => array( $this, 'get_donor_by_phone' ),
			'permission_callback' => '__return_true',
		) );

		// Get Ledgers
		register_rest_route( $namespace, '/' . $base . '/ledgers', array(
			'methods'             => 'GET',
			'callback'            => array( $this, 'get_ledgers' ),
			'permission_callback' => '__return_true',
		) );

		// Update Ledgers
		register_rest_route( $namespace, '/' . $base . '/ledgers', array(
			'methods'             => 'POST',
			'callback'            => array( $this, 'update_ledgers' ),
			'permission_callback' => '__return_true',
		) );
	}

	/**
	 * Get donations
	 */
	public function get_donations( $request ) {
		global $wpdb;
		$table_name = $wpdb->prefix . 'erp_donations';
		
		// Optional: Basic limit for performance
		$results = $wpdb->get_results( "SELECT * FROM $table_name ORDER BY id DESC LIMIT 100" );
		
		return rest_ensure_response( $results );
	}

	/**
	 * Create donation
	 */
	public function create_donation( $request ) {
		global $wpdb;
		$table_name = $wpdb->prefix . 'erp_donations';
		
		$params = $request->get_json_params();
		
		// Basic validation
		if ( empty( $params['donor_name'] ) || empty( $params['amount'] ) ) {
			return new WP_Error( 'missing_params', 'Name and Amount are required', array( 'status' => 400 ) );
		}

		$data = array(
			'donor_name' => sanitize_text_field( $params['donor_name'] ),
			'phone'      => sanitize_text_field( $params['phone'] ),
			'ledger'     => sanitize_text_field( $params['ledger'] ),
			'amount'     => floatval( $params['amount'] ),
			'notes'      => sanitize_textarea_field( $params['notes'] ),
			'issue_date' => !empty($params['issue_date']) ? sanitize_text_field($params['issue_date']) : current_time( 'Y-m-d' ),
			'created_at' => current_time( 'mysql' )
		);

		$format = array( '%s', '%s', '%s', '%f', '%s', '%s', '%s' );
		

		// Check/Create CRM Contact
		if ( ! empty( $params['phone'] ) ) {
			$crm_table = $wpdb->prefix . 'erp_crm_contacts';
			
			// Check if table exists to avoid errors if CRM not active
			if ( $wpdb->get_var( "SHOW TABLES LIKE '$crm_table'" ) == $crm_table ) {
				$name_parts = explode( ' ', $params['donor_name'], 2 );
				$first_name = trim( $name_parts[0] );
				$last_name = isset( $name_parts[1] ) ? trim( $name_parts[1] ) : '';

				// Check for contact with SAME phone AND SAME name
				// If phone exists but name is different, we create a new one (Father/Child case)
				$contact = $wpdb->get_row( $wpdb->prepare( 
					"SELECT id FROM $crm_table WHERE phone = %s AND first_name = %s AND last_name = %s", 
					$params['phone'], 
					$first_name,
					$last_name
				) );
				
				if ( ! $contact ) {
					// Create new contact
					$wpdb->insert( $crm_table, array(
						'first_name' => $first_name,
						'last_name'  => $last_name,
						'phone'      => $params['phone'],
						'type'       => 'contact',
						'status'     => 'lead', // Default to lead
						'created_at' => current_time( 'mysql' )
					) );
				}
			}
		}

		$wpdb->insert( $table_name, $data, $format );
		
		$new_id = $wpdb->insert_id;
		$donation = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table_name WHERE id = %d", $new_id ) );

		// Attach donor_id to response if we found/created one
		if ( ! empty( $params['phone'] ) ) {
			$crm_table = $wpdb->prefix . 'erp_crm_contacts';
			if ( $wpdb->get_var( "SHOW TABLES LIKE '$crm_table'" ) == $crm_table ) {
				$name_parts = explode( ' ', $params['donor_name'], 2 );
				$first_name = trim( $name_parts[0] );
				$last_name = isset( $name_parts[1] ) ? trim( $name_parts[1] ) : '';
				
				$contact = $wpdb->get_row( $wpdb->prepare( 
					"SELECT id FROM $crm_table WHERE phone = %s AND first_name = %s AND last_name = %s", 
					$params['phone'], 
					$first_name,
					$last_name
				) );
				
				if ( $contact ) {
					$donation->donor_id = $contact->id;
				}
			}
		}

		return rest_ensure_response( $donation );
	}
	
	/**
	 * Update donation
	 */
	public function update_donation( $request ) {
		global $wpdb;
		$table_name = $wpdb->prefix . 'erp_donations';
		$id = $request->get_param('id');
		$params = $request->get_json_params();

		$data = array();
		$format = array();

		if ( isset( $params['donor_name'] ) ) {
			$data['donor_name'] = sanitize_text_field( $params['donor_name'] );
			$format[] = '%s';
		}
		if ( isset( $params['phone'] ) ) {
			$data['phone'] = sanitize_text_field( $params['phone'] );
			$format[] = '%s';
		}
		if ( isset( $params['ledger'] ) ) {
			$data['ledger'] = sanitize_text_field( $params['ledger'] );
			$format[] = '%s';
		}
		if ( isset( $params['amount'] ) ) {
			$data['amount'] = floatval( $params['amount'] );
			$format[] = '%f';
		}
		if ( isset( $params['notes'] ) ) {
			$data['notes'] = sanitize_textarea_field( $params['notes'] );
			$format[] = '%s';
		}
		if ( isset( $params['issue_date'] ) ) {
			$data['issue_date'] = sanitize_text_field( $params['issue_date'] );
			$format[] = '%s';
		}

		if ( empty( $data ) ) {
			return new WP_Error( 'no_data', 'No data to update', array( 'status' => 400 ) );
		}

		$wpdb->update( 
			$table_name, 
			$data, 
			array( 'id' => $id ), 
			$format, 
			array( '%d' ) 
		);

		$updated = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table_name WHERE id = %d", $id ) );

		return rest_ensure_response( $updated );
	}

	/**
	 * Lookup donor by phone
	 */
	public function get_donor_by_phone( $request ) {
		global $wpdb;
		$phone = sanitize_text_field( $request->get_param( 'phone' ) );
		
		if ( empty( $phone ) ) {
			return new WP_Error( 'missing_phone', 'Phone number is required', array( 'status' => 400 ) );
		}

		// 1. Try to find the latest donation from this phone
		$donations_table = $wpdb->prefix . 'erp_donations';
		$donation = $wpdb->get_row( $wpdb->prepare( 
			"SELECT donor_name, phone, ledger FROM $donations_table WHERE phone = %s ORDER BY id DESC LIMIT 1", 
			$phone 
		) );

		if ( $donation ) {
			return rest_ensure_response( array(
				'donor_name' => $donation->donor_name,
				'phone'      => $donation->phone,
				'ledger'     => $donation->ledger,
				'source'     => 'donations'
			) );
		}

		// 2. Fallback: Search in CRM Contacts
		$crm_table = $wpdb->prefix . 'erp_crm_contacts';
		if ( $wpdb->get_var( "SHOW TABLES LIKE '$crm_table'" ) == $crm_table ) {
			$contact = $wpdb->get_row( $wpdb->prepare( 
				"SELECT first_name, last_name, phone FROM $crm_table WHERE phone = %s LIMIT 1", 
				$phone 
			) );

			if ( $contact ) {
				return rest_ensure_response( array(
					'donor_name' => trim( $contact->first_name . ' ' . $contact->last_name ),
					'phone'      => $contact->phone,
					'ledger'     => '',
					'source'     => 'crm'
				) );
			}
		}

		return rest_ensure_response( null );
	}

	/**
	 * Get Ledgers List
	 */
	public function get_ledgers() {
		$default_ledgers = array(
			'General Fund',
			'Building & Construction',
			'Thakorji Seva',
			'Annakshetra (Food Relief)',
			'Education & Bal Sanskar',
			'Festival / Utsav',
			'Goshala',
			'Medical Relief'
		);

		$ledgers = get_option( 'sahajanand_erp_donation_ledgers', $default_ledgers );
		return rest_ensure_response( $ledgers );
	}

	/**
	 * Update Ledgers List
	 */
	public function update_ledgers( $request ) {
		$params = $request->get_json_params();
		if ( ! isset( $params['ledgers'] ) || ! is_array( $params['ledgers'] ) ) {
			return new WP_Error( 'invalid_data', 'Ledgers must be an array', array( 'status' => 400 ) );
		}

		$sanitized_ledgers = array_values( array_filter( array_map( 'sanitize_text_field', $params['ledgers'] ) ) );
		update_option( 'sahajanand_erp_donation_ledgers', $sanitized_ledgers );

		return rest_ensure_response( $sanitized_ledgers );
	}
}
