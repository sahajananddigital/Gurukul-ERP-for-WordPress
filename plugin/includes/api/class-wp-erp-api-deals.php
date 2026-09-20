<?php
/**
 * CRM Deals API
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WP_ERP_API_Deals extends WP_ERP_API_Controller {
	
	protected $namespace = 'wp-erp/v1';
	protected $rest_base = 'crm/deals';
	
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
		$table = $wpdb->prefix . 'erp_crm_deals';
		
		$deals = $wpdb->get_results( "SELECT * FROM $table ORDER BY created_at DESC" );
		return rest_ensure_response( $deals );
	}

	public function create_item( $request ) {
		global $wpdb;
		$table = $wpdb->prefix . 'erp_crm_deals';
		
		$data = $request->get_json_params();
		$wpdb->insert( $table, array(
			'title'           => sanitize_text_field( $data['title'] ?? '' ),
			'amount'          => floatval( $data['amount'] ?? 0 ),
			'stage'           => sanitize_text_field( $data['stage'] ?? 'Prospecting' ),
			'contact_id'      => isset( $data['contact_id'] ) ? (int) $data['contact_id'] : null,
			'organization_id' => isset( $data['organization_id'] ) ? (int) $data['organization_id'] : null
		) );
		
		return rest_ensure_response( array( 'id' => $wpdb->insert_id ) );
	}

	public function get_item( $request ) {
		global $wpdb;
		$table = $wpdb->prefix . 'erp_crm_deals';
		$id    = (int) $request['id'];
		
		$deal = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table WHERE id = %d", $id ) );
		return rest_ensure_response( $deal );
	}

	public function update_item( $request ) {
		global $wpdb;
		$table = $wpdb->prefix . 'erp_crm_deals';
		$id    = (int) $request['id'];
		
		$data = $request->get_json_params();
		$update_data = array();
		
		if ( isset( $data['title'] ) ) $update_data['title'] = sanitize_text_field( $data['title'] );
		if ( isset( $data['amount'] ) ) $update_data['amount'] = floatval( $data['amount'] );
		if ( isset( $data['stage'] ) ) $update_data['stage'] = sanitize_text_field( $data['stage'] );
		if ( isset( $data['contact_id'] ) ) $update_data['contact_id'] = (int) $data['contact_id'];
		if ( isset( $data['organization_id'] ) ) $update_data['organization_id'] = (int) $data['organization_id'];
		
		if ( ! empty( $update_data ) ) {
			$wpdb->update( $table, $update_data, array( 'id' => $id ) );
		}
		
		return rest_ensure_response( array( 'success' => true ) );
	}

	public function delete_item( $request ) {
		global $wpdb;
		$table = $wpdb->prefix . 'erp_crm_deals';
		$id    = (int) $request['id'];
		
		$wpdb->delete( $table, array( 'id' => $id ) );
		return rest_ensure_response( array( 'success' => true ) );
	}
}
