<?php
/**
 * Helpdesk API integration tests.
 *
 * @package Sahajanand_ERP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/helpers/class-helpdesk-test-case.php';

/**
 * Tests for SAHAJANAND_ERP_API_Helpdesk.
 */
class SAHAJANAND_ERP_API_Helpdesk_Test extends SAHAJANAND_ERP_Helpdesk_Test_Case {

	/**
	 * Critical helpdesk routes must be registered.
	 */
	public function test_helpdesk_routes_registered() {
		$routes   = rest_get_server()->get_routes();
		$expected = array(
			'/sahajanand-erp/v1/helpdesk/tickets',
			'/sahajanand-erp/v1/helpdesk/tickets/(?P<id>[\\d]+)',
			'/sahajanand-erp/v1/helpdesk/tickets/(?P<id>[\\d]+)/preview',
			'/sahajanand-erp/v1/helpdesk/tickets/bulk',
			'/sahajanand-erp/v1/helpdesk/stats',
			'/sahajanand-erp/v1/helpdesk/mailboxes',
			'/sahajanand-erp/v1/helpdesk/saved-replies',
		);
		foreach ( $expected as $route ) {
			$this->assertArrayHasKey( $route, $routes, "Missing route {$route}" );
		}
	}

	/**
	 * Create ticket via REST and auto-create CRM contact.
	 */
	public function test_create_ticket_creates_contact() {
		$response = $this->dispatch(
			'POST',
			'/sahajanand-erp/v1/helpdesk/tickets',
			array(
				'subject'        => 'Need help',
				'description'    => 'Details here',
				'mailbox_id'     => $this->mailbox_id,
				'customer_email' => 'new.customer@example.com',
				'status'         => 'open',
			)
		);

		$this->assertSame( 200, $response->get_status() );
		$data = $response->get_data();
		$this->assertArrayHasKey( 'id', $data );

		global $wpdb;
		$ticket = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT * FROM {$wpdb->prefix}erp_helpdesk_tickets WHERE id = %d",
				(int) $data['id']
			)
		);
		$this->assertNotEmpty( $ticket );
		$this->assertSame( 'Need help', $ticket->subject );
		$this->assertNotEmpty( $ticket->contact_id );

		$contact = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT * FROM {$wpdb->prefix}erp_crm_contacts WHERE id = %d",
				(int) $ticket->contact_id
			)
		);
		$this->assertSame( 'new.customer@example.com', $contact->email );
	}

	/**
	 * Get single ticket includes customer fields.
	 */
	public function test_get_ticket_includes_customer() {
		$contact_id = $this->create_contact(
			array(
				'first_name' => 'Ada',
				'email'      => 'ada@example.com',
			)
		);
		$ticket_id  = $this->create_ticket(
			array(
				'subject'    => 'Ada ticket',
				'contact_id' => $contact_id,
			)
		);

		$response = $this->dispatch( 'GET', "/sahajanand-erp/v1/helpdesk/tickets/{$ticket_id}" );
		$this->assertSame( 200, $response->get_status() );
		$data = $response->get_data();
		$this->assertSame( 'Ada ticket', $data->subject );
		$this->assertSame( 'ada@example.com', $data->customer_email );
		$this->assertSame( 'Ada', $data->customer_name );
		$this->assertIsArray( $data->attachments );
	}

	/**
	 * Missing ticket returns 404.
	 */
	public function test_get_ticket_not_found() {
		$response = $this->dispatch( 'GET', '/sahajanand-erp/v1/helpdesk/tickets/999999' );
		$this->assertSame( 404, $response->get_status() );
	}

	/**
	 * Update ticket status and attachment_ids.
	 */
	public function test_update_ticket_fields() {
		$ticket_id = $this->create_ticket();
		$response  = $this->dispatch(
			'PUT',
			"/sahajanand-erp/v1/helpdesk/tickets/{$ticket_id}",
			array(
				'status'         => 'pending',
				'priority'       => 'high',
				'attachment_ids' => array( 11, 22 ),
			)
		);
		$this->assertSame( 200, $response->get_status() );

		global $wpdb;
		$row = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT status, priority, attachment_ids FROM {$wpdb->prefix}erp_helpdesk_tickets WHERE id = %d",
				$ticket_id
			)
		);
		$this->assertSame( 'pending', $row->status );
		$this->assertSame( 'high', $row->priority );
		$this->assertSame( '11,22', $row->attachment_ids );
	}

	/**
	 * Preview endpoint returns raw email body.
	 */
	public function test_ticket_preview_returns_raw_email() {
		$ticket_id = $this->create_ticket(
			array(
				'raw_email' => "From: a@b.c\r\n\r\nHello",
			)
		);
		$response  = $this->dispatch( 'GET', "/sahajanand-erp/v1/helpdesk/tickets/{$ticket_id}/preview" );
		$this->assertSame( 200, $response->get_status() );
		$data = $response->get_data();
		$this->assertStringContainsString( 'Hello', $data['raw_email'] );
	}

	/**
	 * Empty preview is still 200 with empty string.
	 */
	public function test_ticket_preview_empty() {
		$ticket_id = $this->create_ticket();
		$response  = $this->dispatch( 'GET', "/sahajanand-erp/v1/helpdesk/tickets/{$ticket_id}/preview" );
		$this->assertSame( 200, $response->get_status() );
		$this->assertSame( '', $response->get_data()['raw_email'] );
	}

	/**
	 * Folder filter + pagination headers.
	 */
	public function test_get_tickets_folder_and_pagination() {
		$this->create_ticket(
			array(
				'subject'     => 'U1',
				'assignee_id' => null,
			)
		);
		$this->create_ticket(
			array(
				'subject'     => 'U2',
				'assignee_id' => 0,
			)
		);
		$this->create_ticket(
			array(
				'subject'     => 'Mine',
				'assignee_id' => $this->admin_id,
			)
		);
		$this->create_ticket(
			array(
				'subject' => 'Closed',
				'status'  => 'closed',
			)
		);
		$this->create_ticket(
			array(
				'subject'    => 'Star',
				'is_starred' => 1,
			)
		);
		$this->create_ticket(
			array(
				'subject' => 'Spam',
				'is_spam' => 1,
			)
		);
		$this->create_ticket(
			array(
				'subject'    => 'Trash',
				'is_deleted' => 1,
			)
		);

		$unassigned = $this->dispatch(
			'GET',
			'/sahajanand-erp/v1/helpdesk/tickets',
			array(),
			array(
				'mailbox_id' => $this->mailbox_id,
				'folder'     => 'unassigned',
				'per_page'   => 1,
				'page'       => 1,
			)
		);
		$this->assertSame( 200, $unassigned->get_status() );
		$this->assertCount( 1, $unassigned->get_data() );
		$this->assertGreaterThanOrEqual( 2, (int) $unassigned->get_headers()['X-WP-Total'] );
		$this->assertSame( '1', $unassigned->get_headers()['X-WP-Page'] );

		$mine          = $this->dispatch(
			'GET',
			'/sahajanand-erp/v1/helpdesk/tickets',
			array(),
			array(
				'mailbox_id' => $this->mailbox_id,
				'folder'     => 'mine',
			)
		);
		$mine_subjects = wp_list_pluck( $mine->get_data(), 'subject' );
		$this->assertContains( 'Mine', $mine_subjects );

		$closed = $this->dispatch(
			'GET',
			'/sahajanand-erp/v1/helpdesk/tickets',
			array(),
			array(
				'mailbox_id' => $this->mailbox_id,
				'folder'     => 'closed',
			)
		);
		$this->assertContains( 'Closed', wp_list_pluck( $closed->get_data(), 'subject' ) );

		$starred = $this->dispatch(
			'GET',
			'/sahajanand-erp/v1/helpdesk/tickets',
			array(),
			array(
				'mailbox_id' => $this->mailbox_id,
				'folder'     => 'starred',
			)
		);
		$this->assertContains( 'Star', wp_list_pluck( $starred->get_data(), 'subject' ) );

		$spam = $this->dispatch(
			'GET',
			'/sahajanand-erp/v1/helpdesk/tickets',
			array(),
			array(
				'mailbox_id' => $this->mailbox_id,
				'folder'     => 'spam',
			)
		);
		$this->assertContains( 'Spam', wp_list_pluck( $spam->get_data(), 'subject' ) );

		$trash = $this->dispatch(
			'GET',
			'/sahajanand-erp/v1/helpdesk/tickets',
			array(),
			array(
				'mailbox_id' => $this->mailbox_id,
				'folder'     => 'trash',
			)
		);
		$this->assertContains( 'Trash', wp_list_pluck( $trash->get_data(), 'subject' ) );
	}

	/**
	 * Bulk actions cover star/spam/trash/restore/status/assign.
	 */
	public function test_bulk_actions() {
		$id1 = $this->create_ticket();
		$id2 = $this->create_ticket();

		$star = $this->dispatch(
			'POST',
			'/sahajanand-erp/v1/helpdesk/tickets/bulk',
			array(
				'ids'    => array( $id1, $id2 ),
				'action' => 'star',
				'value'  => 1,
			)
		);
		$this->assertSame( 200, $star->get_status() );
		$this->assertSame( 2, $star->get_data()['processed'] );

		$this->assertSame( '1', $this->ticket_field( 'is_starred', $id1 ) );

		$this->dispatch(
			'POST',
			'/sahajanand-erp/v1/helpdesk/tickets/bulk',
			array(
				'ids'    => array( $id1 ),
				'action' => 'spam',
				'value'  => 1,
			)
		);
		$this->assertSame( '1', $this->ticket_field( 'is_spam', $id1 ) );

		$this->dispatch(
			'POST',
			'/sahajanand-erp/v1/helpdesk/tickets/bulk',
			array(
				'ids'    => array( $id2 ),
				'action' => 'trash',
			)
		);
		$this->assertSame( '1', $this->ticket_field( 'is_deleted', $id2 ) );

		$this->dispatch(
			'POST',
			'/sahajanand-erp/v1/helpdesk/tickets/bulk',
			array(
				'ids'    => array( $id2 ),
				'action' => 'restore',
			)
		);
		$this->assertSame( '0', $this->ticket_field( 'is_deleted', $id2 ) );

		$this->dispatch(
			'POST',
			'/sahajanand-erp/v1/helpdesk/tickets/bulk',
			array(
				'ids'    => array( $id2 ),
				'action' => 'assign',
				'value'  => $this->admin_id,
			)
		);
		$this->assertSame( (string) $this->admin_id, $this->ticket_field( 'assignee_id', $id2 ) );

		$this->dispatch(
			'POST',
			'/sahajanand-erp/v1/helpdesk/tickets/bulk',
			array(
				'ids'    => array( $id2 ),
				'action' => 'status',
				'value'  => 0,
			)
		);
		$this->assertSame( 'closed', $this->ticket_field( 'status', $id2 ) );
	}

	/**
	 * Bulk without IDs is 400.
	 */
	public function test_bulk_requires_ids() {
		$response = $this->dispatch(
			'POST',
			'/sahajanand-erp/v1/helpdesk/tickets/bulk',
			array(
				'ids'    => array(),
				'action' => 'star',
			)
		);
		$this->assertSame( 400, $response->get_status() );
	}

	/**
	 * Stats endpoint returns per-mailbox counts.
	 */
	public function test_helpdesk_stats() {
		$this->create_ticket( array( 'assignee_id' => null ) );
		$this->create_ticket( array( 'assignee_id' => $this->admin_id ) );
		$this->create_ticket( array( 'status' => 'closed' ) );

		$response = $this->dispatch( 'GET', '/sahajanand-erp/v1/helpdesk/stats' );
		$this->assertSame( 200, $response->get_status() );
		$stats = $response->get_data();
		$this->assertNotEmpty( $stats );

		$match = null;
		foreach ( $stats as $row ) {
			if ( (int) $row['id'] === (int) $this->mailbox_id ) {
				$match = $row;
				break;
			}
		}
		$this->assertNotNull( $match );
		$this->assertGreaterThanOrEqual( 1, (int) $match['unassigned'] );
		$this->assertGreaterThanOrEqual( 1, (int) $match['mine'] );
		$this->assertGreaterThanOrEqual( 1, (int) $match['closed'] );
		$this->assertGreaterThanOrEqual( 3, (int) $match['total'] );
	}

	/**
	 * Replies CRUD + note vs public reply status flip.
	 */
	public function test_ticket_replies() {
		$ticket_id = $this->create_ticket( array( 'status' => 'open' ) );

		$note = $this->dispatch(
			'POST',
			"/sahajanand-erp/v1/helpdesk/tickets/{$ticket_id}/replies",
			array(
				'message' => 'Internal only',
				'is_note' => true,
			)
		);
		$this->assertSame( 200, $note->get_status() );
		$this->assertSame( 1, (int) $note->get_data()->is_note );

		global $wpdb;
		$status = $wpdb->get_var(
			$wpdb->prepare(
				"SELECT status FROM {$wpdb->prefix}erp_helpdesk_tickets WHERE id = %d",
				$ticket_id
			)
		);
		$this->assertSame( 'open', $status, 'Notes must not change ticket status' );

		// Avoid real SMTP by filtering wp_mail.
		add_filter( 'pre_wp_mail', '__return_true' );
		$reply = $this->dispatch(
			'POST',
			"/sahajanand-erp/v1/helpdesk/tickets/{$ticket_id}/replies",
			array(
				'message' => 'Public reply',
				'is_note' => false,
			)
		);
		remove_filter( 'pre_wp_mail', '__return_true' );
		$this->assertSame( 200, $reply->get_status() );

		$status = $wpdb->get_var(
			$wpdb->prepare(
				"SELECT status FROM {$wpdb->prefix}erp_helpdesk_tickets WHERE id = %d",
				$ticket_id
			)
		);
		$this->assertSame( 'pending', $status );

		$list = $this->dispatch(
			'GET',
			"/sahajanand-erp/v1/helpdesk/tickets/{$ticket_id}/replies",
			array(),
			array(
				'per_page' => 10,
				'page'     => 1,
			)
		);
		$this->assertSame( 200, $list->get_status() );
		$this->assertGreaterThanOrEqual( 2, count( $list->get_data() ) );
		$this->assertArrayHasKey( 'X-WP-Total', $list->get_headers() );
	}

	/**
	 * Mailbox CRUD.
	 */
	public function test_mailbox_crud() {
		$create = $this->dispatch(
			'POST',
			'/sahajanand-erp/v1/helpdesk/mailboxes',
			array(
				'name'          => 'Sales',
				'email_address' => 'sales@example.com',
				'imap_host'     => 'imap.example.com',
				'smtp_host'     => 'smtp.example.com',
			)
		);
		$this->assertSame( 200, $create->get_status() );
		$id = (int) $create->get_data()['id'];
		$this->assertGreaterThan( 0, $id );

		$list  = $this->dispatch( 'GET', '/sahajanand-erp/v1/helpdesk/mailboxes' );
		$names = wp_list_pluck( $list->get_data(), 'name' );
		$this->assertContains( 'Sales', $names );

		$update = $this->dispatch(
			'PUT',
			"/sahajanand-erp/v1/helpdesk/mailboxes/{$id}",
			array(
				'name' => 'Sales Updated',
			)
		);
		$this->assertSame( 200, $update->get_status() );

		$delete = $this->dispatch( 'DELETE', "/sahajanand-erp/v1/helpdesk/mailboxes/{$id}" );
		$this->assertSame( 200, $delete->get_status() );
	}

	/**
	 * Saved replies CRUD.
	 */
	public function test_saved_replies_crud() {
		$create = $this->dispatch(
			'POST',
			'/sahajanand-erp/v1/helpdesk/saved-replies',
			array(
				'title'   => 'Greeting',
				'content' => 'Hello there',
			)
		);
		$this->assertSame( 200, $create->get_status() );
		$id = (int) $create->get_data()['id'];
		$this->assertGreaterThan( 0, $id );

		global $wpdb;
		$row = $wpdb->get_row(
			$wpdb->prepare( "SELECT * FROM {$wpdb->prefix}erp_helpdesk_saved_replies WHERE id = %d", $id )
		);
		$this->assertSame( 'Greeting', $row->title );
		$this->assertSame( 'Hello there', $row->content );

		$list = $this->dispatch( 'GET', '/sahajanand-erp/v1/helpdesk/saved-replies' );
		$this->assertSame( 200, $list->get_status() );
		$this->assertContains( 'Greeting', wp_list_pluck( $list->get_data(), 'title' ) );

		$update = $this->dispatch(
			'PUT',
			"/sahajanand-erp/v1/helpdesk/saved-replies/{$id}",
			array(
				'title'   => 'Greeting 2',
				'content' => 'Hi',
			)
		);
		$this->assertSame( 200, $update->get_status() );
		$this->assertSame( 'Greeting 2', $this->saved_reply_field( 'title', $id ) );

		$delete = $this->dispatch( 'DELETE', "/sahajanand-erp/v1/helpdesk/saved-replies/{$id}" );
		$this->assertSame( 200, $delete->get_status() );
		$this->assertNull( $this->saved_reply_field( 'title', $id ) );
	}

	/**
	 * Protected routes require auth.
	 */
	public function test_protected_routes_require_auth() {
		wp_set_current_user( 0 );
		$response = $this->dispatch( 'GET', '/sahajanand-erp/v1/helpdesk/stats' );
		$this->assertTrue( in_array( $response->get_status(), array( 401, 403 ), true ) );
	}

	/**
	 * Delete ticket permanently.
	 */
	public function test_delete_ticket() {
		$ticket_id = $this->create_ticket();
		$response  = $this->dispatch( 'DELETE', "/sahajanand-erp/v1/helpdesk/tickets/{$ticket_id}" );
		$this->assertSame( 200, $response->get_status() );

		global $wpdb;
		$exists = $wpdb->get_var(
			$wpdb->prepare(
				"SELECT id FROM {$wpdb->prefix}erp_helpdesk_tickets WHERE id = %d",
				$ticket_id
			)
		);
		$this->assertNull( $exists );
	}

	/**
	 * Fetch emails trigger returns success when class exists.
	 */
	public function test_trigger_mail_fetch() {
		$response = $this->dispatch( 'POST', '/sahajanand-erp/v1/helpdesk/fetch-emails' );
		$this->assertSame( 200, $response->get_status() );
		$this->assertArrayHasKey( 'message', $response->get_data() );
	}

	/**
	 * Tickets listing normalizes legacy ticket_no values.
	 */
	public function test_get_tickets_backfills_legacy_ticket_no() {
		global $wpdb;
		$wpdb->insert(
			$wpdb->prefix . 'erp_helpdesk_tickets',
			array(
				'ticket_no'   => 'LEGACY-7',
				'subject'     => 'Old import',
				'description' => 'Legacy row',
				'mailbox_id'  => $this->mailbox_id,
				'status'      => 'open',
				'priority'    => 'medium',
			)
		);
		$ticket_id = (int) $wpdb->insert_id;
		$this->assertGreaterThan( 0, $ticket_id );

		$this->dispatch(
			'GET',
			'/sahajanand-erp/v1/helpdesk/tickets',
			array(),
			array(
				'mailbox_id' => $this->mailbox_id,
				'folder'     => 'unassigned',
			)
		);

		$this->assertSame( '#' . $ticket_id, $this->ticket_field( 'ticket_no', $ticket_id ) );
	}

	/**
	 * Folder=assigned returns open tickets with an assignee, excluding closed ones.
	 */
	public function test_get_tickets_assigned_folder() {
		$this->create_ticket(
			array(
				'subject'     => 'Picked up',
				'assignee_id' => $this->admin_id,
			)
		);
		$this->create_ticket(
			array(
				'subject'     => 'Done',
				'assignee_id' => $this->admin_id,
				'status'      => 'closed',
			)
		);
		$this->create_ticket( array( 'subject' => 'Free' ) );

		$response = $this->dispatch(
			'GET',
			'/sahajanand-erp/v1/helpdesk/tickets',
			array(),
			array(
				'mailbox_id' => $this->mailbox_id,
				'folder'     => 'assigned',
			)
		);
		$this->assertSame( 200, $response->get_status() );
		$subjects = wp_list_pluck( $response->get_data(), 'subject' );
		$this->assertContains( 'Picked up', $subjects );
		$this->assertNotContains( 'Done', $subjects );
		$this->assertNotContains( 'Free', $subjects );
	}

	/**
	 * Page 2 returns the remainder and correct pagination headers.
	 */
	public function test_get_tickets_pagination_offset() {
		$this->create_ticket( array( 'subject' => 'S1' ) );
		$this->create_ticket( array( 'subject' => 'S2' ) );
		$this->create_ticket( array( 'subject' => 'S3' ) );

		$response = $this->dispatch(
			'GET',
			'/sahajanand-erp/v1/helpdesk/tickets',
			array(),
			array(
				'mailbox_id' => $this->mailbox_id,
				'per_page'   => 2,
				'page'       => 2,
			)
		);
		$this->assertSame( 200, $response->get_status() );
		$this->assertCount( 1, $response->get_data() );

		$headers = $response->get_headers();
		$this->assertSame( '3', $headers['X-WP-Total'] );
		$this->assertSame( '2', $headers['X-WP-TotalPages'] );
		$this->assertSame( '2', $headers['X-WP-Page'] );
	}

	/**
	 * The per_page parameter is clamped to the 1..100 range.
	 */
	public function test_get_tickets_per_page_clamp() {
		$high = $this->dispatch(
			'GET',
			'/sahajanand-erp/v1/helpdesk/tickets',
			array(),
			array(
				'mailbox_id' => $this->mailbox_id,
				'per_page'   => 500,
			)
		);
		$this->assertSame( '100', $high->get_headers()['X-WP-PerPage'] );

		$low = $this->dispatch(
			'GET',
			'/sahajanand-erp/v1/helpdesk/tickets',
			array(),
			array(
				'mailbox_id' => $this->mailbox_id,
				'per_page'   => 0,
			)
		);
		$this->assertSame( '1', $low->get_headers()['X-WP-PerPage'] );
	}

	/**
	 * Unknown mailbox yields an empty list with zeroed headers.
	 */
	public function test_get_tickets_empty_result() {
		$response = $this->dispatch(
			'GET',
			'/sahajanand-erp/v1/helpdesk/tickets',
			array(),
			array( 'mailbox_id' => 999999 )
		);
		$this->assertSame( 200, $response->get_status() );
		$this->assertCount( 0, $response->get_data() );
		$this->assertSame( '0', $response->get_headers()['X-WP-Total'] );
		$this->assertSame( '0', $response->get_headers()['X-WP-TotalPages'] );
	}

	/**
	 * Empty payload on update is rejected with no_fields.
	 */
	public function test_update_ticket_rejects_empty_payload() {
		$controller = new SAHAJANAND_ERP_API_Helpdesk();
		$request    = new WP_REST_Request( 'PUT', '/sahajanand-erp/v1/helpdesk/tickets/1' );
		$request->set_header( 'Content-Type', 'application/json' );
		$request->set_body( '{}' );

		$result = $controller->update_ticket( $request );

		$this->assertWPError( $result );
		$this->assertSame( 'no_fields', $result->get_error_code() );
	}

	/**
	 * Empty-string and null int fields coerce to NULL; unknown keys are ignored.
	 */
	public function test_update_ticket_null_coercion_and_unknown_keys() {
		$ticket_id = $this->create_ticket( array( 'assignee_id' => 5 ) );
		$response  = $this->dispatch(
			'PUT',
			"/sahajanand-erp/v1/helpdesk/tickets/{$ticket_id}",
			array(
				'assignee_id' => '',
				'mailbox_id'  => null,
				'junk_key'    => 'zzz',
			)
		);
		$this->assertSame( 200, $response->get_status() );

		$this->assertNull( $this->ticket_field( 'assignee_id', $ticket_id ) );
		$this->assertNull( $this->ticket_field( 'mailbox_id', $ticket_id ) );
		$this->assertSame( 'Subject', $this->ticket_field( 'subject', $ticket_id ), 'Unknown keys must not alter the row.' );
	}

	/**
	 * Descriptions are autop'd on update.
	 */
	public function test_update_ticket_description_is_wpauplayed() {
		$ticket_id = $this->create_ticket();
		$response  = $this->dispatch(
			'PUT',
			"/sahajanand-erp/v1/helpdesk/tickets/{$ticket_id}",
			array( 'description' => "First para\n\nSecond para" )
		);
		$this->assertSame( 200, $response->get_status() );
		$this->assertStringContainsString( '<p>First para</p>', $response->get_data()->description );
	}

	/**
	 * String attachment_ids are normalized to a sanitized CSV.
	 */
	public function test_update_ticket_attachment_ids_string() {
		$ticket_id = $this->create_ticket();
		$response  = $this->dispatch(
			'PUT',
			"/sahajanand-erp/v1/helpdesk/tickets/{$ticket_id}",
			array( 'attachment_ids' => '5,0,bad' )
		);
		$this->assertSame( 200, $response->get_status() );
		$this->assertSame( '5', $response->get_data()->attachment_ids );
	}

	/**
	 * Existing contacts are reused instead of duplicated.
	 */
	public function test_create_ticket_reuses_existing_contact() {
		$contact_id = $this->create_contact( array( 'email' => 'jane@example.com' ) );

		$response = $this->dispatch(
			'POST',
			'/sahajanand-erp/v1/helpdesk/tickets',
			array(
				'subject'        => 'Existing contact',
				'mailbox_id'     => $this->mailbox_id,
				'customer_email' => 'jane@example.com',
			)
		);
		$this->assertSame( 200, $response->get_status() );
		$ticket_id = (int) $response->get_data()['id'];

		$this->assertSame( (string) $contact_id, $this->ticket_field( 'contact_id', $ticket_id ) );

		global $wpdb;
		// The user factory also seeds contacts, so count only matches for this email.
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$this->assertSame(
			1,
			(int) $wpdb->get_var( "SELECT COUNT(*) FROM {$wpdb->prefix}erp_crm_contacts WHERE email = 'jane@example.com'" )
		);
	}

	/**
	 * Creating a ticket with a description seeds the first thread reply.
	 */
	public function test_create_ticket_creates_first_reply() {
		add_filter( 'pre_wp_mail', '__return_true' );
		$response = $this->dispatch(
			'POST',
			'/sahajanand-erp/v1/helpdesk/tickets',
			array(
				'subject'        => 'Help',
				'description'    => 'Broken on boot',
				'mailbox_id'     => $this->mailbox_id,
				'customer_email' => 'first.reply@example.com',
				'status'         => 'open',
			)
		);
		remove_filter( 'pre_wp_mail', '__return_true' );
		$this->assertSame( 200, $response->get_status() );
		$ticket_id = (int) $response->get_data()['id'];

		global $wpdb;
		$reply = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT * FROM {$wpdb->prefix}erp_helpdesk_ticket_replies WHERE ticket_id = %d",
				$ticket_id
			)
		);
		$this->assertNotNull( $reply, 'First reply should be stored.' );
		$this->assertSame( $this->admin_id, (int) $reply->user_id );
		$this->assertSame( 0, (int) $reply->is_note );
		$this->assertStringContainsString( '<p>Broken on boot</p>', $reply->message );
	}

	/**
	 * A failing wp_mail turns ticket creation into a 500 mail_error.
	 */
	public function test_create_ticket_mail_error() {
		add_filter( 'pre_wp_mail', '__return_false' );
		$response = $this->dispatch(
			'POST',
			'/sahajanand-erp/v1/helpdesk/tickets',
			array(
				'subject'        => 'Send fails',
				'description'    => 'Trigger send',
				'mailbox_id'     => $this->mailbox_id,
				'customer_email' => 'fail@example.com',
			)
		);
		remove_filter( 'pre_wp_mail', '__return_false' );

		$this->assertSame( 500, $response->get_status() );
		$this->assertSame( 'mail_error', $response->as_error()->get_error_code() );
	}

	/**
	 * Ticket creation is currently permitted for anonymous callers.
	 */
	public function test_anonymous_ticket_creation() {
		wp_set_current_user( 0 );
		$response = $this->dispatch(
			'POST',
			'/sahajanand-erp/v1/helpdesk/tickets',
			array(
				'subject'    => 'Anon ask',
				'mailbox_id' => $this->mailbox_id,
			)
		);
		$this->assertSame( 200, $response->get_status() );
		$ticket_id = (int) $response->get_data()['id'];
		$this->assertGreaterThan( 0, $ticket_id );
		$this->assertSame( '#', substr( $this->ticket_field( 'ticket_no', $ticket_id ), 0, 1 ) );
	}

	/**
	 * Reply attachment CSVs are sanitized and unresolvable IDs are skipped.
	 */
	public function test_add_reply_normalizes_attachment_ids() {
		$ticket_id = $this->create_ticket();
		$response  = $this->dispatch(
			'POST',
			"/sahajanand-erp/v1/helpdesk/tickets/{$ticket_id}/replies",
			array(
				'message'        => 'With files',
				'is_note'        => true,
				'attachment_ids' => '3,0,bad',
			)
		);
		$this->assertSame( 200, $response->get_status() );
		$data = $response->get_data();
		$this->assertSame( '3', $data->attachment_ids );
		$this->assertCount( 0, $data->attachments, 'Nonexistent attachment IDs must be skipped.' );
	}

	/**
	 * A real attachment is resolved into id/url/filename/mime on replies.
	 */
	public function test_reply_attachments_payload() {
		$path = sys_get_temp_dir() . '/erp-note-' . wp_generate_password( 6, false ) . '.txt';
		file_put_contents( $path, "ticket attachment\n" );
		$attachment_id = self::factory()->attachment->create_upload_object( $path );

		$ticket_id = $this->create_ticket();
		add_filter( 'pre_wp_mail', '__return_true' );
		$response = $this->dispatch(
			'POST',
			"/sahajanand-erp/v1/helpdesk/tickets/{$ticket_id}/replies",
			array(
				'message'        => 'See file',
				'is_note'        => true,
				'attachment_ids' => (string) $attachment_id,
			)
		);
		remove_filter( 'pre_wp_mail', '__return_true' );
		$this->assertSame( 200, $response->get_status() );

		$attachments = $response->get_data()->attachments;
		$this->assertCount( 1, $attachments );
		$this->assertSame( $attachment_id, (int) $attachments[0]['id'] );
		$this->assertNotEmpty( $attachments[0]['url'] );
		$this->assertSame( basename( $path ), $attachments[0]['filename'] );
		$this->assertSame( 'text/plain', $attachments[0]['mime'] );

		wp_delete_file( $path );
		wp_delete_attachment( $attachment_id, true );
	}

	/**
	 * A failing wp_mail turns replies into a 500 mail_error after status flip.
	 */
	public function test_add_reply_mail_error() {
		$contact_id = $this->create_contact( array( 'email' => 'replyfail@example.com' ) );
		$ticket_id  = $this->create_ticket(
			array(
				'status'     => 'open',
				'contact_id' => $contact_id,
			)
		);
		add_filter( 'pre_wp_mail', '__return_false' );
		$response = $this->dispatch(
			'POST',
			"/sahajanand-erp/v1/helpdesk/tickets/{$ticket_id}/replies",
			array(
				'message' => 'Goes nowhere',
				'is_note' => false,
			)
		);
		remove_filter( 'pre_wp_mail', '__return_false' );

		$this->assertSame( 500, $response->get_status() );
		$this->assertSame( 'mail_error', $response->as_error()->get_error_code() );
		$this->assertSame( 'pending', $this->ticket_field( 'status', $ticket_id ) );
	}

	/**
	 * Reply listing is paged oldest-first with correct headers.
	 */
	public function test_get_ticket_replies_pagination() {
		$ticket_id = $this->create_ticket();
		global $wpdb;

		$messages = array( 'Oldest', 'Middle', 'Newest' );
		foreach ( $messages as $index => $message ) {
			$wpdb->insert(
				$wpdb->prefix . 'erp_helpdesk_ticket_replies',
				array(
					'ticket_id'  => $ticket_id,
					'user_id'    => 0,
					'message'    => $message,
					'is_note'    => 0,
					'created_at' => gmdate( 'Y-m-d H:i:s', time() - 600 + ( $index * 60 ) ),
				)
			);
		}

		$page1 = $this->dispatch(
			'GET',
			"/sahajanand-erp/v1/helpdesk/tickets/{$ticket_id}/replies",
			array(),
			array(
				'per_page' => 2,
				'page'     => 1,
			)
		);
		$this->assertSame( 200, $page1->get_status() );
		$this->assertSame( array( 'Oldest', 'Middle' ), wp_list_pluck( $page1->get_data(), 'message' ) );
		$this->assertSame( '3', $page1->get_headers()['X-WP-Total'] );
		$this->assertSame( '2', $page1->get_headers()['X-WP-TotalPages'] );

		$page2 = $this->dispatch(
			'GET',
			"/sahajanand-erp/v1/helpdesk/tickets/{$ticket_id}/replies",
			array(),
			array(
				'per_page' => 2,
				'page'     => 2,
			)
		);
		$this->assertSame( array( 'Newest' ), wp_list_pluck( $page2->get_data(), 'message' ) );
	}

	/**
	 * SMTP test route 404s when no mailbox exists.
	 */
	public function test_test_smtp_connection_requires_mailbox() {
		global $wpdb;
		$wpdb->delete( $wpdb->prefix . 'erp_helpdesk_mailboxes', array( 'id' => $this->mailbox_id ) );

		$response = $this->dispatch( 'GET', '/sahajanand-erp/v1/helpdesk/test-smtp' );
		$this->assertSame( 404, $response->get_status() );
		$this->assertSame( 'no_mailbox', $response->as_error()->get_error_code() );
	}

	/**
	 * SMTP test route reports mailbox settings and ssl/tls selection.
	 */
	public function test_test_smtp_connection_reports_settings() {
		add_filter( 'pre_wp_mail', '__return_true' );

		$response = $this->dispatch( 'GET', '/sahajanand-erp/v1/helpdesk/test-smtp' );
		$this->assertSame( 200, $response->get_status() );
		$data = $response->get_data();
		$this->assertTrue( $data['success'] );
		$this->assertSame( 'support@example.com', $data['mailbox'] );
		$this->assertSame( 'smtp.example.com', $data['host'] );
		$this->assertSame( 465, (int) $data['port'] );
		$this->assertSame( 'ssl', $data['secure'] );

		global $wpdb;
		$wpdb->update( $wpdb->prefix . 'erp_helpdesk_mailboxes', array( 'smtp_port' => 587 ), array( 'id' => $this->mailbox_id ) );

		$after = $this->dispatch( 'GET', '/sahajanand-erp/v1/helpdesk/test-smtp' );
		$this->assertSame( 'tls', $after->get_data()['secure'] );

		remove_filter( 'pre_wp_mail', '__return_true' );
	}

	/**
	 * Deleting non-existent ticket/mailbox/saved-reply rows still succeeds.
	 */
	public function test_delete_missing_resources_succeed() {
		$routes = array(
			'/sahajanand-erp/v1/helpdesk/tickets/999999',
			'/sahajanand-erp/v1/helpdesk/mailboxes/999999',
			'/sahajanand-erp/v1/helpdesk/saved-replies/999999',
		);
		foreach ( $routes as $route ) {
			$response = $this->dispatch( 'DELETE', $route );
			$this->assertSame( 200, $response->get_status(), "DELETE {$route}" );
			$this->assertArrayHasKey( 'message', $response->get_data() );
		}
	}

	/**
	 * The create_saved_reply handler is unrouted but works when invoked directly.
	 */
	public function test_create_saved_reply_direct_call() {
		$controller = new SAHAJANAND_ERP_API_Helpdesk();
		$request    = new WP_REST_Request( 'POST', '/sahajanand-erp/v1/helpdesk/saved-replies' );
		$request->set_header( 'Content-Type', 'application/json' );
		$request->set_body(
			wp_json_encode(
				array(
					'title'   => 'Auto reply',
					'content' => '<p>Out of office</p>',
				)
			)
		);

		$data = $controller->create_saved_reply( $request )->get_data();
		$this->assertGreaterThan( 0, (int) $data['id'] );

		global $wpdb;
		$row = $wpdb->get_row(
			$wpdb->prepare( "SELECT * FROM {$wpdb->prefix}erp_helpdesk_saved_replies WHERE id = %d", (int) $data['id'] )
		);
		$this->assertSame( 'Auto reply', $row->title );
		$this->assertSame( '<p>Out of office</p>', $row->content );
	}

	/**
	 * Unknown bulk actions are counted but never touch rows.
	 */
	public function test_bulk_unknown_action_is_noop() {
		$ticket_id = $this->create_ticket();
		$response  = $this->dispatch(
			'POST',
			'/sahajanand-erp/v1/helpdesk/tickets/bulk',
			array(
				'ids'    => array( $ticket_id ),
				'action' => 'dance',
			)
		);
		$this->assertSame( 200, $response->get_status() );
		$this->assertSame( 1, $response->get_data()['processed'] );
		$this->assertSame( 'dance', $response->get_data()['action'] );
		$this->assertSame( '0', $this->ticket_field( 'is_starred', $ticket_id ) );
	}

	/**
	 * Bulk assign with an empty value un-assigns tickets.
	 */
	public function test_bulk_assign_empty_value_unassigns() {
		$ticket_id = $this->create_ticket( array( 'assignee_id' => $this->admin_id ) );
		$this->dispatch(
			'POST',
			'/sahajanand-erp/v1/helpdesk/tickets/bulk',
			array(
				'ids'    => array( $ticket_id ),
				'action' => 'assign',
				'value'  => '',
			)
		);
		$this->assertSame( '0', $this->ticket_field( 'assignee_id', $ticket_id ) );
	}

	/**
	 * Bulk status with a truthy value reopens tickets.
	 */
	public function test_bulk_status_truthy_value_reopens() {
		$ticket_id = $this->create_ticket( array( 'status' => 'closed' ) );
		$this->dispatch(
			'POST',
			'/sahajanand-erp/v1/helpdesk/tickets/bulk',
			array(
				'ids'    => array( $ticket_id ),
				'action' => 'status',
				'value'  => 'open',
			)
		);
		$this->assertSame( 'open', $this->ticket_field( 'status', $ticket_id ) );
	}

	/**
	 * Stats report assigned counts and zeroed rows for empty mailboxes.
	 */
	public function test_helpdesk_stats_assigned_and_empty_mailbox() {
		$empty_mb = $this->create_mailbox(
			array(
				'name'          => 'Secondary',
				'email_address' => 'secondary@example.com',
			)
		);
		$this->create_ticket( array( 'assignee_id' => $this->admin_id ) );

		$response = $this->dispatch( 'GET', '/sahajanand-erp/v1/helpdesk/stats' );
		$this->assertSame( 200, $response->get_status() );

		$by_id = array();
		foreach ( $response->get_data() as $row ) {
			$by_id[ (int) $row['id'] ] = $row;
		}

		$this->assertArrayHasKey( $this->mailbox_id, $by_id );
		$this->assertSame( 1, (int) $by_id[ $this->mailbox_id ]['assigned'] );
		$this->assertSame( 1, (int) $by_id[ $this->mailbox_id ]['mine'] );
		$this->assertSame( 0, (int) $by_id[ $this->mailbox_id ]['unassigned'] );

		$this->assertArrayHasKey( $empty_mb, $by_id );
		$this->assertSame( 0, (int) $by_id[ $empty_mb ]['total'] );
		$this->assertSame( 0, (int) $by_id[ $empty_mb ]['unassigned'] );
		$this->assertSame( 0, (int) $by_id[ $empty_mb ]['assigned'] );
	}

	/**
	 * The check_permission callback accepts any logged-in user, including subscribers.
	 */
	public function test_subscriber_can_read_stats() {
		$subscriber = self::factory()->user->create( array( 'role' => 'subscriber' ) );
		wp_set_current_user( $subscriber );

		$response = $this->dispatch( 'GET', '/sahajanand-erp/v1/helpdesk/stats' );
		$this->assertSame( 200, $response->get_status() );
	}

	/**
	 * The create handler is reachable over POST as well as by direct call.
	 */
	public function test_create_saved_reply_via_route() {
		$response = $this->dispatch(
			'POST',
			'/sahajanand-erp/v1/helpdesk/saved-replies',
			array(
				'title'   => 'Route created',
				'content' => '<p>Body</p>',
			)
		);

		$this->assertSame( 200, $response->get_status() );
		$data = $response->get_data();
		$this->assertGreaterThan( 0, (int) $data['id'] );
		$this->assertSame( 'Route created', $this->saved_reply_field( 'title', (int) $data['id'] ) );
	}

	/**
	 * Saved reply creation requires an authenticated user.
	 */
	public function test_create_saved_reply_requires_auth() {
		wp_set_current_user( 0 );
		$response = $this->dispatch(
			'POST',
			'/sahajanand-erp/v1/helpdesk/saved-replies',
			array(
				'title'   => 'Anon',
				'content' => 'Nope',
			)
		);
		$this->assertTrue( in_array( $response->get_status(), array( 401, 403 ), true ) );
	}

	/**
	 * Read one column from a saved reply row.
	 *
	 * @param string $field Column name.
	 * @param int    $id    Saved reply ID.
	 * @return string|null
	 */
	private function saved_reply_field( $field, $id ) {
		global $wpdb;
		$table = $wpdb->prefix . 'erp_helpdesk_saved_replies';
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- Column name comes from internal call sites.
		return $wpdb->get_var( $wpdb->prepare( "SELECT {$field} FROM {$table} WHERE id = %d", $id ) );
	}

	/**
	 * Read one column from a ticket row.
	 *
	 * @param string $field Column name.
	 * @param int    $id    Ticket ID.
	 * @return string|null
	 */
	private function ticket_field( $field, $id ) {
		global $wpdb;
		$table = $wpdb->prefix . 'erp_helpdesk_tickets';
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- Column name comes from internal call sites.
		return $wpdb->get_var( $wpdb->prepare( "SELECT {$field} FROM {$table} WHERE id = %d", $id ) );
	}
}
