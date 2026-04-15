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
	 * Constructor
	 */
	public function __construct() {
		// Hook into WordPress user lifecycle
		add_action( 'user_register', array( $this, 'sync_on_user_register' ), 10, 1 );
		add_action( 'profile_update', array( $this, 'sync_on_profile_update' ), 10, 2 );
		add_action( 'delete_user', array( $this, 'sync_on_delete_user' ), 10, 2 );
	}

	/**
	 * Sync when a new WordPress user is registered
	 *
	 * @param int $user_id User ID.
	 */
	public function sync_on_user_register( $user_id ) {
		$this->create_or_update_crm_contact( $user_id );
	}

	/**
	 * Sync when a WordPress user profile is updated
	 *
	 * @param int     $user_id       User ID.
	 * @param WP_User $old_user_data Old user data object.
	 */
	public function sync_on_profile_update( $user_id, $old_user_data ) {
		$this->create_or_update_crm_contact( $user_id );
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

		// Option 1: Delete the CRM contact
		// $wpdb->delete( $table, array( 'user_id' => $user_id ), array( '%d' ) );

		// Option 2: Unlink the CRM contact from the WP user (keep the contact record)
		$wpdb->update(
			$table,
			array( 'user_id' => null ),
			array( 'user_id' => $user_id ),
			array( '%d' ), // user_id is now NULL (will be cast or we use direct query)
			array( '%d' )
		);
        
        // Proper way to set NULL in wpdb->update
        $wpdb->query( $wpdb->prepare( "UPDATE $table SET user_id = NULL WHERE user_id = %d", $user_id ) );
	}

	/**
	 * Core function to map WP User data to CRM Contact
	 *
	 * @param int $user_id User ID.
	 */
	private function create_or_update_crm_contact( $user_id ) {
		global $wpdb;
		
		$user = get_userdata( $user_id );
		if ( ! $user ) {
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
		
		// Attempt to get phone from user meta (often stored by WooCommerce or other plugins)
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
			// Keep existing type or default to 'contact'
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
	}
}
