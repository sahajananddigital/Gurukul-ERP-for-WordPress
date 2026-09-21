<?php
/**
 * CRM Organizations API
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class SAHAJANAND_ERP_API_Organizations extends SAHAJANAND_ERP_API_Controller {
	
	protected $namespace = 'sahajanand-erp/v1';
	protected $rest_base = 'crm/organizations';
	
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
		$table = $wpdb->prefix . 'erp_crm_organizations';
		
		$orgs = $wpdb->get_results( "SELECT * FROM $table ORDER BY created_at DESC" );
		return rest_ensure_response( $orgs );
	}

	public function create_item( $request ) {
		global $wpdb;
		$table = $wpdb->prefix . 'erp_crm_organizations';
		
		$data = $request->get_json_params();
		$wpdb->insert( $table, array(
			'name'     => sanitize_text_field( $data['name'] ?? '' ),
			'industry' => sanitize_text_field( $data['industry'] ?? '' ),
			'website'  => esc_url_raw( $data['website'] ?? '' )
		) );
		
		return rest_ensure_response( array( 'id' => $wpdb->insert_id ) );
	}

	public function get_item( $request ) {
		global $wpdb;
		$table = $wpdb->prefix . 'erp_crm_organizations';
		$id    = (int) $request['id'];
		
		$org = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table WHERE id = %d", $id ) );
		return rest_ensure_response( $org );
	}

	public function update_item( $request ) {
		global $wpdb;
		$table = $wpdb->prefix . 'erp_crm_organizations';
		$id    = (int) $request['id'];
		
		$data = $request->get_json_params();
		$update_data = array();
		
		if ( isset( $data['name'] ) ) $update_data['name'] = sanitize_text_field( $data['name'] );
		if ( isset( $data['industry'] ) ) $update_data['industry'] = sanitize_text_field( $data['industry'] );
		if ( isset( $data['website'] ) ) $update_data['website'] = esc_url_raw( $data['website'] );
		
		if ( ! empty( $update_data ) ) {
			$wpdb->update( $table, $update_data, array( 'id' => $id ) );
		}
		
		return rest_ensure_response( array( 'success' => true ) );
	}

	public function delete_item( $request ) {
		global $wpdb;
		$table = $wpdb->prefix . 'erp_crm_organizations';
		$id    = (int) $request['id'];
		
		$wpdb->delete( $table, array( 'id' => $id ) );
		return rest_ensure_response( array( 'success' => true ) );
	}
}
