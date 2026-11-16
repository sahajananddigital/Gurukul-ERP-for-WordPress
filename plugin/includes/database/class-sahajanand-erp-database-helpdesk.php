<?php
/**
 * Helpdesk database schema and migrations
 *
 * @package Sahajanand_ERP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Helpdesk database schema handler.
 */
class SAHAJANAND_ERP_Database_Helpdesk {

	/**
	 * Create all Helpdesk tables
	 *
	 * @param string $charset_collate Optional database charset collate.
	 */
	public static function create_tables( $charset_collate = '' ) {
		global $wpdb;

		if ( empty( $charset_collate ) ) {
			$charset_collate = $wpdb->get_charset_collate();
		}

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';

		// Mailboxes.
		$table_name = $wpdb->prefix . 'erp_helpdesk_mailboxes';
		$sql        = "CREATE TABLE IF NOT EXISTS $table_name (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			name varchar(100) NOT NULL,
			email_address varchar(150) NOT NULL,
			imap_host varchar(150) DEFAULT NULL,
			imap_port int(11) DEFAULT 993,
			imap_user varchar(150) DEFAULT NULL,
			imap_pass varchar(255) DEFAULT NULL,
			smtp_host varchar(150) DEFAULT NULL,
			smtp_port int(11) DEFAULT 465,
			smtp_user varchar(150) DEFAULT NULL,
			smtp_pass varchar(255) DEFAULT NULL,
			signature text DEFAULT NULL,
			created_at datetime DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY (id)
		) $charset_collate;";
		dbDelta( $sql );

		// Saved Replies.
		$table_name = $wpdb->prefix . 'erp_helpdesk_saved_replies';
		$sql        = "CREATE TABLE IF NOT EXISTS $table_name (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			title varchar(150) NOT NULL,
			content text NOT NULL,
			created_at datetime DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY (id)
		) $charset_collate;";
		dbDelta( $sql );

		// Tickets.
		$table_name = $wpdb->prefix . 'erp_helpdesk_tickets';
		$sql        = "CREATE TABLE IF NOT EXISTS $table_name (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			ticket_no varchar(50) NOT NULL,
			subject varchar(255) NOT NULL,
			description text NOT NULL,
			contact_id bigint(20) unsigned DEFAULT NULL,
			user_id bigint(20) unsigned DEFAULT NULL,
			assignee_id bigint(20) unsigned DEFAULT NULL,
			mailbox_id bigint(20) unsigned DEFAULT NULL,
			message_id varchar(255) DEFAULT NULL,
			priority varchar(20) DEFAULT 'medium',
			status varchar(20) DEFAULT 'open',
			is_starred tinyint(1) NOT NULL DEFAULT 0,
			is_spam tinyint(1) NOT NULL DEFAULT 0,
			is_deleted tinyint(1) NOT NULL DEFAULT 0,
			attachment_ids varchar(255) DEFAULT NULL,
			raw_email longtext DEFAULT NULL,
			created_at datetime DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY (id),
			UNIQUE KEY ticket_no (ticket_no),
			KEY contact_id (contact_id),
			KEY user_id (user_id),
			KEY assignee_id (assignee_id),
			KEY mailbox_id (mailbox_id),
			KEY status (status),
			KEY priority (priority)
		) $charset_collate;";
		dbDelta( $sql );

		// Ticket replies.
		$table_name = $wpdb->prefix . 'erp_helpdesk_ticket_replies';
		$sql        = "CREATE TABLE IF NOT EXISTS $table_name (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			ticket_id bigint(20) unsigned NOT NULL,
			user_id bigint(20) unsigned NOT NULL,
			message text NOT NULL,
			is_note tinyint(1) DEFAULT 0,
			attachment_ids varchar(255) DEFAULT NULL,
			message_id varchar(255) DEFAULT NULL,
			created_at datetime DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY (id),
			KEY ticket_id (ticket_id),
			KEY user_id (user_id)
		) $charset_collate;";
		dbDelta( $sql );

		self::migrate_ticket_columns();
		self::migrate_message_formatting();
	}

	/**
	 * Add ticket columns to installs created before they existed.
	 */
	public static function migrate_ticket_columns() {
		global $wpdb;

		$table = $wpdb->prefix . 'erp_helpdesk_tickets';

		$existing = array();
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- Table name is an internal constant.
		$row = $wpdb->get_row( "SELECT * FROM {$table} LIMIT 1", ARRAY_A );
		if ( is_array( $row ) ) {
			$existing = array_keys( $row );
		}

		$columns = array(
			'is_starred'     => 'TINYINT(1) NOT NULL DEFAULT 0',
			'is_spam'        => 'TINYINT(1) NOT NULL DEFAULT 0',
			'is_deleted'     => 'TINYINT(1) NOT NULL DEFAULT 0',
			'attachment_ids' => 'VARCHAR(255) DEFAULT NULL',
			'raw_email'      => 'LONGTEXT DEFAULT NULL',
		);

		$suppress = $wpdb->suppress_errors();
		foreach ( $columns as $column => $definition ) {
			if ( ! in_array( $column, $existing, true ) ) {
				// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- Column/table names are internal constants.
				$wpdb->query( "ALTER TABLE {$table} ADD COLUMN {$column} {$definition}" );
			}
		}
		$wpdb->suppress_errors( $suppress );
	}

	/**
	 * Convert plain-text ticket messages to HTML so line breaks and paragraphs are preserved.
	 */
	public static function migrate_message_formatting() {
		global $wpdb;

		$replies = $wpdb->prefix . 'erp_helpdesk_ticket_replies';
		$tickets = $wpdb->prefix . 'erp_helpdesk_tickets';

		// Matches real HTML tags (not plain-text angle brackets like email addresses).
		$has_html = static function ( $content ) {
			return (bool) preg_match( '/<(p|br|div|span|a|ul|ol|li|strong|em|b|i|blockquote|pre|code|h[1-6]|img|table|tbody|thead|tr|td|th)\b/i', (string) $content );
		};

		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- Table name is an internal constant.
		$reply_rows = $wpdb->get_results( "SELECT id, message FROM {$replies}", ARRAY_A );
		foreach ( (array) $reply_rows as $row ) {
			$message = $row['message'];
			if ( $has_html( $message ) || preg_match( '/^[^\n\r]*$/', $message ) || ! preg_match( '/\n\n/', $message ) ) {
				continue;
			}
			$wpdb->update( $replies, array( 'message' => wpautop( $message ) ), array( 'id' => $row['id'] ) );
		}

		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- Table name is an internal constant.
		$ticket_rows = $wpdb->get_results( "SELECT id, description FROM {$tickets}", ARRAY_A );
		foreach ( (array) $ticket_rows as $row ) {
			$description = $row['description'];
			if ( $has_html( $description ) || preg_match( '/^[^\n\r]*$/', $description ) || ! preg_match( '/\n\n/', $description ) ) {
				continue;
			}
			$wpdb->update( $tickets, array( 'description' => wpautop( $description ) ), array( 'id' => $row['id'] ) );
		}
	}
}
