<?php
/**
 * CRM Leads API
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WP_ERP_API_Leads extends WP_ERP_API_Controller {
	
	protected $namespace = 'wp-erp/v1';
	protected $rest_base = 'crm/leads';
	
	public function register_routes() {
		register_rest_route( $this->namespace, '/' . $this->rest_base, array(
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_items' ),
				'permission_callback' => array( $this, 'get_items_permissions_check' ),
			),
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'create_item' ),
				'permission_callback' => array( $this, 'create_item_permissions_check' ),
			),
		) );

		register_rest_route( $this->namespace, '/' . $this->rest_base . '/(?P<id>[\d]+)', array(
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_item' ),
				'permission_callback' => array( $this, 'get_item_permissions_check' ),
			),
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'update_item' ),
				'permission_callback' => array( $this, 'update_item_permissions_check' ),
			),
			array(
				'methods'             => WP_REST_Server::DELETABLE,
				'callback'            => array( $this, 'delete_item' ),
				'permission_callback' => array( $this, 'delete_item_permissions_check' ),
			),
		) );
	}

	public function get_items_permissions_check( $request ) {
		return current_user_can( 'manage_options' );
	}

	public function create_item_permissions_check( $request ) {
		return current_user_can( 'manage_options' );
	}

	public function get_item_permissions_check( $request ) {
		return current_user_can( 'manage_options' );
	}

	public function update_item_permissions_check( $request ) {
		return current_user_can( 'manage_options' );
	}

	public function delete_item_permissions_check( $request ) {
		return current_user_can( 'manage_options' );
	}

	public function get_items( $request ) {
		global $wpdb;
		$table = $wpdb->prefix . 'erp_crm_leads';
		
		$leads = $wpdb->get_results( "SELECT * FROM $table ORDER BY created_at DESC" );
		return rest_ensure_response( $leads );
	}

	public function create_item( $request ) {
		global $wpdb;
		$table = $wpdb->prefix . 'erp_crm_leads';
		
		$data = $request->get_json_params();
		$wpdb->insert( $table, array(
			'first_name' => sanitize_text_field( $data['first_name'] ?? '' ),
			'last_name'  => sanitize_text_field( $data['last_name'] ?? '' ),
			'email'      => sanitize_email( $data['email'] ?? '' ),
			'phone'      => sanitize_text_field( $data['phone'] ?? '' ),
			'status'     => sanitize_text_field( $data['status'] ?? 'New' )
		) );
		
		return rest_ensure_response( array( 'id' => $wpdb->insert_id ) );
	}

	public function get_item( $request ) {
		global $wpdb;
		$table = $wpdb->prefix . 'erp_crm_leads';
		$id    = (int) $request['id'];
		
		$lead = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table WHERE id = %d", $id ) );
		return rest_ensure_response( $lead );
	}

	public function update_item( $request ) {
		global $wpdb;
		$table = $wpdb->prefix . 'erp_crm_leads';
		$id    = (int) $request['id'];
		
		$data = $request->get_json_params();
		$update_data = array();
		
		if ( isset( $data['first_name'] ) ) $update_data['first_name'] = sanitize_text_field( $data['first_name'] );
		if ( isset( $data['last_name'] ) ) $update_data['last_name'] = sanitize_text_field( $data['last_name'] );
		if ( isset( $data['email'] ) ) $update_data['email'] = sanitize_email( $data['email'] );
		if ( isset( $data['phone'] ) ) $update_data['phone'] = sanitize_text_field( $data['phone'] );
		if ( isset( $data['status'] ) ) $update_data['status'] = sanitize_text_field( $data['status'] );
		
		if ( ! empty( $update_data ) ) {
			$wpdb->update( $table, $update_data, array( 'id' => $id ) );
		}
		
		return rest_ensure_response( array( 'success' => true ) );
	}

	public function delete_item( $request ) {
		global $wpdb;
		$table = $wpdb->prefix . 'erp_crm_leads';
		$id    = (int) $request['id'];
		
		$wpdb->delete( $table, array( 'id' => $id ) );
		return rest_ensure_response( array( 'success' => true ) );
	}
}
