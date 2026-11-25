<?php
/**
 * Modern WP Users <-> CRM Contacts Synchronization
 *
 * @package SahajanandERP\Managers
 */

declare(strict_types=1);

namespace SahajanandERP\Managers;

use WP_User;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Handles two-way sync between WordPress users and CRM contacts.
 */
class UserSync {

	/**
	 * Flag to prevent infinite loops.
	 *
	 * @var bool
	 */
	private bool $is_syncing = false;

	/**
	 * Constructor.
	 */
	public function __construct() {
		add_action( 'user_register', array( $this, 'sync_on_user_register' ), 10, 1 );
		add_action( 'profile_update', array( $this, 'sync_on_profile_update' ), 10, 2 );
		add_action( 'delete_user', array( $this, 'sync_on_delete_user' ), 10, 2 );

		add_action( 'sahajanand_erp_crm_contact_created', array( $this, 'sync_on_crm_contact_created' ), 10, 2 );
		add_action( 'sahajanand_erp_crm_contact_updated', array( $this, 'sync_on_crm_contact_updated' ), 10, 2 );
	}

	/**
	 * Sync on WP user registration.
	 *
	 * @param int $user_id User ID.
	 * @return void
	 */
	public function sync_on_user_register( int $user_id ): void {
		if ( $this->is_syncing ) {
			return;
		}
		$this->create_or_update_crm_contact( $user_id );
	}

	/**
	 * Sync on WP user profile update.
	 *
	 * @param int          $user_id       User ID.
	 * @param WP_User|null $old_user_data Old user data.
	 * @return void
	 */
	public function sync_on_profile_update( int $user_id, ?WP_User $old_user_data = null ): void {
		if ( $this->is_syncing ) {
			return;
		}
		$this->create_or_update_crm_contact( $user_id );
	}

	/**
	 * Sync on CRM contact creation.
	 *
	 * @param int   $contact_id Contact ID.
	 * @param array $data       Contact data.
	 * @return void
	 */
	public function sync_on_crm_contact_created( int $contact_id, array $data = array() ): void {
		if ( $this->is_syncing ) {
			return;
		}
		$this->create_or_update_wp_user( $contact_id );
	}

	/**
	 * Sync on CRM contact update.
	 *
	 * @param int   $contact_id Contact ID.
	 * @param array $data       Contact data.
	 * @return void
	 */
	public function sync_on_crm_contact_updated( int $contact_id, array $data = array() ): void {
		if ( $this->is_syncing ) {
			return;
		}
		$this->create_or_update_wp_user( $contact_id );
	}

	/**
	 * Handle CRM contact unlinking on WP user deletion.
	 *
	 * @param int      $user_id  User ID.
	 * @param int|null $reassign Reassigned user ID.
	 * @return void
	 */
	public function sync_on_delete_user( int $user_id, ?int $reassign = null ): void {
		global $wpdb;
		$table = $wpdb->prefix . 'erp_crm_contacts';
		$wpdb->query( $wpdb->prepare( "UPDATE $table SET user_id = NULL WHERE user_id = %d", $user_id ) );
	}

	/**
	 * Create or Update WP User from CRM Contact.
	 *
	 * @param int $contact_id Contact ID.
	 * @return void
	 */
	private function create_or_update_wp_user( int $contact_id ): void {
		global $wpdb;
		$this->is_syncing = true;

		$table   = $wpdb->prefix . 'erp_crm_contacts';
		$contact = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table WHERE id = %d", $contact_id ) );

		if ( ! $contact || empty( $contact->email ) ) {
			$this->is_syncing = false;
			return;
		}

		$user_id = $contact->user_id;
		$user    = $user_id ? get_userdata( (int) $user_id ) : get_user_by( 'email', $contact->email );

		$user_data = array(
			'user_email'   => $contact->email,
			'first_name'   => $contact->first_name,
			'last_name'    => $contact->last_name,
			'nickname'     => $contact->first_name,
			'display_name' => $contact->first_name . ' ' . $contact->last_name,
		);

		if ( $user ) {
			$user_data['ID'] = $user->ID;
			wp_update_user( $user_data );
			$updated_user_id = $user->ID;
		} else {
			$username = sanitize_user( (string) $contact->first_name, true );
			if ( empty( $username ) ) {
				$username = 'user';
			}

			$base_username = $username;
			$suffix        = 1;
			while ( username_exists( $username ) ) {
				$username = $base_username . $suffix;
				$suffix++;
			}

			$user_data['user_login'] = $username;
			$user_data['user_pass']  = wp_generate_password();
			$user_data['role']       = 'subscriber';
			$updated_user_id         = wp_insert_user( $user_data );
		}

		if ( ! is_wp_error( $updated_user_id ) ) {
			if ( $contact->user_id != $updated_user_id ) {
				$wpdb->update( $table, array( 'user_id' => $updated_user_id ), array( 'id' => $contact_id ) );
			}

			if ( ! empty( $contact->phone ) ) {
				update_user_meta( $updated_user_id, 'billing_phone', $contact->phone );
				update_user_meta( $updated_user_id, 'phone', $contact->phone );
			}
		}

		$this->is_syncing = false;
	}

	/**
	 * Map WP User data to CRM Contact.
	 *
	 * @param int $user_id User ID.
	 * @return void
	 */
	private function create_or_update_crm_contact( int $user_id ): void {
		global $wpdb;
		$this->is_syncing = true;

		$user = get_userdata( $user_id );
		if ( ! $user ) {
			$this->is_syncing = false;
			return;
		}

		$table = $wpdb->prefix . 'erp_crm_contacts';

		$first_name = $user->first_name;
		$last_name  = $user->last_name;

		if ( empty( $first_name ) && empty( $last_name ) ) {
			$name_parts = explode( ' ', (string) $user->display_name, 2 );
			$first_name = $name_parts[0];
			$last_name  = $name_parts[1] ?? '';
		}

		$email = $user->user_email;
		$phone = get_user_meta( $user_id, 'billing_phone', true ) ?: get_user_meta( $user_id, 'phone', true );

		$contact_data = array(
			'user_id'    => $user_id,
			'first_name' => sanitize_text_field( (string) $first_name ),
			'last_name'  => sanitize_text_field( (string) $last_name ),
			'email'      => sanitize_email( (string) $email ),
			'phone'      => sanitize_text_field( (string) $phone ),
		);

		$existing_contact = $wpdb->get_row( $wpdb->prepare( "SELECT id FROM $table WHERE user_id = %d", $user_id ) );

		if ( $existing_contact ) {
			$wpdb->update( $table, $contact_data, array( 'id' => $existing_contact->id ) );
		} else {
			$existing_by_email = $wpdb->get_row( $wpdb->prepare( "SELECT id FROM $table WHERE email = %s AND (user_id IS NULL OR user_id = 0)", $email ) );

			if ( $existing_by_email ) {
				$wpdb->update( $table, $contact_data, array( 'id' => $existing_by_email->id ) );
			} else {
				$contact_data['type']   = 'contact';
				$contact_data['status'] = 'customer';
				$wpdb->insert( $table, $contact_data );
			}
		}

		$this->is_syncing = false;
	}
}
