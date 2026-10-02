<?php
/**
 * Helpdesk API Controller (tickets, replies, mailboxes, saved replies, mail fetch).
 *
 * @package Sahajanand_ERP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/class-sahajanand-erp-api-controller.php';

class SAHAJANAND_ERP_API_Helpdesk extends SAHAJANAND_ERP_API_Controller {

	/**
	 * Register routes
	 */
	public function register_routes() {
		register_rest_route(
			$this->namespace,
			'/helpdesk/test-smtp',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'test_smtp_connection' ),
					'permission_callback' => '__return_true',
				),
			)
		);
		register_rest_route(
			$this->namespace,
			'/helpdesk/fetch-emails',
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'permission_callback' => '__return_true',
					'callback'            => array( $this, 'trigger_mail_fetch' ),
					'permission_callback' => '__return_true',
				),
			)
		);
		register_rest_route(
			$this->namespace,
			'/helpdesk/mailboxes/test-connection',
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'test_mailbox_connection' ),
					'permission_callback' => array( $this, 'check_permission' ),
				),
			)
		);
		register_rest_route(
			$this->namespace,
			'/helpdesk/mailboxes',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_mailboxes' ),
					'permission_callback' => '__return_true',
				),
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'permission_callback' => '__return_true',
					'callback'            => array( $this, 'create_mailbox' ),
					'permission_callback' => array( $this, 'check_permission' ),
				),
			)
		);
		register_rest_route(
			$this->namespace,
			'/helpdesk/saved-replies',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_saved_replies' ),
					'permission_callback' => array( $this, 'check_permission' ),
				),
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'create_saved_reply' ),
					'permission_callback' => array( $this, 'check_permission' ),
				),
			)
		);
		register_rest_route(
			$this->namespace,
			'/helpdesk/tickets/(?P<id>\d+)/replies',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_ticket_replies' ),
					'permission_callback' => array( $this, 'check_permission' ),
				),
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'permission_callback' => '__return_true',
					'callback'            => array( $this, 'add_ticket_reply' ),
					'permission_callback' => array( $this, 'check_permission' ),
				),
			)
		);
		register_rest_route(
			$this->namespace,
			'/helpdesk/mailboxes/(?P<id>[\d]+)',
			array(
				array(
					'methods'             => WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'update_mailbox' ),
					'permission_callback' => array( $this, 'check_permission' ),
				),
				array(
					'methods'             => WP_REST_Server::DELETABLE,
					'callback'            => array( $this, 'delete_mailbox' ),
					'permission_callback' => array( $this, 'check_permission' ),
				),
			)
		);
		register_rest_route(
			$this->namespace,
			'/helpdesk/saved-replies/(?P<id>[\d]+)',
			array(
				array(
					'methods'             => WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'update_saved_reply' ),
					'permission_callback' => array( $this, 'check_permission' ),
				),
				array(
					'methods'             => WP_REST_Server::DELETABLE,
					'callback'            => array( $this, 'delete_saved_reply' ),
					'permission_callback' => array( $this, 'check_permission' ),
				),
			)
		);
		register_rest_route(
			$this->namespace,
			'/helpdesk/tickets',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_tickets' ),
					'permission_callback' => array( $this, 'check_permission' ),
				),
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'permission_callback' => '__return_true',
					'callback'            => array( $this, 'create_ticket' ),
					'permission_callback' => '__return_true',
				),
			)
		);
		register_rest_route(
			$this->namespace,
			'/helpdesk/tickets/(?P<id>[\d]+)',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_ticket' ),
					'permission_callback' => array( $this, 'check_permission' ),
				),
				array(
					'methods'             => WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'update_ticket' ),
					'permission_callback' => array( $this, 'check_permission' ),
				),
				array(
					'methods'             => WP_REST_Server::DELETABLE,
					'callback'            => array( $this, 'delete_ticket' ),
					'permission_callback' => array( $this, 'check_permission' ),
				),
			)
		);
		register_rest_route(
			$this->namespace,
			'/helpdesk/tickets/(?P<id>[\d]+)/preview',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_ticket_preview' ),
					'permission_callback' => array( $this, 'check_permission' ),
				),
			)
		);
		register_rest_route(
			$this->namespace,
			'/helpdesk/tickets/bulk',
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'bulk_update_tickets' ),
					'permission_callback' => array( $this, 'check_permission' ),
				),
			)
		);
		register_rest_route(
			$this->namespace,
			'/helpdesk/stats',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_helpdesk_stats' ),
					'permission_callback' => array( $this, 'check_permission' ),
				),
			)
		);
	}

	// Helpdesk Methods
	public function get_ticket( $request ) {
		global $wpdb;
		$id       = intval( $request['id'] );
		$table    = $wpdb->prefix . 'erp_helpdesk_tickets';
		$contacts = $wpdb->prefix . 'erp_crm_contacts';
		$ticket   = $wpdb->get_row( $wpdb->prepare( "SELECT t.*, c.email as customer_email, c.first_name as customer_name FROM $table t LEFT JOIN $contacts c ON t.contact_id = c.id WHERE t.id = %d", $id ) );

		if ( ! $ticket ) {
			return new WP_Error( 'not_found', 'Ticket not found', array( 'status' => 404 ) );
		}

		$ticket->attachments = $this->get_reply_attachments( $ticket->attachment_ids );

		return rest_ensure_response( $ticket );
	}

	/**
	 * Return the raw RFC 822 email source stored for a ticket (mail preview).
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function get_ticket_preview( $request ) {
		global $wpdb;
		$id     = intval( $request['id'] );
		$table  = $wpdb->prefix . 'erp_helpdesk_tickets';
		$exists = $wpdb->get_var( $wpdb->prepare( "SELECT id FROM $table WHERE id = %d", $id ) );

		if ( ! $exists ) {
			return new WP_Error( 'not_found', 'Ticket not found', array( 'status' => 404 ) );
		}

		$raw = $wpdb->get_var( $wpdb->prepare( "SELECT raw_email FROM $table WHERE id = %d", $id ) );

		return rest_ensure_response( array( 'raw_email' => $raw ? (string) $raw : '' ) );
	}

	/**
	 * Update a ticket's editable fields (including the folder flags).
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function update_ticket( $request ) {
		global $wpdb;
		$id    = intval( $request['id'] );
		$table = $wpdb->prefix . 'erp_helpdesk_tickets';
		$data  = (array) $request->get_json_params();

		$text_fields = array(
			'subject'     => 'sanitize_text_field',
			'description' => 'wp_kses_post',
			'status'      => 'sanitize_text_field',
			'priority'    => 'sanitize_text_field',
		);
		$int_fields  = array( 'assignee_id', 'mailbox_id', 'contact_id', 'is_starred', 'is_spam', 'is_deleted' );

		$fields = array();
		foreach ( $text_fields as $key => $sanitizer ) {
			if ( array_key_exists( $key, $data ) ) {
				$fields[ $key ] = call_user_func( $sanitizer, (string) $data[ $key ] );
			}
		}
		foreach ( $int_fields as $key ) {
			if ( array_key_exists( $key, $data ) ) {
				$fields[ $key ] = ( '' === $data[ $key ] || null === $data[ $key ] ) ? null : intval( $data[ $key ] );
			}
		}

		if ( array_key_exists( 'attachment_ids', $data ) ) {
			$ids                      = is_array( $data['attachment_ids'] )
				? $data['attachment_ids']
				: explode( ',', (string) $data['attachment_ids'] );
			$fields['attachment_ids'] = implode(
				',',
				array_filter( array_map( 'intval', $ids ) )
			);
		}

		if ( empty( $fields ) ) {
			return new WP_Error( 'no_fields', __( 'No valid fields to update.', 'sahajanand-erp' ) );
		}

		if ( isset( $fields['description'] ) ) {
			$fields['description'] = wpautop( $fields['description'] );
		}

		$wpdb->update( $table, $fields, array( 'id' => $id ) );

		$ticket = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table WHERE id = %d", $id ) );
		return rest_ensure_response( $ticket ? $ticket : array( 'message' => 'Ticket updated.' ) );
	}

	/**
	 * Delete a ticket permanently.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response
	 */
	public function delete_ticket( $request ) {
		global $wpdb;
		$id    = intval( $request['id'] );
		$table = $wpdb->prefix . 'erp_helpdesk_tickets';
		$wpdb->delete( $table, array( 'id' => $id ) );
		return rest_ensure_response( array( 'message' => 'Ticket deleted.' ) );
	}

	/**
	 * Apply a bulk action to one or more tickets.
	 *
	 * Accepts { ids: [int], action: 'assign|status|star|spam|trash|restore', value }.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function bulk_update_tickets( $request ) {
		global $wpdb;

		$data = (array) $request->get_json_params();
		$ids  = array_filter( array_map( 'intval', (array) ( $data['ids'] ?? array() ) ) );

		if ( empty( $ids ) ) {
			return new WP_Error( 'rest_invalid_param', __( 'No ticket IDs provided.', 'sahajanand-erp' ), array( 'status' => 400 ) );
		}

		$table  = $wpdb->prefix . 'erp_helpdesk_tickets';
		$action = isset( $data['action'] ) ? sanitize_key( $data['action'] ) : '';
		$value  = isset( $data['value'] ) ? sanitize_text_field( $data['value'] ) : '';
		$count  = 0;

		foreach ( $ids as $id ) {
			switch ( $action ) {
				case 'assign':
					$wpdb->update( $table, array( 'assignee_id' => $value ? absint( $value ) : 0 ), array( 'id' => $id ), array( '%d' ), array( '%d' ) );
					break;
				case 'status':
					$wpdb->update( $table, array( 'status' => $value ? 'open' : 'closed' ), array( 'id' => $id ), array( '%s' ), array( '%d' ) );
					break;
				case 'star':
					$wpdb->update( $table, array( 'is_starred' => $value ? 1 : 0 ), array( 'id' => $id ), array( '%d' ), array( '%d' ) );
					break;
				case 'spam':
					$wpdb->update( $table, array( 'is_spam' => $value ? 1 : 0 ), array( 'id' => $id ), array( '%d' ), array( '%d' ) );
					break;
				case 'trash':
					$wpdb->update( $table, array( 'is_deleted' => 1 ), array( 'id' => $id ), array( '%d' ), array( '%d' ) );
					break;
				case 'restore':
					$wpdb->update( $table, array( 'is_deleted' => 0 ), array( 'id' => $id ), array( '%d' ), array( '%d' ) );
					break;
			}
			++$count;
		}

		return rest_ensure_response(
			array(
				'processed' => $count,
				'action'    => $action,
			)
		);
	}

	public function get_tickets( $request ) {
		global $wpdb;

		$table    = $wpdb->prefix . 'erp_helpdesk_tickets';
		$contacts = $wpdb->prefix . 'erp_crm_contacts';

		$mailbox_id = isset( $request['mailbox_id'] ) ? intval( $request['mailbox_id'] ) : 0;
		$folder     = isset( $request['folder'] ) ? sanitize_key( $request['folder'] ) : '';
		$user_id    = get_current_user_id();

		$where = 'WHERE 1=1';
		$args  = array();

		if ( $mailbox_id ) {
			$where .= ' AND t.mailbox_id = %d';
			$args[] = $mailbox_id;
		}

		switch ( $folder ) {
			case 'starred':
				$where .= ' AND t.is_starred = 1 AND t.is_deleted = 0 AND t.is_spam = 0';
				break;
			case 'spam':
				$where .= ' AND t.is_spam = 1';
				break;
			case 'trash':
				$where .= ' AND t.is_deleted = 1';
				break;
			case 'closed':
				$where .= " AND t.status = 'closed' AND t.is_deleted = 0 AND t.is_spam = 0";
				break;
			case 'mine':
				if ( $user_id ) {
					$where .= ' AND t.assignee_id = %d';
					$args[] = $user_id;
				}
				$where .= " AND t.is_deleted = 0 AND t.is_spam = 0 AND t.status != 'closed'";
				break;
			case 'assigned':
				$where .= ' AND t.assignee_id IS NOT NULL AND t.assignee_id != 0 AND t.is_deleted = 0 AND t.is_spam = 0 AND t.status != \'closed\'';
				break;
			case 'unassigned':
			default:
				$where .= " AND t.is_deleted = 0 AND t.is_spam = 0 AND t.status != 'closed' AND ( t.assignee_id IS NULL OR t.assignee_id = 0 )";
				break;
		}

		$per_page = isset( $request['per_page'] )
			? max( 1, min( 100, intval( $request['per_page'] ) ) ) : 20;
		$page     = isset( $request['page'] )
			? max( 1, intval( $request['page'] ) ) : 1;
		$offset   = ( $page - 1 ) * $per_page;

		$wpdb->query( "UPDATE {$wpdb->prefix}erp_helpdesk_tickets SET ticket_no = CONCAT('#', id) WHERE ticket_no NOT LIKE '#%'" );

		$total = (int) $wpdb->get_var(
			$wpdb->prepare( "SELECT COUNT(*) FROM $table t $where", $args )
		);

		// phpcs:ignore WordPress.DB.PreparedFullUnprepared.non_select -- dynamic WHERE builder; args sanitized.
		$sql     = "SELECT t.*, c.email as customer_email, c.first_name as customer_name FROM $table t LEFT JOIN $contacts c ON t.contact_id = c.id $where ORDER BY t.created_at DESC LIMIT %d OFFSET %d";
		$args[]  = $per_page;
		$args[]  = $offset;
		$tickets = $wpdb->get_results( $wpdb->prepare( $sql, $args ) );

		$response = rest_ensure_response( $tickets );
		$response->header( 'X-WP-Total', (string) $total );
		$response->header( 'X-WP-TotalPages', (string) ( $per_page > 0 ? ceil( $total / $per_page ) : 0 ) );
		$response->header( 'X-WP-Page', (string) $page );
		$response->header( 'X-WP-PerPage', (string) $per_page );

		return $response;
	}

	/**
	 * Return per-mailbox ticket counts for the dashboard summaries.
	 *
	 * @return WP_REST_Response
	 */
	public function get_helpdesk_stats( $request ) {
		global $wpdb;

		$table    = $wpdb->prefix . 'erp_helpdesk_tickets';
		$mb_table = $wpdb->prefix . 'erp_helpdesk_mailboxes';
		$user_id  = get_current_user_id();

		$mailboxes = $wpdb->get_results( "SELECT id, name, email_address FROM $mb_table ORDER BY name" );

		$stats = array();
		foreach ( (array) $mailboxes as $mb ) {
			$counts = $wpdb->get_row(
				$wpdb->prepare(
					"SELECT
						SUM( t.is_deleted = 0 AND t.is_spam = 0 AND t.status != 'closed' AND ( t.assignee_id IS NULL OR t.assignee_id = 0 ) ) AS unassigned,
						SUM( t.is_deleted = 0 AND t.is_spam = 0 AND t.status != 'closed' AND t.assignee_id = %d ) AS mine,
						SUM( t.is_deleted = 0 AND t.is_spam = 0 AND t.status != 'closed' AND t.assignee_id IS NOT NULL AND t.assignee_id != 0 ) AS assigned,
						SUM( t.status = 'closed' AND t.is_deleted = 0 AND t.is_spam = 0 ) AS closed,
						COUNT(1) AS total
					FROM $table t
					WHERE t.mailbox_id = %d",
					$user_id,
					$mb->id
				)
			);

			$stats[] = array(
				'id'            => $mb->id,
				'name'          => $mb->name,
				'email_address' => $mb->email_address,
				'unassigned'    => (int) $counts->unassigned,
				'mine'          => (int) $counts->mine,
				'assigned'      => (int) $counts->assigned,
				'closed'        => (int) $counts->closed,
				'total'         => (int) $counts->total,
			);
		}

		return rest_ensure_response( $stats );
	}

	public function create_ticket( $request ) {
		global $wpdb;
		$table = $wpdb->prefix . 'erp_helpdesk_tickets';
		$data  = $request->get_json_params();

		$customer_email = isset( $data['customer_email'] ) ? sanitize_email( $data['customer_email'] ) : '';
		unset( $data['customer_email'] );

		if ( ! empty( $customer_email ) ) {
			$contact = $wpdb->get_row( $wpdb->prepare( "SELECT id FROM {$wpdb->prefix}erp_crm_contacts WHERE email = %s", $customer_email ) );
			if ( $contact ) {
				$data['contact_id'] = $contact->id;
			} else {
				$wpdb->insert(
					$wpdb->prefix . 'erp_crm_contacts',
					array(
						'first_name' => 'Unknown',
						'email'      => $customer_email,

					)
				);
				$data['contact_id'] = $wpdb->insert_id;
			}
		}

		$result = $wpdb->insert( $table, $data );
		if ( $result === false ) {
			return new WP_Error( 'insert_failed', __( 'Failed to create ticket.', 'sahajanand-erp' ), array( 'status' => 500 ) );
		}
		$ticket_id = $wpdb->insert_id;
		$wpdb->update( $table, array( 'ticket_no' => '#' . $ticket_id ), array( 'id' => $ticket_id ) );

		// If description provided, insert as first reply (thread)
		if ( ! empty( $data['description'] ) ) {
			$wpdb->insert(
				$wpdb->prefix . 'erp_helpdesk_ticket_replies',
				array(
					'ticket_id' => $ticket_id,
					'user_id'   => get_current_user_id(),
					'message'   => wpautop( wp_kses_post( $data['description'] ) ),
					'is_note'   => 0,
				)
			);
			$reply_id = $wpdb->insert_id;

			if ( class_exists( 'SAHAJANAND_ERP_Mail_Sender' ) ) {
				$mail_result = SAHAJANAND_ERP_Mail_Sender::send_reply( $ticket_id, $reply_id );
				if ( is_wp_error( $mail_result ) ) {
					return new WP_Error( 'mail_error', $mail_result->get_error_message(), array( 'status' => 500 ) );
				}
			}
		}

		return rest_ensure_response( array( 'id' => $ticket_id ) );
	}

	/**
	 * Create Saved Reply
	 */
	public function create_saved_reply( $request ) {
		global $wpdb;
		$table_name = $wpdb->prefix . 'erp_helpdesk_saved_replies';

		$params = $request->get_json_params();

		$data = array(
			'title'   => sanitize_text_field( $params['title'] ?? '' ),
			'content' => wp_kses_post( $params['content'] ?? '' ),
		);

		$wpdb->insert( $table_name, $data );
		$id = $wpdb->insert_id;

		return rest_ensure_response(
			array(
				'id'      => $id,
				'message' => 'Saved Reply created successfully.',
			)
		);
	}

	/**
	 * Get Mailboxes
	 */
	public function get_mailboxes( $request ) {
		global $wpdb;
		$table_name = $wpdb->prefix . 'erp_helpdesk_mailboxes';
		$results    = $wpdb->get_results( "SELECT * FROM $table_name ORDER BY id DESC" );
		return rest_ensure_response( $results );
	}

	/**
	 * Create Mailbox
	 */
	public function create_mailbox( $request ) {
		global $wpdb;
		$table_name = $wpdb->prefix . 'erp_helpdesk_mailboxes';

		$params = $request->get_json_params();

		$data = array(
			'name'          => sanitize_text_field( $params['name'] ?? '' ),
			'email_address' => sanitize_email( $params['email_address'] ?? '' ),
			'imap_host'     => sanitize_text_field( $params['imap_host'] ?? '' ),
			'imap_port'     => intval( $params['imap_port'] ?? 993 ),
			'imap_user'     => sanitize_text_field( $params['imap_user'] ?? '' ),
			'imap_pass'     => sanitize_text_field( $params['imap_pass'] ?? '' ),
			'smtp_host'     => sanitize_text_field( $params['smtp_host'] ?? '' ),
			'smtp_port'     => intval( $params['smtp_port'] ?? 465 ),
			'smtp_user'     => sanitize_text_field( $params['smtp_user'] ?? '' ),
			'smtp_pass'     => sanitize_text_field( $params['smtp_pass'] ?? '' ),
			'signature'     => wp_kses_post( $params['signature'] ?? '' ),
		);

		$wpdb->insert( $table_name, $data );
		$id = $wpdb->insert_id;

		return rest_ensure_response(
			array(
				'id'      => $id,
				'message' => 'Mailbox created successfully.',
			)
		);
	}

	/**
	 * Get Saved Replies
	 */
	public function get_saved_replies( $request ) {
		global $wpdb;
		$table_name = $wpdb->prefix . 'erp_helpdesk_saved_replies';
		$results    = $wpdb->get_results( "SELECT * FROM $table_name ORDER BY title ASC" );
		return rest_ensure_response( $results );
	}

	/**
	 * Get Ticket Replies
	 */
	public function get_ticket_replies( $request ) {
		global $wpdb;
		$ticket_id  = intval( $request['id'] );
		$table_name = $wpdb->prefix . 'erp_helpdesk_ticket_replies';

		$per_page = isset( $request['per_page'] )
			? max( 1, min( 100, intval( $request['per_page'] ) ) ) : 100;
		$page     = isset( $request['page'] )
			? max( 1, intval( $request['page'] ) ) : 1;
		$offset   = ( $page - 1 ) * $per_page;

		$total = (int) $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM $table_name WHERE ticket_id = %d", $ticket_id ) );

		$results = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT * FROM $table_name WHERE ticket_id = %d ORDER BY created_at ASC LIMIT %d OFFSET %d",
				$ticket_id,
				$per_page,
				$offset
			)
		);
		foreach ( $results as $reply ) {
			$reply->attachments = $this->get_reply_attachments( $reply->attachment_ids );
		}

		$response = rest_ensure_response( $results );
		$response->header( 'X-WP-Total', (string) $total );
		$response->header( 'X-WP-TotalPages', (string) ( $per_page > 0 ? ceil( $total / $per_page ) : 0 ) );

		return $response;
	}

	/**
	 * Resolve stored attachment IDs into attachment data for the UI.
	 *
	 * @param string $attachment_ids Comma separated attachment IDs.
	 * @return array
	 */
	private function get_reply_attachments( $attachment_ids ) {
		$attachments = array();
		if ( empty( $attachment_ids ) ) {
			return $attachments;
		}

		$ids = array_filter( array_map( 'intval', explode( ',', (string) $attachment_ids ) ) );
		foreach ( $ids as $attachment_id ) {
			$url = wp_get_attachment_url( $attachment_id );
			if ( ! $url ) {
				continue;
			}
			$attachments[] = array(
				'id'       => $attachment_id,
				'url'      => $url,
				'filename' => wp_basename( (string) get_attached_file( $attachment_id ) ),
				'mime'     => get_post_mime_type( $attachment_id ),
			);
		}
		return $attachments;
	}

	/**
	 * Add Ticket Reply
	 */
	public function add_ticket_reply( $request ) {
		global $wpdb;
		$ticket_id = intval( $request['id'] );
		$params    = $request->get_json_params();

		$table_name = $wpdb->prefix . 'erp_helpdesk_ticket_replies';

		$is_note = isset( $params['is_note'] ) && $params['is_note'] ? 1 : 0;
		$message = wpautop( wp_kses_post( $params['message'] ?? '' ) );
		$user_id = get_current_user_id();

		$attachment_ids = isset( $params['attachment_ids'] )
			? implode( ',', array_filter( array_map( 'intval', explode( ',', (string) $params['attachment_ids'] ) ) ) )
			: '';

		// Save reply to database
		$data = array(
			'ticket_id'      => $ticket_id,
			'user_id'        => $user_id,
			'message'        => $message,
			'is_note'        => $is_note,
			'attachment_ids' => $attachment_ids,
		);

		$wpdb->insert( $table_name, $data );
		$reply_id = $wpdb->insert_id;

		if ( ! $is_note ) {
			$tickets_table = $wpdb->prefix . 'erp_helpdesk_tickets';
			$wpdb->update( $tickets_table, array( 'status' => 'pending' ), array( 'id' => $ticket_id ) );

			if ( class_exists( 'SAHAJANAND_ERP_Mail_Sender' ) ) {
				$mail_result = SAHAJANAND_ERP_Mail_Sender::send_reply( $ticket_id, $reply_id );
				if ( is_wp_error( $mail_result ) ) {
					return new WP_Error( 'mail_error', $mail_result->get_error_message(), array( 'status' => 500 ) );
				}
			}
		}

		$new_reply = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table_name WHERE id = %d", $reply_id ) );
		if ( $new_reply ) {
			$new_reply->attachments = $this->get_reply_attachments( $new_reply->attachment_ids );
		}
		return rest_ensure_response( $new_reply );
	}

	public function update_mailbox( $request ) {
		global $wpdb;
		$id         = intval( $request['id'] );
		$table_name = $wpdb->prefix . 'erp_helpdesk_mailboxes';
		$params     = $request->get_json_params();

		$data = array();
		if ( isset( $params['name'] ) ) {
			$data['name'] = sanitize_text_field( $params['name'] );
		}
		if ( isset( $params['email_address'] ) ) {
			$data['email_address'] = sanitize_email( $params['email_address'] );
		}
		if ( isset( $params['imap_host'] ) ) {
			$data['imap_host'] = sanitize_text_field( $params['imap_host'] );
		}
		if ( isset( $params['imap_port'] ) ) {
			$data['imap_port'] = intval( $params['imap_port'] );
		}
		if ( isset( $params['imap_user'] ) ) {
			$data['imap_user'] = sanitize_text_field( $params['imap_user'] );
		}
		if ( isset( $params['imap_pass'] ) ) {
			$data['imap_pass'] = sanitize_text_field( $params['imap_pass'] );
		}
		if ( isset( $params['smtp_host'] ) ) {
			$data['smtp_host'] = sanitize_text_field( $params['smtp_host'] );
		}
		if ( isset( $params['smtp_port'] ) ) {
			$data['smtp_port'] = intval( $params['smtp_port'] );
		}
		if ( isset( $params['smtp_user'] ) ) {
			$data['smtp_user'] = sanitize_text_field( $params['smtp_user'] );
		}
		if ( isset( $params['smtp_pass'] ) ) {
			$data['smtp_pass'] = sanitize_text_field( $params['smtp_pass'] );
		}
		if ( isset( $params['signature'] ) ) {
			$data['signature'] = wp_kses_post( $params['signature'] );
		}

		$wpdb->update( $table_name, $data, array( 'id' => $id ) );
		return rest_ensure_response( array( 'message' => 'Mailbox updated.' ) );
	}

	public function delete_mailbox( $request ) {
		global $wpdb;
		$wpdb->delete( $wpdb->prefix . 'erp_helpdesk_mailboxes', array( 'id' => intval( $request['id'] ) ) );
		return rest_ensure_response( array( 'message' => 'Mailbox deleted.' ) );
	}

	public function update_saved_reply( $request ) {
		global $wpdb;
		$id     = intval( $request['id'] );
		$params = $request->get_json_params();
		$data   = array();
		if ( isset( $params['title'] ) ) {
			$data['title'] = sanitize_text_field( $params['title'] );
		}
		if ( isset( $params['content'] ) ) {
			$data['content'] = wp_kses_post( $params['content'] );
		}

		$wpdb->update( $wpdb->prefix . 'erp_helpdesk_saved_replies', $data, array( 'id' => $id ) );
		return rest_ensure_response( array( 'message' => 'Saved Reply updated.' ) );
	}

	public function delete_saved_reply( $request ) {
		global $wpdb;
		$wpdb->delete( $wpdb->prefix . 'erp_helpdesk_saved_replies', array( 'id' => intval( $request['id'] ) ) );
		return rest_ensure_response( array( 'message' => 'Saved Reply deleted.' ) );
	}

	/**
	 * Trigger manual mail fetch
	 */
	public function trigger_mail_fetch( $request ) {
		if ( ! class_exists( 'SAHAJANAND_ERP_Mail_Fetcher' ) ) {
			return new WP_Error( 'missing_class', 'Mail Fetcher class not found.', array( 'status' => 500 ) );
		}

		try {
			SAHAJANAND_ERP_Mail_Fetcher::fetch_emails();
			return rest_ensure_response( array( 'message' => 'Emails fetched successfully.' ) );
		} catch ( Exception $e ) {
			return new WP_Error( 'fetch_error', $e->getMessage(), array( 'status' => 500 ) );
		}
	}

	public function test_smtp_connection( $request ) {
		global $wpdb;
		$mailbox = $wpdb->get_row( "SELECT * FROM {$wpdb->prefix}erp_helpdesk_mailboxes LIMIT 1" );

		if ( ! $mailbox ) {
			return new WP_Error( 'no_mailbox', 'No mailbox found in DB', array( 'status' => 404 ) );
		}

		$error_message = '';
		$error_action  = function ( $wp_error ) use ( &$error_message ) {
			$error_message = $wp_error->get_error_message();
		};
		add_action( 'wp_mail_failed', $error_action );

		$phpmailer_action = function ( $phpmailer ) use ( $mailbox ) {
			$phpmailer->isSMTP();
			$phpmailer->Host        = $mailbox->smtp_host;
			$phpmailer->SMTPAuth    = true;
			$phpmailer->Port        = $mailbox->smtp_port;
			$phpmailer->Username    = $mailbox->smtp_user;
			$phpmailer->Password    = $mailbox->smtp_pass;
			$phpmailer->SMTPSecure  = ( $mailbox->smtp_port == 465 ) ? 'ssl' : 'tls';
			$phpmailer->SMTPOptions = array(
				'ssl' => array(
					'verify_peer'       => false,
					'verify_peer_name'  => false,
					'allow_self_signed' => true,
				),
			);
			$phpmailer->From        = $mailbox->email_address;
			$phpmailer->FromName    = $mailbox->name;
		};
		add_action( 'phpmailer_init', $phpmailer_action );

		ob_start();
		$result       = wp_mail( 'test@sahajananddigital.in', 'Test SMTP', 'Testing SMTP from backend.' );
		$debug_output = ob_get_clean();

		remove_action( 'phpmailer_init', $phpmailer_action );
		remove_action( 'wp_mail_failed', $error_action );

		return rest_ensure_response(
			array(
				'success' => $result,
				'error'   => $error_message,
				'mailbox' => $mailbox->email_address,
				'host'    => $mailbox->smtp_host,
				'port'    => $mailbox->smtp_port,
				'secure'  => ( $mailbox->smtp_port == 465 ) ? 'ssl' : 'tls',
			)
		);
	}

	public function test_mailbox_connection( $request ) {
		$data    = $request->get_json_params();
		$results = array();

		// 1. Test IMAP
		try {
			if ( ! class_exists( 'Webklex\PHPIMAP\ClientManager' ) ) {
				throw new Exception( 'IMAP Client Manager not found.' );
			}
			$cm     = new \Webklex\PHPIMAP\ClientManager();
			$client = $cm->make(
				array(
					'host'          => $data['imap_host'] ?? '',
					'port'          => $data['imap_port'] ?? '',
					'encryption'    => ( ( $data['imap_port'] ?? '' ) == 993 ) ? 'ssl' : false,
					'validate_cert' => false,
					'username'      => $data['imap_user'] ?? '',
					'password'      => $data['imap_pass'] ?? '',
					'protocol'      => 'imap',
				)
			);
			$client->connect();
			$client->disconnect();
			$results['imap'] = 'success';
		} catch ( \Exception $e ) {
			$results['imap'] = $e->getMessage();
		}

		// 2. Test SMTP
		try {
			require_once ABSPATH . WPINC . '/PHPMailer/PHPMailer.php';
			require_once ABSPATH . WPINC . '/PHPMailer/SMTP.php';
			require_once ABSPATH . WPINC . '/PHPMailer/Exception.php';

			$phpmailer = new \PHPMailer\PHPMailer\PHPMailer( true );
			$phpmailer->isSMTP();
			$phpmailer->Host        = $data['smtp_host'] ?? '';
			$phpmailer->SMTPAuth    = true;
			$phpmailer->Port        = $data['smtp_port'] ?? '';
			$phpmailer->Username    = $data['smtp_user'] ?? '';
			$phpmailer->Password    = $data['smtp_pass'] ?? '';
			$phpmailer->SMTPSecure  = ( ( $data['smtp_port'] ?? '' ) == 465 ) ? 'ssl' : 'tls';
			$phpmailer->SMTPOptions = array(
				'ssl' => array(
					'verify_peer'       => false,
					'verify_peer_name'  => false,
					'allow_self_signed' => true,
				),
			);

			if ( $phpmailer->smtpConnect() ) {
				$phpmailer->smtpClose();
				$results['smtp'] = 'success';
			} else {
				$results['smtp'] = 'SMTP connect() failed.';
			}
		} catch ( \Exception $e ) {
			$results['smtp'] = $e->getMessage();
		}

		if ( $results['imap'] === 'success' && $results['smtp'] === 'success' ) {
			return rest_ensure_response( array( 'success' => true ) );
		} else {
			$err = array();
			if ( $results['imap'] !== 'success' ) {
				$err[] = 'IMAP: ' . $results['imap'];
			}
			if ( $results['smtp'] !== 'success' ) {
				$err[] = 'SMTP: ' . $results['smtp'];
			}
			return rest_ensure_response(
				array(
					'success' => false,
					'error'   => implode( ' | ', $err ),
				)
			);
		}
	}
}
