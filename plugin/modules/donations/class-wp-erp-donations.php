<?php
/**
 * Donations Module
 *
 * @package WP_ERP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WP_ERP_Donations {

	/**
	 * Module slug
	 *
	 * @var string
	 */
	public $slug = 'donations';

	/**
	 * Module name
	 *
	 * @var string
	 */
	public $name = 'Donations';

	/**
	 * Constructor
	 */
	public function __construct() {
		$this->init();
	}

	/**
	 * Initialize module
	 */
	private function init() {
		// Create tables on init (simplified for this proof of concept)
		add_action( 'init', array( $this, 'create_tables' ) );
		
		add_action( 'admin_menu', array( $this, 'add_admin_menu' ) );
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
	public function add_admin_menu() {
		add_menu_page(
			__( 'Donations', 'wp-erp' ),
			__( 'Donations', 'wp-erp' ),
			'erp_manage_donations',
			'wp-erp-donations',
			array( $this, 'render_page' ),
			'dashicons-heart', // Heart icon for donations
			35 // Position
		);
	}

	/**
	 * Render Donations page
	 */
	public function render_page() {
		?>
		<div id="wp-erp-donations-root"></div>
		<?php
	}

	/**
	 * Register REST API routes
	 */
	public function register_routes() {
		$namespace = 'wp-erp/v1';
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
		// We need to re-fetch the CRM contact ID effectively if we didn't just create it?
		// Actually, let's just re-query or use the one we found.
		// Optimized: We already queried it earlier.
		
		// Re-lookup or use captured ID. For simplicity/reliability in this block:
		if ( ! empty( $params['phone'] ) ) {
			$crm_table = $wpdb->prefix . 'erp_crm_contacts';
			if ( $wpdb->get_var( "SHOW TABLES LIKE '$crm_table'" ) == $crm_table ) {
				// We can reuse the same query logic to be 100% sure we get the ID associated with this phone/name combo
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
		
		$id = intval( $request['id'] );
		$params = $request->get_json_params();
		
		// Basic verification
		if ( ! $id ) {
			return new WP_Error( 'no_id', 'ID is required', array( 'status' => 400 ) );
		}

		$data = array();
		if ( isset( $params['donor_name'] ) ) $data['donor_name'] = sanitize_text_field( $params['donor_name'] );
		if ( isset( $params['phone'] ) ) $data['phone'] = sanitize_text_field( $params['phone'] );
		if ( isset( $params['ledger'] ) ) $data['ledger'] = sanitize_text_field( $params['ledger'] );
		if ( isset( $params['amount'] ) ) $data['amount'] = floatval( $params['amount'] );
		if ( isset( $params['notes'] ) ) $data['notes'] = sanitize_textarea_field( $params['notes'] );
		if ( isset( $params['issue_date'] ) ) $data['issue_date'] = sanitize_text_field( $params['issue_date'] );

		if ( ! empty( $data ) ) {
			$wpdb->update( $table_name, $data, array( 'id' => $id ) );
		}
		
		return rest_ensure_response( array( 'success' => true ) );
	}

	/**
	 * Get donor by phone
	 */
	public function get_donor_by_phone( $request ) {
		global $wpdb;
		$table_name = $wpdb->prefix . 'erp_donations';
		
		$phone = sanitize_text_field( $request->get_param( 'phone' ) );
		
		if ( empty( $phone ) ) {
			return new WP_Error( 'no_phone', 'Phone number required', array( 'status' => 400 ) );
		}

		// 1. Check CRM Contacts
		$crm_table = $wpdb->prefix . 'erp_crm_contacts';
		if ( $wpdb->get_var( "SHOW TABLES LIKE '$crm_table'" ) == $crm_table ) {
			$crm_contact = $wpdb->get_row( $wpdb->prepare( 
				"SELECT first_name, last_name FROM $crm_table WHERE phone = %s ORDER BY id DESC LIMIT 1", 
				$phone 
			) );

			if ( $crm_contact ) {
				$full_name = trim( $crm_contact->first_name . ' ' . $crm_contact->last_name );
				return rest_ensure_response( array( 'found' => true, 'donor_name' => $full_name ) );
			}
		}
		
		// Fallback removed as per requirement: "Do not fallback to past donation"
		return rest_ensure_response( array( 'found' => false ) );
	}

	/**
	 * Get Ledgers
	 */
	public function get_ledgers() {
		// Return stored ledgers or defaults
		$ledgers = get_option( 'wp_erp_donation_ledgers', array( 'General Fund', 'Education Fund', 'Building Fund' ) );
		return rest_ensure_response( $ledgers );
	}

	/**
	 * Update Ledgers
	 */
	public function update_ledgers( $request ) {
		$params = $request->get_json_params();
		$ledgers = isset( $params['ledgers'] ) ? (array) $params['ledgers'] : array();
		
		// Sanitize
		$ledgers = array_map( 'sanitize_text_field', $ledgers );
		$ledgers = array_filter( $ledgers ); // Filter empty
		
		update_option( 'wp_erp_donation_ledgers', $ledgers );
		
		return rest_ensure_response( $ledgers );
	}
}
