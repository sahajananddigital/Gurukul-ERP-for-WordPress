<?php
/**
 * PHPUnit Tests for SAHAJANAND_ERP_API_Content
 *
 * @package Sahajanand_ERP
 */

class SAHAJANAND_ERP_API_Content_Test extends WP_UnitTestCase {

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
	 * Test that Content routes are registered
	 */
	public function test_content_routes_registered() {
		$routes = rest_get_server()->get_routes();
		
		$expected_routes = array(
			'/sahajanand-erp/v1/content/dashboard',
			'/sahajanand-erp/v1/content/daily-darshan',
			'/sahajanand-erp/v1/content/daily-quotes',
			'/sahajanand-erp/v1/content/daily-updates',
			'/sahajanand-erp/v1/content/daily-satsang',
			'/sahajanand-erp/v1/content/daily-programs',
			'/sahajanand-erp/v1/content/calendar-events',
		);

		foreach ( $expected_routes as $route ) {
			$this->assertArrayHasKey( $route, $routes );
		}
	}

	/**
	 * Test fetching dashboard grid
	 */
	public function test_get_dashboard_grid() {
		$request  = new WP_REST_Request( 'GET', '/sahajanand-erp/v1/content/dashboard' );
		$response = rest_get_server()->dispatch( $request );

		$this->assertEquals( 200, $response->get_status() );
		$data = $response->get_data();

		$this->assertIsArray( $data );
		$this->assertNotEmpty( $data );
		
		// Check that essential grid items exist
		$ids = array_column( $data, 'id' );
		$this->assertContains( 'daily_darshan', $ids );
		$this->assertContains( 'daily_quotes', $ids );
		$this->assertContains( 'daily_update', $ids );
	}

	/**
	 * Test fetching daily darshan (Public Route)
	 */
	public function test_get_daily_darshan() {
		$request  = new WP_REST_Request( 'GET', '/sahajanand-erp/v1/content/daily-darshan' );
		$response = rest_get_server()->dispatch( $request );

		// Should not return forbidden, it's public
		$this->assertEquals( 200, $response->get_status() );
		$this->assertIsArray( $response->get_data() );
	}

	/**
	 * Test creating daily darshan requires authentication
	 */
	public function test_create_daily_darshan_unauthenticated() {
		wp_set_current_user( 0 ); // Ensure logged out

		$request = new WP_REST_Request( 'POST', '/sahajanand-erp/v1/content/daily-darshan' );
		$request->set_body_params( array(
			'date'      => '2026-04-15',
			'image_ids' => '1,2,3',
			'time'      => 'morning',
		) );

		$response = rest_get_server()->dispatch( $request );
		$this->assertEquals( 401, $response->get_status() );
	}
}
