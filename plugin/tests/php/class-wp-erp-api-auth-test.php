<?php
/**
 * PHPUnit Tests for WP_ERP_API_Auth
 *
 * @package WP_ERP
 */

class WP_ERP_API_Auth_Test extends WP_UnitTestCase {

	/**
	 * Setup before each test
	 */
	public function setUp(): void {
		parent::setUp();
		
		// Ensure REST server is initialized
		global $wp_rest_server;
		if ( empty( $wp_rest_server ) ) {
			$wp_rest_server = new WP_REST_Server();
			do_action( 'rest_api_init' );
		}
	}

	/**
	 * Test that the /auth/me route is registered
	 */
	public function test_auth_route_registered() {
		$routes = rest_get_server()->get_routes();
		$this->assertArrayHasKey( '/wp-erp/v1/auth/me', $routes );
	}

	/**
	 * Test /auth/me endpoint without being logged in
	 */
	public function test_auth_me_unauthenticated() {
		wp_set_current_user( 0 ); // Ensure logged out

		$request  = new WP_REST_Request( 'GET', '/wp-erp/v1/auth/me' );
		$response = rest_get_server()->dispatch( $request );

		$this->assertErrorResponse( 'rest_forbidden', $response, 401 );
	}

	/**
	 * Test /auth/me endpoint as a logged-in user
	 */
	public function test_auth_me_authenticated() {
		// Create a test user
		$user_id = $this->factory->user->create( array(
			'role'         => 'subscriber',
			'user_login'   => 'testuser',
			'display_name' => 'Test User',
			'user_email'   => 'testuser@example.com',
		) );

		wp_set_current_user( $user_id );

		$request  = new WP_REST_Request( 'GET', '/wp-erp/v1/auth/me' );
		$response = rest_get_server()->dispatch( $request );

		$this->assertEquals( 200, $response->get_status() );
		
		$data = $response->get_data();
		
		$this->assertEquals( $user_id, $data['id'] );
		$this->assertEquals( 'Test User', $data['name'] );
		$this->assertEquals( 'testuser@example.com', $data['email'] );
		$this->assertArrayHasKey( 'avatar', $data );
		$this->assertContains( 'subscriber', $data['roles'] );
	}
}
