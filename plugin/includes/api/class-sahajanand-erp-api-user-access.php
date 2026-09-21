<?php
/**
 * User Access API
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class SAHAJANAND_ERP_API_User_Access extends SAHAJANAND_ERP_API_Controller {
	
	protected $namespace = 'sahajanand-erp/v1';
	protected $rest_base = 'user-access';
	
	private $capabilities = array(
		'erp_manage_crm'        => 'CRM',
		'erp_manage_accounting' => 'Accounting',
		'erp_manage_hr'         => 'HR',
		'erp_manage_helpdesk'   => 'Helpdesk',
		'erp_manage_vouchers'   => 'Vouchers',
		'erp_manage_invoices'   => 'Invoices',
		'erp_manage_expenses'   => 'Expenses',
		'erp_manage_food_pass'  => 'Food Pass',
		'erp_manage_donations'  => 'Donations',
	);

	public function register_routes() {
		register_rest_route( $this->namespace, '/' . $this->rest_base . '/users', array(
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_users' ),
				'permission_callback' => array( $this, 'check_permission' ),
			),
		) );

		register_rest_route( $this->namespace, '/' . $this->rest_base . '/capabilities', array(
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_capabilities' ),
				'permission_callback' => array( $this, 'check_permission' ),
			),
		) );

		register_rest_route( $this->namespace, '/' . $this->rest_base . '/(?P<id>[\d]+)', array(
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_user_access' ),
				'permission_callback' => array( $this, 'check_permission' ),
			),
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'update_user_access' ),
				'permission_callback' => array( $this, 'check_permission' ),
			),
		) );
	}

	public function get_users( $request ) {
		$users = get_users( array( 'orderby' => 'display_name' ) );
		$data = array();
		foreach ( $users as $user ) {
			$data[] = array(
				'id'           => $user->ID,
				'display_name' => $user->display_name,
				'email'        => $user->user_email,
				'roles'        => $user->roles,
			);
		}
		return rest_ensure_response( $data );
	}

	public function get_capabilities( $request ) {
		return rest_ensure_response( $this->capabilities );
	}

	public function get_user_access( $request ) {
		$user_id = (int) $request['id'];
		$user = get_user_by( 'id', $user_id );
		
		if ( ! $user ) {
			return new WP_Error( 'not_found', 'User not found.', array( 'status' => 404 ) );
		}

		$access = array();
		foreach ( $this->capabilities as $cap => $label ) {
			$access[$cap] = $user->has_cap( $cap );
		}

		return rest_ensure_response( array(
			'is_admin' => in_array( 'administrator', $user->roles ),
			'access'   => $access,
		) );
	}

	public function update_user_access( $request ) {
		$user_id = (int) $request['id'];
		$user = get_user_by( 'id', $user_id );
		
		if ( ! $user ) {
			return new WP_Error( 'not_found', 'User not found.', array( 'status' => 404 ) );
		}

		$data = $request->get_json_params();
		$access = isset( $data['access'] ) ? $data['access'] : array();

		foreach ( $this->capabilities as $cap => $label ) {
			if ( isset( $access[$cap] ) && $access[$cap] ) {
				$user->add_cap( $cap );
			} else {
				$user->remove_cap( $cap );
			}
		}

		return rest_ensure_response( array( 'success' => true ) );
	}
}
