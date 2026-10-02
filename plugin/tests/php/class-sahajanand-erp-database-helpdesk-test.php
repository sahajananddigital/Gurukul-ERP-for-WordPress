<?php
/**
 * Helpdesk database schema + migration tests.
 *
 * @package Sahajanand_ERP
 */

/**
 * Tests for helpdesk tables and migrations.
 */
class SAHAJANAND_ERP_Database_Helpdesk_Test extends WP_UnitTestCase {

	/**
	 * Ensure tables exist after create_tables.
	 */
	public function test_helpdesk_tables_exist() {
		if ( ! class_exists( 'SAHAJANAND_ERP_Database' ) ) {
			$this->markTestSkipped( 'Database class missing' );
		}
		SAHAJANAND_ERP_Database::create_tables();

		global $wpdb;
		$tables = array(
			$wpdb->prefix . 'erp_helpdesk_tickets',
			$wpdb->prefix . 'erp_helpdesk_ticket_replies',
			$wpdb->prefix . 'erp_helpdesk_mailboxes',
			$wpdb->prefix . 'erp_helpdesk_saved_replies',
		);

		foreach ( $tables as $table ) {
			// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			$found = $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $table ) );
			$this->assertSame( $table, $found, "Missing table {$table}" );
		}
	}

	/**
	 * Ticket columns include folder flags and raw_email.
	 */
	public function test_ticket_columns_include_folder_flags_and_raw_email() {
		if ( ! class_exists( 'SAHAJANAND_ERP_Database' ) ) {
			$this->markTestSkipped( 'Database class missing' );
		}
		SAHAJANAND_ERP_Database::create_tables();

		global $wpdb;
		$table = $wpdb->prefix . 'erp_helpdesk_tickets';
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$columns = $wpdb->get_results( "SHOW COLUMNS FROM {$table}", ARRAY_A );
		$names   = wp_list_pluck( $columns, 'Field' );

		foreach ( array( 'is_starred', 'is_spam', 'is_deleted', 'attachment_ids', 'raw_email', 'mailbox_id', 'ticket_no' ) as $column ) {
			$this->assertContains( $column, $names, "Missing column {$column}" );
		}
	}

	/**
	 * Migration is idempotent.
	 */
	public function test_migrate_helpdesk_ticket_columns_is_idempotent() {
		if ( ! class_exists( 'SAHAJANAND_ERP_Database' ) ) {
			$this->markTestSkipped( 'Database class missing' );
		}
		SAHAJANAND_ERP_Database::create_tables();
		SAHAJANAND_ERP_Database::create_tables();

		global $wpdb;
		$table = $wpdb->prefix . 'erp_helpdesk_tickets';
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$count = (int) $wpdb->get_var( "SELECT COUNT(*) FROM pragma_table_info('{$table}')" );
		if ( 0 === $count ) {
			// MySQL path.
			// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			$count = (int) $wpdb->get_var( "SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_NAME = '{$table}'" );
		}
		$this->assertGreaterThan( 5, $count );
	}

	/**
	 * Mailbox columns fall back to the standard IMAP/SMTP ports.
	 */
	public function test_mailbox_port_defaults() {
		if ( ! class_exists( 'SAHAJANAND_ERP_Database' ) ) {
			$this->markTestSkipped( 'Database class missing' );
		}
		SAHAJANAND_ERP_Database::create_tables();

		global $wpdb;
		$wpdb->insert(
			$wpdb->prefix . 'erp_helpdesk_mailboxes',
			array(
				'name'          => 'Defaults',
				'email_address' => 'defaults@example.com',
			)
		);
		$id  = (int) $wpdb->insert_id;
		$row = $wpdb->get_row(
			$wpdb->prepare( "SELECT imap_port, smtp_port FROM {$wpdb->prefix}erp_helpdesk_mailboxes WHERE id = %d", $id )
		);
		$this->assertSame( '993', (string) $row->imap_port );
		$this->assertSame( '465', (string) $row->smtp_port );
	}

	/**
	 * Ticket rows default to open/medium when status fields are omitted.
	 */
	public function test_ticket_status_and_priority_defaults() {
		if ( ! class_exists( 'SAHAJANAND_ERP_Database' ) ) {
			$this->markTestSkipped( 'Database class missing' );
		}
		SAHAJANAND_ERP_Database::create_tables();

		global $wpdb;
		$wpdb->insert(
			$wpdb->prefix . 'erp_helpdesk_tickets',
			array(
				'ticket_no'   => '#def-1',
				'subject'     => 'Defaults',
				'description' => 'Body',
			)
		);
		$id  = (int) $wpdb->insert_id;
		$row = $wpdb->get_row(
			$wpdb->prepare( "SELECT status, priority FROM {$wpdb->prefix}erp_helpdesk_tickets WHERE id = %d", $id )
		);
		$this->assertSame( 'open', $row->status );
		$this->assertSame( 'medium', $row->priority );
	}

	/**
	 * The ticket_no column has a UNIQUE key.
	 */
	public function test_ticket_no_unique_constraint() {
		if ( ! class_exists( 'SAHAJANAND_ERP_Database' ) ) {
			$this->markTestSkipped( 'Database class missing' );
		}
		SAHAJANAND_ERP_Database::create_tables();

		global $wpdb;
		$insert = function () use ( $wpdb ) {
			return $wpdb->insert(
				$wpdb->prefix . 'erp_helpdesk_tickets',
				array(
					'ticket_no'   => 'DUP-1',
					'subject'     => 'Dup',
					'description' => 'Body',
				)
			);
		};

		$this->assertNotFalse( $insert() );

		$suppress = $wpdb->suppress_errors();
		$second   = $insert();
		$wpdb->suppress_errors( $suppress );

		$this->assertFalse( $second, 'Duplicate ticket_no must fail.' );
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$this->assertSame( 1, (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$wpdb->prefix}erp_helpdesk_tickets WHERE ticket_no = 'DUP-1'" ) );
	}

	/**
	 * Replies and saved replies expose the expected columns.
	 */
	public function test_replies_and_saved_replies_columns() {
		if ( ! class_exists( 'SAHAJANAND_ERP_Database' ) ) {
			$this->markTestSkipped( 'Database class missing' );
		}
		SAHAJANAND_ERP_Database::create_tables();

		global $wpdb;
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$names = wp_list_pluck( $wpdb->get_results( "SHOW COLUMNS FROM {$wpdb->prefix}erp_helpdesk_ticket_replies", ARRAY_A ), 'Field' );
		foreach ( array( 'ticket_id', 'user_id', 'message', 'is_note', 'attachment_ids', 'message_id' ) as $column ) {
			$this->assertContains( $column, $names, "Missing replies column {$column}" );
		}

		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$names = wp_list_pluck( $wpdb->get_results( "SHOW COLUMNS FROM {$wpdb->prefix}erp_helpdesk_saved_replies", ARRAY_A ), 'Field' );
		foreach ( array( 'title', 'content', 'created_at' ) as $column ) {
			$this->assertContains( $column, $names, "Missing saved replies column {$column}" );
		}
	}

	/**
	 * Dropping a folder-flag column is repaired by create_tables().
	 */
	public function test_migrate_ticket_columns_restores_dropped_column() {
		if ( ! class_exists( 'SAHAJANAND_ERP_Database' ) ) {
			$this->markTestSkipped( 'Database class missing' );
		}
		SAHAJANAND_ERP_Database::create_tables();

		global $wpdb;
		$table = $wpdb->prefix . 'erp_helpdesk_tickets';

		$suppress = $wpdb->suppress_errors();
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$wpdb->query( "ALTER TABLE {$table} DROP COLUMN is_starred" );
		$wpdb->suppress_errors( $suppress );

		SAHAJANAND_ERP_Database::create_tables();

		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$names = wp_list_pluck( $wpdb->get_results( "SHOW COLUMNS FROM {$table}", ARRAY_A ), 'Field' );
		$this->assertContains( 'is_starred', $names, 'Migration must restore dropped columns.' );
	}

	/**
	 * Plain-text messages are autop'd, HTML ones are left alone.
	 */
	public function test_migrate_message_formatting_converts_plain_text() {
		if ( ! class_exists( 'SAHAJANAND_ERP_Database' ) ) {
			$this->markTestSkipped( 'Database class missing' );
		}
		SAHAJANAND_ERP_Database::create_tables();

		global $wpdb;
		$wpdb->insert(
			$wpdb->prefix . 'erp_helpdesk_ticket_replies',
			array(
				'ticket_id' => 1,
				'user_id'   => 0,
				'message'   => "Line one\n\nLine two",
				'is_note'   => 0,
			)
		);
		$plain_reply = (int) $wpdb->insert_id;
		$wpdb->insert(
			$wpdb->prefix . 'erp_helpdesk_ticket_replies',
			array(
				'ticket_id' => 1,
				'user_id'   => 0,
				'message'   => '<p>Already HTML</p>',
				'is_note'   => 0,
			)
		);
		$html_reply = (int) $wpdb->insert_id;

		$wpdb->insert(
			$wpdb->prefix . 'erp_helpdesk_tickets',
			array(
				'ticket_no'   => '#fmt-1',
				'subject'     => 'Plain',
				// Angle brackets around an email address are not treated as tags.
				'description' => "Email me at <foo@bar.com>\nSecond line",
			)
		);
		$plain_ticket = (int) $wpdb->insert_id;

		SAHAJANAND_ERP_Database::create_tables();

		$message = $wpdb->get_var(
			$wpdb->prepare( "SELECT message FROM {$wpdb->prefix}erp_helpdesk_ticket_replies WHERE id = %d", $plain_reply )
		);
		$this->assertStringContainsString( '<p>Line one</p>', (string) $message );

		$untouched = $wpdb->get_var(
			$wpdb->prepare( "SELECT message FROM {$wpdb->prefix}erp_helpdesk_ticket_replies WHERE id = %d", $html_reply )
		);
		$this->assertSame( '<p>Already HTML</p>', $untouched );

		$description = $wpdb->get_var(
			$wpdb->prepare( "SELECT description FROM {$wpdb->prefix}erp_helpdesk_tickets WHERE id = %d", $plain_ticket )
		);
		$this->assertStringStartsWith( '<p>', (string) $description );
		$this->assertStringContainsString( '<foo@bar.com>', (string) $description );
	}
}
