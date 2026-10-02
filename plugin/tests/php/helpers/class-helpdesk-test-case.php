<?php
/**
 * Shared helpers for Helpdesk API tests.
 *
 * @package Sahajanand_ERP
 */

/**
 * Base test case with REST + helpdesk fixtures.
 */
class SAHAJANAND_ERP_Helpdesk_Test_Case extends WP_UnitTestCase {

	/**
	 * Admin user ID.
	 *
	 * @var int
	 */
	protected $admin_id = 0;

	/**
	 * Mailbox ID.
	 *
	 * @var int
	 */
	protected $mailbox_id = 0;

	/**
	 * Set up REST server and fixtures.
	 */
	public function setUp(): void {
		parent::setUp();

		global $wp_rest_server;
		$wp_rest_server = new WP_REST_Server();
		do_action( 'rest_api_init' );

		if ( class_exists( 'SAHAJANAND_ERP_Database' ) ) {
			SAHAJANAND_ERP_Database::create_tables();
		}

		$this->admin_id = self::factory()->user->create(
			array(
				'role' => 'administrator',
			)
		);
		wp_set_current_user( $this->admin_id );

		$this->mailbox_id = $this->create_mailbox(
			array(
				'name'          => 'Support',
				'email_address' => 'support@example.com',
			)
		);
	}

	/**
	 * Tear down.
	 */
	public function tearDown(): void {
		global $wpdb;
		$tables = array(
			$wpdb->prefix . 'erp_helpdesk_ticket_replies',
			$wpdb->prefix . 'erp_helpdesk_tickets',
			$wpdb->prefix . 'erp_helpdesk_mailboxes',
			$wpdb->prefix . 'erp_helpdesk_saved_replies',
			$wpdb->prefix . 'erp_crm_contacts',
		);
		foreach ( $tables as $table ) {
			// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			$wpdb->query( "DELETE FROM {$table}" );
		}
		parent::tearDown();
	}

	/**
	 * Dispatch a REST request.
	 *
	 * @param string $method HTTP method.
	 * @param string $route  Route path.
	 * @param array  $body   JSON body.
	 * @param array  $query  Query params.
	 * @return WP_REST_Response
	 */
	protected function dispatch( $method, $route, $body = array(), $query = array() ) {
		$request = new WP_REST_Request( $method, $route );
		foreach ( $query as $key => $value ) {
			$request->set_param( $key, $value );
		}
		if ( ! empty( $body ) ) {
			$request->set_header( 'Content-Type', 'application/json' );
			$request->set_body( wp_json_encode( $body ) );
		}
		return rest_get_server()->dispatch( $request );
	}

	/**
	 * Create a mailbox row.
	 *
	 * @param array $overrides Fields.
	 * @return int
	 */
	protected function create_mailbox( $overrides = array() ) {
		global $wpdb;
		$data = array_merge(
			array(
				'name'          => 'Mailbox',
				'email_address' => 'mailbox@example.com',
				'imap_host'     => 'imap.example.com',
				'imap_port'     => 993,
				'imap_user'     => 'user',
				'imap_pass'     => 'pass',
				'smtp_host'     => 'smtp.example.com',
				'smtp_port'     => 465,
				'smtp_user'     => 'user',
				'smtp_pass'     => 'pass',
				'signature'     => '',
			),
			$overrides
		);
		$wpdb->insert( $wpdb->prefix . 'erp_helpdesk_mailboxes', $data );
		return (int) $wpdb->insert_id;
	}

	/**
	 * Create a ticket row.
	 *
	 * @param array $overrides Fields.
	 * @return int
	 */
	protected function create_ticket( $overrides = array() ) {
		global $wpdb;
		$table = $wpdb->prefix . 'erp_helpdesk_tickets';
		$data  = array_merge(
			array(
				'ticket_no'      => '',
				'subject'        => 'Subject',
				'description'    => '<p>Body</p>',
				'mailbox_id'     => $this->mailbox_id,
				'status'         => 'open',
				'priority'       => 'medium',
				'is_starred'     => 0,
				'is_spam'        => 0,
				'is_deleted'     => 0,
				'assignee_id'    => null,
				'contact_id'     => null,
				'raw_email'      => null,
				'attachment_ids' => null,
			),
			$overrides
		);
		$wpdb->insert( $table, $data );
		$id = (int) $wpdb->insert_id;
		$wpdb->update( $table, array( 'ticket_no' => '#' . $id ), array( 'id' => $id ) );
		return $id;
	}

	/**
	 * Create a CRM contact.
	 *
	 * @param array $overrides Fields.
	 * @return int
	 */
	protected function create_contact( $overrides = array() ) {
		global $wpdb;
		$data = array_merge(
			array(
				'first_name' => 'Jane',
				'last_name'  => 'Doe',
				'email'      => 'jane@example.com',
			),
			$overrides
		);
		$wpdb->insert( $wpdb->prefix . 'erp_crm_contacts', $data );
		return (int) $wpdb->insert_id;
	}
}
