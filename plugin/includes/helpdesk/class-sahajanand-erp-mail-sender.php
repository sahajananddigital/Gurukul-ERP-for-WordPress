<?php
/**
 * Mail Sender for Helpdesk
 *
 * @package Gurukul_ERP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class SAHAJANAND_ERP_Mail_Sender {

	public static function send_reply( $ticket_id, $reply_id ) {
		global $wpdb;
		
		$tickets_table = $wpdb->prefix . 'erp_helpdesk_tickets';
		$replies_table = $wpdb->prefix . 'erp_helpdesk_ticket_replies';
		$mailboxes_table = $wpdb->prefix . 'erp_helpdesk_mailboxes';
		$contacts_table = $wpdb->prefix . 'erp_crm_contacts';
		
		$ticket = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $tickets_table WHERE id = %d", $ticket_id ) );
		$reply = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $replies_table WHERE id = %d", $reply_id ) );
		
		if ( ! $ticket || ! $reply || $reply->is_note ) {
			return false;
		}
		
		$mailbox = null;
		if ( $ticket->mailbox_id ) {
			$mailbox = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $mailboxes_table WHERE id = %d", $ticket->mailbox_id ) );
		}
		
		$customer_email = '';
		if ( $ticket->contact_id ) {
			$contact = $wpdb->get_row( $wpdb->prepare( "SELECT email FROM $contacts_table WHERE id = %d", $ticket->contact_id ) );
			if ( $contact && !empty( $contact->email ) ) {
				$customer_email = $contact->email;
			}
		}
		
		if ( empty( $customer_email ) ) {
			return false;
		}

		$subject = 'Re: [Ticket ' . $ticket->ticket_no . '] ' . $ticket->subject;
		$body = $reply->message;
		
		if ( $mailbox && !empty($mailbox->signature) ) {
			$body .= "\n\n--\n" . $mailbox->signature;
		}

		$headers = array('Content-Type: text/html; charset=UTF-8');
		
		$result = false;
		$error_message = '';
		
		$error_action = function( $wp_error ) use ( &$error_message ) {
			$error_message = $wp_error->get_error_message();
			error_log( 'ERP SMTP Error: ' . $error_message );
		};
		add_action( 'wp_mail_failed', $error_action );
		
		if ( $mailbox && !empty($mailbox->smtp_host) ) {
			$phpmailer_action = function( $phpmailer ) use ( $mailbox ) {
				$phpmailer->isSMTP();
				$phpmailer->Host = $mailbox->smtp_host;
				$phpmailer->SMTPAuth = true;
				$phpmailer->Port = $mailbox->smtp_port;
				$phpmailer->Username = $mailbox->smtp_user;
				$phpmailer->Password = $mailbox->smtp_pass;
				$phpmailer->SMTPSecure = ( $mailbox->smtp_port == 465 ) ? 'ssl' : 'tls';
				$phpmailer->SMTPOptions = array(
					'ssl' => array(
						'verify_peer'       => false,
						'verify_peer_name'  => false,
						'allow_self_signed' => true
					)
				);
				$phpmailer->From = $mailbox->email_address;
				$phpmailer->FromName = $mailbox->name;
			};
			add_action( 'phpmailer_init', $phpmailer_action );
			
			$result = wp_mail( $customer_email, $subject, $body, $headers );
			remove_action( 'phpmailer_init', $phpmailer_action );
		} else {
			$result = wp_mail( $customer_email, $subject, $body, $headers );
		}
		
		remove_action( 'wp_mail_failed', $error_action );
		
		if ( !$result ) {
			return new WP_Error( 'mail_failed', $error_message ? $error_message : 'Unknown mail error' );
		}
		
		return $result;
	}
}
