<?php
/**
 * Module-wise summary figures for the dashboards.
 *
 * @package Sahajanand_ERP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Collects module-wise figures used by the WordPress and SPA dashboards.
 *
 * @package Sahajanand_ERP
 */
class SAHAJANAND_ERP_Summary {

	/**
	 * Get the table name for an ERP table.
	 *
	 * @param string $suffix Table suffix, e.g. "crm_contacts".
	 * @return string
	 */
	private static function table( $suffix ) {
		global $wpdb;
		return $wpdb->prefix . 'erp_' . $suffix;
	}

	/**
	 * Count rows in a table.
	 *
	 * @param string $suffix Table suffix.
	 * @param string $where Optional WHERE clause (already prepared).
	 * @return int
	 */
	private static function count( $suffix, $where = '' ) {
		global $wpdb;
		$sql = 'SELECT COUNT(*) FROM ' . self::table( $suffix );
		if ( $where ) {
			$sql .= ' WHERE ' . $where;
		}
		// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared -- Table name is an internal constant.
		return (int) $wpdb->get_var( $sql );
	}

	/**
	 * Sum a numeric column.
	 *
	 * @param string $suffix Table suffix.
	 * @param string $column Column to sum.
	 * @param string $where Optional WHERE clause (already prepared).
	 * @return float
	 */
	private static function sum( $suffix, $column, $where = '' ) {
		global $wpdb;
		$sql = 'SELECT COALESCE(SUM(' . $column . '), 0) FROM ' . self::table( $suffix );
		if ( $where ) {
			$sql .= ' WHERE ' . $where;
		}
		// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared -- Table/column names are internal constants.
		return (float) $wpdb->get_var( $sql );
	}

	/**
	 * Count rows grouped by status.
	 *
	 * @param string $suffix Table suffix.
	 * @param string $column Status column name.
	 * @return array<string,int>
	 */
	private static function count_by_status( $suffix, $column = 'status' ) {
		global $wpdb;
		$sql = 'SELECT ' . $column . ' AS status, COUNT(*) AS total FROM ' . self::table( $suffix ) . ' GROUP BY ' . $column;
		// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared -- Table/column names are internal constants.
		$rows = $wpdb->get_results( $sql, ARRAY_A );
		$out  = array();
		if ( $rows ) {
			foreach ( $rows as $row ) {
				$key         = '' === $row['status'] || null === $row['status'] ? 'unknown' : (string) $row['status'];
				$out[ $key ] = (int) $row['total'];
			}
		}
		return $out;
	}

	/**
	 * Sum a numeric column grouped by status.
	 *
	 * @param string $suffix Table suffix.
	 * @param string $column Amount column name.
	 * @param string $status_column Status column name.
	 * @return array<string,float>
	 */
	private static function sum_by_status( $suffix, $column, $status_column = 'status' ) {
		global $wpdb;
		$sql = 'SELECT ' . $status_column . ' AS status, COALESCE(SUM(' . $column . '), 0) AS total FROM ' . self::table( $suffix ) . ' GROUP BY ' . $status_column;
		// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared -- Table/column names are internal constants.
		$rows = $wpdb->get_results( $sql, ARRAY_A );
		$out  = array();
		if ( $rows ) {
			foreach ( $rows as $row ) {
				$key         = '' === $row['status'] || null === $row['status'] ? 'unknown' : (string) $row['status'];
				$out[ $key ] = (float) $row['total'];
			}
		}
		return $out;
	}

	/**
	 * Collect module-wise figures for the dashboards.
	 *
	 * @return array
	 */
	public static function get_module_summary() {
		$income_total  = self::sum( 'invoices', 'total_amount' );
		$expense_total = self::sum( 'expenses', 'amount' );

		return array(
			'finance'    => array(
				'income_total'  => $income_total,
				'expense_total' => $expense_total,
				'net_total'     => $income_total - $expense_total,
			),
			'crm'        => array(
				'contacts'      => self::count( 'crm_contacts' ),
				'leads'         => self::count( 'crm_leads' ),
				'deals'         => self::count( 'crm_deals' ),
				'deals_value'   => self::sum( 'crm_deals', 'amount' ),
				'organizations' => self::count( 'crm_organizations' ),
			),
			'accounting' => array(
				'accounts'           => self::count( 'accounting_chart_of_accounts' ),
				'transactions'       => self::count( 'accounting_transactions' ),
				'transactions_total' => self::sum( 'accounting_transactions', 'total' ),
			),
			'invoices'   => array(
				'count'           => self::count( 'invoices' ),
				'total'           => $income_total,
				'by_status'       => self::count_by_status( 'invoices' ),
				'total_by_status' => self::sum_by_status( 'invoices', 'total_amount' ),
			),
			'expenses'   => array(
				'count'     => self::count( 'expenses' ),
				'total'     => $expense_total,
				'by_status' => self::count_by_status( 'expenses' ),
			),
			'vouchers'   => array(
				'count' => self::count( 'vouchers' ),
				'total' => self::sum( 'vouchers', 'amount' ),
			),
			'hr'         => array(
				'employees'        => self::count( 'hr_employees' ),
				'active_employees' => self::count( 'hr_employees', "status = 'active'" ),
				'pending_leaves'   => self::count( 'hr_leave_requests', "status = 'pending'" ),
			),
			'helpdesk'   => array(
				'tickets'    => self::count( 'helpdesk_tickets' ),
				'unassigned' => self::count( 'helpdesk_tickets', 'assignee_id IS NULL' ),
				'mailboxes'  => self::count( 'helpdesk_mailboxes' ),
				'by_status'  => self::count_by_status( 'helpdesk_tickets' ),
			),
		);
	}
}
