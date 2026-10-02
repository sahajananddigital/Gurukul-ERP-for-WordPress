<?php
/**
 * Mail sender unit/integration tests.
 *
 * @package Sahajanand_ERP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/helpers/class-helpdesk-test-case.php';

/**
 * Tests for SAHAJANAND_ERP_Mail_Sender.
 */
class SAHAJANAND_ERP_Mail_Sender_Test extends SAHAJANAND_ERP_Helpdesk_Test_Case {

	/**
	 * Missing ticket returns false.
	 */
	public function test_send_reply_missing_ticket() {
		if ( ! class_exists( 'SAHAJANAND_ERP_Mail_Sender' ) ) {
			$this->markTestSkipped( 'Mail sender missing' );
		}
		$result = SAHAJANAND_ERP_Mail_Sender::send_reply( 999999, 1 );
		$this->assertFalse( $result );
	}

	/**
	 * Notes are not emailed.
	 */
	public function test_send_reply_skips_notes() {
		if ( ! class_exists( 'SAHAJANAND_ERP_Mail_Sender' ) ) {
			$this->markTestSkipped( 'Mail sender missing' );
		}
		$contact_id = $this->create_contact();
		$ticket_id  = $this->create_ticket( array( 'contact_id' => $contact_id ) );

		global $wpdb;
		$wpdb->insert(
			$wpdb->prefix . 'erp_helpdesk_ticket_replies',
			array(
				'ticket_id' => $ticket_id,
				'user_id'   => $this->admin_id,
				'message'   => 'Note body',
				'is_note'   => 1,
			)
		);
		$reply_id = (int) $wpdb->insert_id;

		$result = SAHAJANAND_ERP_Mail_Sender::send_reply( $ticket_id, $reply_id );
		$this->assertFalse( $result );
	}

	/**
	 * Missing contact email returns false.
	 */
	public function test_send_reply_requires_contact_email() {
		if ( ! class_exists( 'SAHAJANAND_ERP_Mail_Sender' ) ) {
			$this->markTestSkipped( 'Mail sender missing' );
		}
		$ticket_id = $this->create_ticket( array( 'contact_id' => null ) );
		global $wpdb;
		$wpdb->insert(
			$wpdb->prefix . 'erp_helpdesk_ticket_replies',
			array(
				'ticket_id' => $ticket_id,
				'user_id'   => $this->admin_id,
				'message'   => 'Hello',
				'is_note'   => 0,
			)
		);
		$reply_id = (int) $wpdb->insert_id;
		$result   = SAHAJANAND_ERP_Mail_Sender::send_reply( $ticket_id, $reply_id );
		$this->assertFalse( $result );
	}

	/**
	 * Build a ticket + public reply fixture and return [ticket_id, reply_id].
	 *
	 * @param array $ticket_overrides Ticket fixture overrides.
	 * @return array
	 */
	private function create_reply_fixture( $ticket_overrides = array() ) {
		if ( ! array_key_exists( 'contact_id', $ticket_overrides ) ) {
			$ticket_overrides['contact_id'] = $this->create_contact( array( 'email' => 'customer@example.com' ) );
		}
		$ticket_id = $this->create_ticket( $ticket_overrides );

		global $wpdb;
		$wpdb->insert(
			$wpdb->prefix . 'erp_helpdesk_ticket_replies',
			array(
				'ticket_id' => $ticket_id,
				'user_id'   => $this->admin_id,
				'message'   => '<p>Reply body</p>',
				'is_note'   => 0,
			)
		);

		return array( $ticket_id, (int) $wpdb->insert_id );
	}

	/**
	 * Failing wp_mail produces a WP_Error with the unknown-mail message.
	 */
	public function test_send_reply_failure_returns_wp_error() {
		if ( ! class_exists( 'SAHAJANAND_ERP_Mail_Sender' ) ) {
			$this->markTestSkipped( 'Mail sender missing' );
		}
		list( $ticket_id, $reply_id ) = $this->create_reply_fixture();

		add_filter( 'pre_wp_mail', '__return_false' );
		$result = SAHAJANAND_ERP_Mail_Sender::send_reply( $ticket_id, $reply_id );
		remove_filter( 'pre_wp_mail', '__return_false' );

		$this->assertWPError( $result );
		$this->assertSame( 'mail_failed', $result->get_error_code() );
		$this->assertSame( 'Unknown mail error', $result->get_error_message() );
	}

	/**
	 * The wp_mail_failed action message is surfaced through the returned WP_Error.
	 */
	public function test_send_reply_captures_wp_mail_failed_message() {
		if ( ! class_exists( 'SAHAJANAND_ERP_Mail_Sender' ) ) {
			$this->markTestSkipped( 'Mail sender missing' );
		}
		list( $ticket_id, $reply_id ) = $this->create_reply_fixture();

		add_filter(
			'pre_wp_mail',
			function () {
				do_action( 'wp_mail_failed', new WP_Error( 'wp_mail_error', 'SMTP connect failed' ) );
				return false;
			}
		);
		$result = SAHAJANAND_ERP_Mail_Sender::send_reply( $ticket_id, $reply_id );
		remove_all_filters( 'pre_wp_mail' );

		$this->assertWPError( $result );
		$this->assertSame( 'SMTP connect failed', $result->get_error_message() );
	}

	/**
	 * Subject, From/Reply-To headers and mailbox signature are composed.
	 */
	public function test_send_reply_composes_subject_headers_and_signature() {
		if ( ! class_exists( 'SAHAJANAND_ERP_Mail_Sender' ) ) {
			$this->markTestSkipped( 'Mail sender missing' );
		}

		global $wpdb;
		$wpdb->update(
			$wpdb->prefix . 'erp_helpdesk_mailboxes',
			array( 'signature' => 'Best regards' ),
			array( 'id' => $this->mailbox_id )
		);

		list( $ticket_id, $reply_id ) = $this->create_reply_fixture( array( 'subject' => 'Invoice stuck' ) );
		$ticket_no                    = $wpdb->get_var(
			$wpdb->prepare( "SELECT ticket_no FROM {$wpdb->prefix}erp_helpdesk_tickets WHERE id = %d", $ticket_id )
		);

		$captured = null;
		add_filter(
			'pre_wp_mail',
			function ( $pre, $atts ) use ( &$captured ) {
				$captured = $atts;
				return true;
			},
			10,
			2
		);
		$result = SAHAJANAND_ERP_Mail_Sender::send_reply( $ticket_id, $reply_id );
		remove_all_filters( 'pre_wp_mail' );

		$this->assertTrue( $result );
		$this->assertIsArray( $captured );
		$this->assertSame( 'customer@example.com', $captured['to'] );
		$this->assertSame( 'Re: [Ticket ' . $ticket_no . '] Invoice stuck', $captured['subject'] );
		$this->assertSame( "<p>Reply body</p>\n\n--\nBest regards", $captured['message'] );
		$this->assertContains( 'From: Support <support@example.com>', $captured['headers'] );
		$this->assertContains( 'Reply-To: support@example.com', $captured['headers'] );
		$this->assertContains( 'Content-Type: text/html; charset=UTF-8', $captured['headers'] );
	}

	/**
	 * The phpmailer_init hook is only wired up when the mailbox declares an SMTP host.
	 */
	public function test_send_reply_registers_phpmailer_only_with_smtp_host() {
		if ( ! class_exists( 'SAHAJANAND_ERP_Mail_Sender' ) ) {
			$this->markTestSkipped( 'Mail sender missing' );
		}

		$observed = array();
		add_filter(
			'pre_wp_mail',
			function ( ...$args ) use ( &$observed ) {
				$observed[] = has_action( 'phpmailer_init' );
				return true;
			}
		);

		// Mailbox fixture has smtp_host set -> hook registered while sending.
		list( $ticket_id, $reply_id ) = $this->create_reply_fixture();
		SAHAJANAND_ERP_Mail_Sender::send_reply( $ticket_id, $reply_id );
		$this->assertNotFalse( $observed[0], 'SMTP mailbox must register phpmailer_init.' );

		// Mailbox without smtp_host -> no SMTP hook wiring.
		global $wpdb;
		$plain_mailbox                = $this->create_mailbox(
			array(
				'name'          => 'Plain',
				'email_address' => 'plain@example.com',
				'smtp_host'     => '',
			)
		);
		list( $ticket_id, $reply_id ) = $this->create_reply_fixture( array( 'mailbox_id' => $plain_mailbox ) );
		SAHAJANAND_ERP_Mail_Sender::send_reply( $ticket_id, $reply_id );
		$this->assertFalse( $observed[1], 'Mailbox without SMTP host must not register phpmailer_init.' );

		remove_all_filters( 'pre_wp_mail' );
	}

	/**
	 * Attachments are resolved to existing files, missing IDs are skipped.
	 */
	public function test_send_reply_attaches_existing_files_only() {
		if ( ! class_exists( 'SAHAJANAND_ERP_Mail_Sender' ) ) {
			$this->markTestSkipped( 'Mail sender missing' );
		}
		$path = sys_get_temp_dir() . '/erp-send-' . wp_generate_password( 6, false ) . '.txt';
		file_put_contents( $path, "attached\n" );
		$attachment_id = self::factory()->attachment->create_upload_object( $path );
		wp_delete_file( $path );

		list( $ticket_id, $reply_id ) = $this->create_reply_fixture();
		global $wpdb;
		$wpdb->update(
			$wpdb->prefix . 'erp_helpdesk_ticket_replies',
			array( 'attachment_ids' => $attachment_id . ',999999' ),
			array( 'id' => $reply_id )
		);

		$captured = null;
		add_filter(
			'pre_wp_mail',
			function ( $pre, $atts ) use ( &$captured ) {
				$captured = $atts;
				return true;
			},
			10,
			2
		);
		$result = SAHAJANAND_ERP_Mail_Sender::send_reply( $ticket_id, $reply_id );
		remove_all_filters( 'pre_wp_mail' );

		$this->assertTrue( $result );
		$this->assertCount( 1, $captured['attachments'], 'Missing attachment files must be skipped.' );
		$this->assertSame( get_attached_file( $attachment_id ), $captured['attachments'][0] );

		wp_delete_attachment( $attachment_id, true );
	}

	/**
	 * Successful send uses wp_mail filter.
	 */
	public function test_send_reply_success_with_wp_mail() {
		if ( ! class_exists( 'SAHAJANAND_ERP_Mail_Sender' ) ) {
			$this->markTestSkipped( 'Mail sender missing' );
		}
		list( $ticket_id, $reply_id ) = $this->create_reply_fixture();

		$sent = false;
		add_filter(
			'pre_wp_mail',
			function ( $pre, $atts ) use ( &$sent ) {
				$sent = true;
				$this->assertSame( 'customer@example.com', $atts['to'] );
				return true;
			},
			10,
			2
		);

		$result = SAHAJANAND_ERP_Mail_Sender::send_reply( $ticket_id, $reply_id );
		remove_all_filters( 'pre_wp_mail' );

		$this->assertTrue( $result );
		$this->assertTrue( $sent );
	}
}
