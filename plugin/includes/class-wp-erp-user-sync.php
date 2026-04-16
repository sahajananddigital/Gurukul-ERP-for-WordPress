<?php
/**
 * Sync WP Users with CRM Contacts
 *
 * @package WP_ERP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WP_ERP_User_Sync {

	/**
	 * Flag to prevent infinite loops
	 *
	 * @var bool
	 */
	private $is_syncing = false;

	/**
	 * Constructor
	 */
	public function __construct() {
		// Hook into WordPress user lifecycle
		add_action( 'user_register', array( $this, 'sync_on_user_register' ), 10, 1 );
		add_action( 'profile_update', array( $this, 'sync_on_profile_update' ), 10, 2 );
		add_action( 'delete_user', array( $this, 'sync_on_delete_user' ), 10, 2 );

		// Hook into CRM contact lifecycle
		add_action( 'wp_erp_crm_contact_created', array( $this, 'sync_on_crm_contact_created' ), 10, 2 );
		add_action( 'wp_erp_crm_contact_updated', array( $this, 'sync_on_crm_contact_updated' ), 10, 2 );
	}

	/**
	 * Sync when a new WordPress user is registered
	 *
	 * @param int $user_id User ID.
	 */
	public function sync_on_user_register( $user_id ) {
		if ( $this->is_syncing ) {
			return;
		}
		$this->create_or_update_crm_contact( $user_id );
	}

	/**
	 * Sync when a WordPress user profile is updated
	 *
	 * @param int     $user_id       User ID.
	 * @param WP_User $old_user_data Old user data object.
	 */
	public function sync_on_profile_update( $user_id, $old_user_data ) {
		if ( $this->is_syncing ) {
			return;
		}
		$this->create_or_update_crm_contact( $user_id );
	}

	/**
	 * Sync when a CRM contact is created via API
	 *
	 * @param int   $contact_id Contact ID.
	 * @param array $data       Contact data.
	 */
	public function sync_on_crm_contact_created( $contact_id, $data ) {
		if ( $this->is_syncing ) {
			return;
		}
		$this->create_or_update_wp_user( $contact_id );
	}

	/**
	 * Sync when a CRM contact is updated via API
	 *
	 * @param int   $contact_id Contact ID.
	 * @param array $data       Contact data.
	 */
	public function sync_on_crm_contact_updated( $contact_id, $data ) {
		if ( $this->is_syncing ) {
			return;
		}
		$this->create_or_update_wp_user( $contact_id );
	}

	/**
	 * Handle CRM contact when a WordPress user is deleted
	 *
	 * @param int      $user_id  User ID.
	 * @param int|null $reassign ID of the user to reassign posts and links to.
	 */
	public function sync_on_delete_user( $user_id, $reassign ) {
		global $wpdb;
		$table = $wpdb->prefix . 'erp_crm_contacts';

		// Unlink the CRM contact from the WP user (keep the contact record)
		$wpdb->query( $wpdb->prepare( "UPDATE $table SET user_id = NULL WHERE user_id = %d", $user_id ) );
	}

	/**
	 * Create or Update WP User from CRM Contact
	 *
	 * @param int $contact_id Contact ID.
	 */
	private function create_or_update_wp_user( $contact_id ) {
		global $wpdb;
		$this->is_syncing = true;

		$table = $wpdb->prefix . 'erp_crm_contacts';
		$contact = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table WHERE id = %d", $contact_id ) );

		if ( ! $contact || empty( $contact->email ) ) {
			$this->is_syncing = false;
			return;
		}

		$user_id = $contact->user_id;
		$user = $user_id ? get_userdata( $user_id ) : get_user_by( 'email', $contact->email );

		$user_data = array(
			'user_email' => $contact->email,
			'first_name' => $contact->first_name,
			'last_name'  => $contact->last_name,
			'nickname'   => $contact->first_name,
			'display_name' => $contact->first_name . ' ' . $contact->last_name,
		);

		if ( $user ) {
			$user_data['ID'] = $user->ID;
			wp_update_user( $user_data );
			$updated_user_id = $user->ID;
		} else {
			// Create new user
			$username = sanitize_user( $contact->first_name, true );
			if ( empty( $username ) ) {
				$username = 'user';
			}
			
			// Ensure unique username
			$base_username = $username;
			$suffix = 1;
			while ( username_exists( $username ) ) {
				$username = $base_username . $suffix;
				$suffix++;
			}

			$user_data['user_login'] = $username;
			$user_data['user_pass']  = wp_generate_password();
			$user_data['role']       = 'subscriber';
			$updated_user_id = wp_insert_user( $user_data );
		}

		if ( ! is_wp_error( $updated_user_id ) ) {
			// Update contact with user_id if not already set
			if ( $contact->user_id != $updated_user_id ) {
				$wpdb->update( $table, array( 'user_id' => $updated_user_id ), array( 'id' => $contact_id ) );
			}
			
			// Store phone in user meta
			if ( ! empty( $contact->phone ) ) {
				update_user_meta( $updated_user_id, 'billing_phone', $contact->phone );
				update_user_meta( $updated_user_id, 'phone', $contact->phone );
			}
		}

		$this->is_syncing = false;
	}

	/**
	 * Core function to map WP User data to CRM Contact
	 *
	 * @param int $user_id User ID.
	 */
	private function create_or_update_crm_contact( $user_id ) {
		global $wpdb;
		$this->is_syncing = true;
		
		$user = get_userdata( $user_id );
		if ( ! $user ) {
			$this->is_syncing = false;
			return;
		}

		$table = $wpdb->prefix . 'erp_crm_contacts';

		// Extract user data
		$first_name = $user->first_name;
		$last_name  = $user->last_name;
		
		// Fallback if first/last name are empty
		if ( empty( $first_name ) && empty( $last_name ) ) {
			$name_parts = explode( ' ', $user->display_name, 2 );
			$first_name = $name_parts[0];
			$last_name  = isset( $name_parts[1] ) ? $name_parts[1] : '';
		}

		$email = $user->user_email;
		
		// Attempt to get phone from user meta
		$phone = get_user_meta( $user_id, 'billing_phone', true );
		if ( empty( $phone ) ) {
			$phone = get_user_meta( $user_id, 'phone', true );
		}

		// Prepare CRM contact data
		$contact_data = array(
			'user_id'    => $user_id,
			'first_name' => sanitize_text_field( $first_name ),
			'last_name'  => sanitize_text_field( $last_name ),
			'email'      => sanitize_email( $email ),
			'phone'      => sanitize_text_field( $phone ),
		);

		// Check if a CRM contact already exists for this WP user
		$existing_contact = $wpdb->get_row( $wpdb->prepare( "SELECT id FROM $table WHERE user_id = %d", $user_id ) );

		if ( $existing_contact ) {
			// Update existing contact
			$wpdb->update(
				$table,
				$contact_data,
				array( 'id' => $existing_contact->id )
			);
		} else {
			// Check if a CRM contact exists with the same email but no user_id (link them)
			$existing_by_email = $wpdb->get_row( $wpdb->prepare( "SELECT id FROM $table WHERE email = %s AND (user_id IS NULL OR user_id = 0)", $email ) );
			
			if ( $existing_by_email ) {
				$wpdb->update(
					$table,
					$contact_data,
					array( 'id' => $existing_by_email->id )
				);
			} else {
				// Insert new contact
                $contact_data['type'] = 'contact';
                $contact_data['status'] = 'customer'; // active user
				$wpdb->insert( $table, $contact_data );
			}
		}

		$this->is_syncing = false;
	}
}
