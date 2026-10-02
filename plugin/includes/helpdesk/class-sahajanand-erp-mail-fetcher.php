<?php
/**
 * Mail Fetcher for Helpdesk using Webklex/php-imap
 *
 * @package Sahajanand_ERP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Webklex\PHPIMAP\ClientManager;

class SAHAJANAND_ERP_Mail_Fetcher {

	public static function init() {
		add_action( 'erp_helpdesk_fetch_emails', array( __CLASS__, 'fetch_emails' ) );
		
		// Migrate from wp_cron to Action Scheduler
		if ( wp_next_scheduled( 'erp_helpdesk_fetch_emails' ) ) {
			wp_clear_scheduled_hook( 'erp_helpdesk_fetch_emails' );
		}
		
		// Schedule event if not exists via Action Scheduler
		if ( function_exists( 'as_next_scheduled_action' ) && false === as_next_scheduled_action( 'erp_helpdesk_fetch_emails' ) ) {
			as_schedule_recurring_action( time(), HOUR_IN_SECONDS, 'erp_helpdesk_fetch_emails' );
		}
	}

	public static function fetch_emails() {
		global $wpdb;
		$mailboxes_table = $wpdb->prefix . 'erp_helpdesk_mailboxes';
		$mailboxes = $wpdb->get_results( "SELECT * FROM $mailboxes_table WHERE imap_host IS NOT NULL AND imap_host != ''" );
		
		if ( empty( $mailboxes ) || ! class_exists('Webklex\PHPIMAP\ClientManager') ) {
			return;
		}
		
		$cm = new ClientManager();
		
		foreach ( $mailboxes as $mailbox ) {
			try {
				$client = $cm->make([
					'host'          => $mailbox->imap_host,
					'port'          => $mailbox->imap_port,
					'encryption' => ($mailbox->imap_port == 993) ? 'ssl' : false,
					'validate_cert' => false,
					'username'      => $mailbox->imap_user,
					'password'      => $mailbox->imap_pass,
					'protocol'      => 'imap'
				]);
				
				$client->connect();
				
				$folder = $client->getFolder('INBOX');
				$messages = $folder->query()->unseen()->get();
				
				foreach( $messages as $message ) {
					self::process_message( $message, $mailbox );
					// Mark as seen
					$message->setFlag(['Seen']);
				}
				
				$client->disconnect();
			} catch ( \Exception $e ) {
				error_log('ERP IMAP Error: ' . $e->getMessage());
			}
		}
	}
	
	private static function process_message( $message, $mailbox ) {
		global $wpdb;
		
		$subject = $message->getSubject();
		$body = $message->getTextBody() ?: $message->getHTMLBody();
		$from = $message->getFrom()[0]->mail;
		$message_id = $message->getMessageId();
		$attachment_ids = self::import_attachments( $message );

		$raw_email = '';
		try {
			$raw_email = $message->getRawSource();
		} catch ( \Exception $e ) {
			$raw_email = '';
		}
		
		// Very basic parsing for Phase 1. 
		// If subject contains [Ticket #123], map to existing ticket.
		$ticket_id = null;
		if ( preg_match('/\[Ticket #(\d+)\]/i', $subject, $matches) ) {
			$ticket_id = intval($matches[1]);
		}
		
		if ( $ticket_id ) {
			// Add as reply
			$wpdb->insert(
				$wpdb->prefix . 'erp_helpdesk_ticket_replies',
				array(
					'ticket_id' => $ticket_id,
					'user_id' => 0, // 0 for customer
					'message' => wpautop( wp_kses_post( $body ) ),
					'is_note' => 0,
					'message_id' => $message_id,
					'attachment_ids' => $attachment_ids,
				)
			);
		} else {
			// Create new ticket
			// Check if contact exists
			$contact_id = 0;
			$contact = $wpdb->get_row( $wpdb->prepare( "SELECT id FROM {$wpdb->prefix}erp_crm_contacts WHERE email = %s", $from ) );
			if ( $contact ) {
				$contact_id = $contact->id;
			} else {
				// Auto-create contact
				$from_name = $message->getFrom()[0]->personal ?? '';
				$name_parts = explode(' ', $from_name, 2);
				$first_name = sanitize_text_field( $name_parts[0] );
				$last_name = isset($name_parts[1]) ? sanitize_text_field( $name_parts[1] ) : '';
				
				$wpdb->insert(
					$wpdb->prefix . 'erp_crm_contacts',
					array(
						'first_name' => $first_name,
						'last_name' => $last_name,
						'email' => sanitize_email( $from ),
						
					)
				);
				$contact_id = $wpdb->insert_id;
			}
			
			$wpdb->insert(
				$wpdb->prefix . 'erp_helpdesk_tickets',
				array(
					'subject' => sanitize_text_field( $subject ),
					'description' => wpautop( wp_kses_post( $body ) ),
					'contact_id' => $contact_id,
					'mailbox_id' => $mailbox->id,
					'message_id' => $message_id,
					'attachment_ids' => $attachment_ids,
					'raw_email' => $raw_email,
					'status' => 'open'
				)
			);
			$ticket_id = $wpdb->insert_id;
			$wpdb->update( $wpdb->prefix . 'erp_helpdesk_tickets', array( 'ticket_no' => '#' . $ticket_id ), array( 'id' => $ticket_id ) );
		}
	}

	/**
	 * Import a message's attachments into the media library.
	 *
	 * @param object $message IMAP message.
	 * @return string Comma separated attachment IDs.
	 */
	private static function import_attachments( $message ) {
		try {
			$attachments = $message->getAttachments();
		} catch ( \Exception $e ) {
			return '';
		}

		if ( empty( $attachments ) ) {
			return '';
		}

		require_once ABSPATH . 'wp-admin/includes/image.php';
		require_once ABSPATH . 'wp-admin/includes/file.php';

		$attachment_ids = array();

		foreach ( $attachments as $attachment ) {
			try {
				$filename = sanitize_file_name( $attachment->getName() );
				$content  = $attachment->getContent();

				if ( empty( $filename ) || empty( $content ) ) {
					continue;
				}

				$upload = wp_upload_bits( $filename, null, $content );
				if ( ! empty( $upload['error'] ) ) {
					continue;
				}

				$mime = $attachment->getMimeType();

				$attachment_id = wp_insert_attachment(
					array(
						'post_mime_type' => $mime ? $mime : 'application/octet-stream',
						'post_title'     => pathinfo( $filename, PATHINFO_FILENAME ),
						'post_status'    => 'inherit',
					),
					$upload['file']
				);

				if ( is_wp_error( $attachment_id ) || ! $attachment_id ) {
					continue;
				}

				wp_update_attachment_metadata( $attachment_id, wp_generate_attachment_metadata( $attachment_id, $upload['file'] ) );

				$attachment_ids[] = $attachment_id;
			} catch ( \Exception $e ) {
				continue;
			}
		}

		return implode( ',', $attachment_ids );
	}
}
