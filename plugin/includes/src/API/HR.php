<?php
/**
 * HR API Controller (employees).
 *
 * @package Sahajanand_ERP
 */


declare(strict_types=1);

namespace SahajanandERP\API;

use SahajanandERP\Abstracts\AbstractController;
use WP_REST_Server;
use WP_Error;
use WP_REST_Response;
use WP_REST_Request;
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class HR extends AbstractController {

	/**
	 * Register routes
	 */
	public function register_routes() {
		register_rest_route(
			$this->namespace,
			'/hr/employees',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_employees' ),
					'permission_callback' => array( $this, 'check_permission' ),
				),
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'create_employee' ),
					'permission_callback' => array( $this, 'check_permission' ),
				),
			)
		);
		register_rest_route(
			$this->namespace,
			'/hr/employees/(?P<id>[\d]+)',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_employee' ),
					'permission_callback' => array( $this, 'check_permission' ),
				),
				array(
					'methods'             => WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'update_employee' ),
					'permission_callback' => array( $this, 'check_permission' ),
				),
				array(
					'methods'             => WP_REST_Server::DELETABLE,
					'callback'            => array( $this, 'delete_employee' ),
					'permission_callback' => array( $this, 'check_permission' ),
				),
			)
		);
	}

	/**
	 * Get all employees.
	 *
	 * @param WP_REST_Request $request Request instance.
	 * @return WP_REST_Response
	 */
	public function get_employees( $request ) {
		$table     = $this->get_wpdb()->prefix . 'erp_hr_employees';
		$employees = $this->get_wpdb()->get_results( "SELECT * FROM $table ORDER BY created_at DESC" );
		return rest_ensure_response( $employees );
	}

	/**
	 * Get a single employee.
	 *
	 * @param WP_REST_Request $request Request instance.
	 * @return WP_REST_Response|WP_Error
	 */
	public function get_employee( $request ) {
		$id       = (int) $request->get_param( 'id' );
		$table    = $this->get_wpdb()->prefix . 'erp_hr_employees';
		$employee = $this->get_wpdb()->get_row( $this->get_wpdb()->prepare( "SELECT * FROM $table WHERE id = %d", $id ) );
		if ( ! $employee ) {
			return new WP_Error( 'not_found', __( 'Employee not found.', 'sahajanand-erp' ), array( 'status' => 404 ) );
		}
		return rest_ensure_response( $employee );
	}

	/**
	 * Create an employee.
	 *
	 * @param WP_REST_Request $request Request instance.
	 * @return WP_REST_Response|WP_Error
	 */
	public function create_employee( $request ) {
		$table  = $this->get_wpdb()->prefix . 'erp_hr_employees';
		$data   = $request->get_json_params();
		$result = $this->get_wpdb()->insert( $table, $data );
		if ( $result === false ) {
			return new WP_Error( 'insert_failed', __( 'Failed to create employee.', 'sahajanand-erp' ), array( 'status' => 500 ) );
		}
		return rest_ensure_response( array( 'id' => $this->get_wpdb()->insert_id ) );
	}

	/**
	 * Update an employee.
	 *
	 * @param WP_REST_Request $request Request instance.
	 * @return WP_REST_Response|WP_Error
	 */
	public function update_employee( $request ) {
		$id     = (int) $request->get_param( 'id' );
		$table  = $this->get_wpdb()->prefix . 'erp_hr_employees';
		$data   = $request->get_json_params();
		$result = $this->get_wpdb()->update( $table, $data, array( 'id' => $id ) );
		if ( $result === false ) {
			return new WP_Error( 'update_failed', __( 'Failed to update employee.', 'sahajanand-erp' ), array( 'status' => 500 ) );
		}
		return rest_ensure_response( array( 'updated' => true ) );
	}

	/**
	 * Delete an employee.
	 *
	 * @param WP_REST_Request $request Request instance.
	 * @return WP_REST_Response|WP_Error
	 */
	public function delete_employee( $request ) {
		$id     = (int) $request->get_param( 'id' );
		$table  = $this->get_wpdb()->prefix . 'erp_hr_employees';
		$result = $this->get_wpdb()->delete( $table, array( 'id' => $id ) );
		if ( $result === false ) {
			return new WP_Error( 'delete_failed', __( 'Failed to delete employee.', 'sahajanand-erp' ), array( 'status' => 500 ) );
		}
		return rest_ensure_response( array( 'deleted' => true ) );
	}
}
