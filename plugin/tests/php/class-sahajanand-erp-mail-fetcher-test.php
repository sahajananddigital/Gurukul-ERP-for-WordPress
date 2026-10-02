<?php
/**
 * Mail fetcher unit tests.
 *
 * @package Sahajanand_ERP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/helpers/class-helpdesk-test-case.php';

/**
 * Tests for SAHAJANAND_ERP_Mail_Fetcher.
 */
class SAHAJANAND_ERP_Mail_Fetcher_Test extends SAHAJANAND_ERP_Helpdesk_Test_Case {

	/**
	 * Skip the suite when the fetcher class is unavailable.
	 */
	public function setUp(): void {
		parent::setUp();

		if ( ! class_exists( 'SAHAJANAND_ERP_Mail_Fetcher' ) ) {
			$this->markTestSkipped( 'Mail fetcher missing' );
		}
	}

	/**
	 * The Action Scheduler hook added during bootstrap maps to fetch_emails().
	 */
	public function test_fetch_emails_action_is_registered() {
		$this->assertNotFalse(
			has_action( 'erp_helpdesk_fetch_emails', array( 'SAHAJANAND_ERP_Mail_Fetcher', 'fetch_emails' ) )
		);
	}

	/**
	 * Legacy wp-cron events for the fetch hook are cleared by init().
	 */
	public function test_init_clears_legacy_cron_event() {
		wp_unschedule_hook( 'erp_helpdesk_fetch_emails' );
		wp_schedule_single_event( time(), 'erp_helpdesk_fetch_emails' );
		$this->assertIsInt( wp_next_scheduled( 'erp_helpdesk_fetch_emails' ) );

		SAHAJANAND_ERP_Mail_Fetcher::init();

		$this->assertFalse( wp_next_scheduled( 'erp_helpdesk_fetch_emails' ) );
		wp_unschedule_hook( 'erp_helpdesk_fetch_emails' );
	}

	/**
	 * Mailboxes without an IMAP host are filtered out of the fetch query.
	 */
	public function test_fetch_emails_returns_early_without_imap_hosts() {
		global $wpdb;
		$mailboxes = $wpdb->prefix . 'erp_helpdesk_mailboxes';

		$wpdb->update( $mailboxes, array( 'imap_host' => null ), array( 'id' => $this->mailbox_id ) );
		$this->assertNull( SAHAJANAND_ERP_Mail_Fetcher::fetch_emails() );

		$wpdb->update( $mailboxes, array( 'imap_host' => '' ), array( 'id' => $this->mailbox_id ) );
		$this->assertNull( SAHAJANAND_ERP_Mail_Fetcher::fetch_emails() );

		$tickets = $wpdb->prefix . 'erp_helpdesk_tickets';
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$this->assertSame( 0, (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$tickets}" ) );
	}

	/**
	 * A subject referencing [Ticket #123] stores a customer reply, not a ticket.
	 */
	public function test_process_message_adds_reply_for_ticket_reference() {
		$ticket_id = $this->create_ticket( array( 'subject' => 'Reset help' ) );
		$message   = $this->make_message(
			array(
				'subject'    => 're: [ticket #' . $ticket_id . '] still broken',
				'text_body'  => 'Please retry the reset.',
				'mail'       => 'replyer@example.com',
				'message_id' => '<reply-1@mail.local>',
			)
		);

		$this->invoke_process_message( $message, $this->get_mailbox_row() );

		global $wpdb;
		$replies = $wpdb->get_results( "SELECT * FROM {$wpdb->prefix}erp_helpdesk_ticket_replies" ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$this->assertCount( 1, $replies );

		$reply = $replies[0];
		$this->assertSame( $ticket_id, (int) $reply->ticket_id );
		$this->assertSame( 0, (int) $reply->user_id );
		$this->assertSame( 0, (int) $reply->is_note );
		$this->assertSame( '<reply-1@mail.local>', $reply->message_id );
		$this->assertSame( trim( '<p>Please retry the reset.</p>' ), trim( $reply->message ) );
		$this->assertSame( '', (string) $reply->attachment_ids );

		$tickets = $wpdb->get_results( "SELECT * FROM {$wpdb->prefix}erp_helpdesk_tickets" ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$this->assertCount( 1, $tickets, 'No new ticket should be created for a reply subject.' );
	}

	/**
	 * An unknown subject opens a new ticket and auto-creates the CRM contact.
	 */
	public function test_process_message_creates_ticket_and_contact() {
		$message = $this->make_message(
			array(
				'subject'    => 'Printer on fire',
				'text_body'  => "Smoke everywhere\n\nSending help",
				'mail'       => 'new.person@example.com',
				'personal'   => 'Navin Kumar',
				'message_id' => '<new-1@mail.local>',
				'raw'        => 'RAW EMAIL SOURCE',
			)
		);

		$this->invoke_process_message( $message, $this->get_mailbox_row() );

		global $wpdb;
		$contact = $wpdb->get_row( // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			"SELECT * FROM {$wpdb->prefix}erp_crm_contacts WHERE email = 'new.person@example.com'"
		);
		$this->assertNotNull( $contact, 'Contact should be auto-created.' );
		$this->assertSame( 'Navin', $contact->first_name );
		$this->assertSame( 'Kumar', $contact->last_name );

		$ticket = $wpdb->get_row( "SELECT * FROM {$wpdb->prefix}erp_helpdesk_tickets ORDER BY id DESC LIMIT 1" ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$this->assertNotNull( $ticket );
		$this->assertSame( 'Printer on fire', $ticket->subject );
		$this->assertSame( 'open', $ticket->status );
		$this->assertSame( $this->mailbox_id, (int) $ticket->mailbox_id );
		$this->assertSame( (int) $contact->id, (int) $ticket->contact_id );
		$this->assertSame( '<new-1@mail.local>', $ticket->message_id );
		$this->assertSame( 'RAW EMAIL SOURCE', $ticket->raw_email );
		$this->assertSame( '#' . $ticket->id, $ticket->ticket_no );
		$this->assertStringContainsString( '<p>Smoke everywhere</p>', $ticket->description );
	}

	/**
	 * An existing contact email is matched instead of creating a duplicate.
	 */
	public function test_process_message_reuses_existing_contact() {
		$contact_id = $this->create_contact( array( 'email' => 'jane@example.com' ) );
		$message    = $this->make_message(
			array(
				'subject'  => 'Hi there',
				'mail'     => 'jane@example.com',
				'personal' => 'Jane Doe',
			)
		);

		$this->invoke_process_message( $message, $this->get_mailbox_row() );

		global $wpdb;
		// The user factory also seeds contacts, so count only matches for this email.
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$this->assertSame(
			1,
			(int) $wpdb->get_var( "SELECT COUNT(*) FROM {$wpdb->prefix}erp_crm_contacts WHERE email = 'jane@example.com'" )
		);

		$ticket = $wpdb->get_row( "SELECT * FROM {$wpdb->prefix}erp_helpdesk_tickets ORDER BY id DESC LIMIT 1" ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$this->assertSame( $contact_id, (int) $ticket->contact_id );
	}

	/**
	 * A single-word display name lands entirely in first_name.
	 */
	public function test_process_message_splits_single_word_name() {
		$message = $this->make_message(
			array(
				'subject'  => 'Solo sender',
				'mail'     => 'solo@example.com',
				'personal' => 'Navin',
			)
		);

		$this->invoke_process_message( $message, $this->get_mailbox_row() );

		global $wpdb;
		$contact = $wpdb->get_row( // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			"SELECT * FROM {$wpdb->prefix}erp_crm_contacts WHERE email = 'solo@example.com'"
		);
		$this->assertNotNull( $contact );
		$this->assertSame( 'Navin', $contact->first_name );
		$this->assertSame( '', $contact->last_name );
	}

	/**
	 * Plain text bodies fall back from text to HTML part.
	 */
	public function test_process_message_falls_back_to_html_body() {
		$message = $this->make_message(
			array(
				'subject'   => 'HTML only',
				'text_body' => '',
				'html_body' => '<p>HTML body</p>',
			)
		);

		$this->invoke_process_message( $message, $this->get_mailbox_row() );

		global $wpdb;
		$description = $wpdb->get_var( "SELECT description FROM {$wpdb->prefix}erp_helpdesk_tickets ORDER BY id DESC LIMIT 1" ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$this->assertStringContainsString( 'HTML body', (string) $description );
	}

	/**
	 * A failing raw source fetch stores an empty raw_email.
	 */
	public function test_process_message_stores_blank_raw_email_on_failure() {
		$message = $this->make_message(
			array(
				'subject'    => 'No source',
				'raw_throws' => true,
			)
		);

		$this->invoke_process_message( $message, $this->get_mailbox_row() );

		global $wpdb;
		$raw = $wpdb->get_var( "SELECT raw_email FROM {$wpdb->prefix}erp_helpdesk_tickets ORDER BY id DESC LIMIT 1" ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$this->assertSame( '', (string) $raw );
	}

	/**
	 * Missing or failing attachment lists produce an empty attachment CSV.
	 */
	public function test_import_attachments_handles_empty_and_failure() {
		$empty = $this->make_message( array( 'attachments' => array() ) );
		$this->assertSame( '', $this->invoke_import_attachments( $empty ) );

		$throwing = $this->make_message( array( 'attachments_throw' => true ) );
		$this->assertSame( '', $this->invoke_import_attachments( $throwing ) );
	}

	/**
	 * Attachments with content are imported into the media library in order.
	 */
	public function test_import_attachments_skips_empty_and_imports_valid() {
		$attachments = array(
			$this->make_attachment( 'empty.txt', '' ),
			$this->make_attachment( 'note.txt', 'hello world' ),
			$this->make_attachment( 'second.txt', 'again' ),
		);
		$message     = $this->make_message( array( 'attachments' => $attachments ) );

		$result = $this->invoke_import_attachments( $message );
		$ids    = array_filter( array_map( 'intval', explode( ',', $result ) ) );

		$this->assertCount( 2, $ids, 'Only non-empty attachments should import.' );
		foreach ( $ids as $attachment_id ) {
			$this->assertGreaterThan( 0, $attachment_id );
			$this->assertSame( 'text/plain', get_post_mime_type( $attachment_id ) );
		}
		// The first imported attachment must be note.txt.
		$this->assertStringContainsString( 'note', (string) get_post_field( 'post_title', $ids[0] ) );

		foreach ( $ids as $attachment_id ) {
			wp_delete_attachment( $attachment_id, true );
		}
	}

	/**
	 * Invoke the private process_message() with a stub IMAP message.
	 *
	 * @param object $message Stub message.
	 * @param object $mailbox Mailbox row.
	 * @return void
	 */
	private function invoke_process_message( $message, $mailbox ) {
		$method = new ReflectionMethod( 'SAHAJANAND_ERP_Mail_Fetcher', 'process_message' );
		$method->setAccessible( true );
		$method->invoke( null, $message, $mailbox );
	}

	/**
	 * Invoke the private import_attachments() with a stub IMAP message.
	 *
	 * @param object $message Stub message.
	 * @return string
	 */
	private function invoke_import_attachments( $message ) {
		$method = new ReflectionMethod( 'SAHAJANAND_ERP_Mail_Fetcher', 'import_attachments' );
		$method->setAccessible( true );
		return (string) $method->invoke( null, $message );
	}

	/**
	 * The seeded mailbox row as stored in the database.
	 *
	 * @return object|null
	 */
	private function get_mailbox_row() {
		global $wpdb;
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		return $wpdb->get_row( "SELECT * FROM {$wpdb->prefix}erp_helpdesk_mailboxes WHERE id = {$this->mailbox_id}" );
	}

	/**
	 * Build a stub IMAP message.
	 *
	 * @param array $args Overrides for the stub behaviour.
	 * @return object
	 */
	private function make_message( array $args = array() ) {
		$args = array_merge(
			array(
				'subject'           => 'Hello',
				'text_body'         => 'Body text',
				'html_body'         => '',
				'mail'              => 'sender@example.com',
				'personal'          => 'Test Sender',
				'message_id'        => '<default@mail.local>',
				'raw'               => 'RAW SOURCE',
				'raw_throws'        => false,
				'attachments'       => array(),
				'attachments_throw' => false,
			),
			$args
		);

		// phpcs:disable WordPress.NamingConventions.ValidFunctionName.MethodNameInvalid
		return new class( $args ) {

			/**
			 * Stub configuration.
			 *
			 * @var array
			 */
			protected $args;

			/**
			 * Store configuration.
			 *
			 * @param array $args Stub values.
			 */
			public function __construct( $args ) {
				$this->args = $args;
			}

			/**
			 * Message subject.
			 *
			 * @return string
			 */
			public function getSubject() {
				return $this->args['subject'];
			}

			/**
			 * Plain-text body.
			 *
			 * @return string
			 */
			public function getTextBody() {
				return $this->args['text_body'];
			}

			/**
			 * HTML body.
			 *
			 * @return string
			 */
			public function getHTMLBody() {
				return $this->args['html_body'];
			}

			/**
			 * Sender list.
			 *
			 * @return array
			 */
			public function getFrom() {
				$from       = new stdClass();
				$from->mail = $this->args['mail'];
				if ( null !== $this->args['personal'] ) {
					$from->personal = $this->args['personal'];
				}
				return array( $from );
			}

			/**
			 * Message-ID header.
			 *
			 * @return string
			 */
			public function getMessageId() {
				return $this->args['message_id'];
			}

			/**
			 * RFC 822 source, optionally failing.
			 *
			 * @return string
			 * @throws RuntimeException When raw_throws is set.
			 */
			public function getRawSource() {
				if ( $this->args['raw_throws'] ) {
					throw new RuntimeException( 'Raw source unavailable' );
				}
				return $this->args['raw'];
			}

			/**
			 * Attachment list, optionally failing.
			 *
			 * @return array
			 * @throws RuntimeException When attachments_throw is set.
			 */
			public function getAttachments() {
				if ( $this->args['attachments_throw'] ) {
					throw new RuntimeException( 'Attachments unavailable' );
				}
				return $this->args['attachments'];
			}
		};
		// phpcs:enable WordPress.NamingConventions.ValidFunctionName.MethodNameInvalid
	}

	/**
	 * Build a stub IMAP attachment.
	 *
	 * @param string $name    File name.
	 * @param string $content File content.
	 * @return object
	 */
	private function make_attachment( $name, $content ) {
		// phpcs:disable WordPress.NamingConventions.ValidFunctionName.MethodNameInvalid
		return new class( $name, $content ) {

			/**
			 * File name.
			 *
			 * @var string
			 */
			protected $name;

			/**
			 * File content.
			 *
			 * @var string
			 */
			protected $content;

			/**
			 * Store attachment data.
			 *
			 * @param string $name    File name.
			 * @param string $content File content.
			 */
			public function __construct( $name, $content ) {
				$this->name    = $name;
				$this->content = $content;
			}

			/**
			 * File name.
			 *
			 * @return string
			 */
			public function getName() {
				return $this->name;
			}

			/**
			 * File content.
			 *
			 * @return string
			 */
			public function getContent() {
				return $this->content;
			}

			/**
			 * Attachment mime type.
			 *
			 * @return string
			 */
			public function getMimeType() {
				return 'text/plain';
			}
		};
		// phpcs:enable WordPress.NamingConventions.ValidFunctionName.MethodNameInvalid
	}
}
