<?php
/**
 * WordPress dashboard widget.
 *
 * @package Sahajanand_ERP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers the Sahajanand ERP overview widget on the WordPress dashboard.
 *
 * @package Sahajanand_ERP
 */
class SAHAJANAND_ERP_Dashboard_Widget {

	/**
	 * Register hooks.
	 */
	public static function init() {
		add_action( 'wp_dashboard_setup', array( __CLASS__, 'register' ) );
	}

	/**
	 * Register the dashboard widget.
	 */
	public static function register() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		wp_add_dashboard_widget(
			'sahajanand_erp_overview',
			__( 'Sahajanand ERP Overview', 'sahajanand-erp' ),
			array( __CLASS__, 'render' )
		);
	}

	/**
	 * Build the SPA link for a module route.
	 *
	 * @param string $route SPA route without the leading hash.
	 * @return string
	 */
	private static function app_link( $route ) {
		return admin_url( 'admin.php?page=sahajanand-erp-app#/' ) . ltrim( $route, '/' );
	}

	/**
	 * Format a number for display.
	 *
	 * @param float $value Value to format.
	 * @return string
	 */
	private static function money( $value ) {
		return number_format_i18n( (float) $value, 2 );
	}

	/**
	 * Render the dashboard widget.
	 */
	public static function render() {
		$summary = SAHAJANAND_ERP_Summary::get_module_summary();

		$rows = array(
			array(
				'module'  => __( 'CRM', 'sahajanand-erp' ),
				'link'    => self::app_link( 'crm' ),
				'details' => sprintf(
					/* translators: 1: contacts, 2: leads, 3: deals, 4: deal pipeline value. */
					__( '%1$s contacts · %2$s leads · %3$s deals (%4$s)', 'sahajanand-erp' ),
					number_format_i18n( $summary['crm']['contacts'] ),
					number_format_i18n( $summary['crm']['leads'] ),
					number_format_i18n( $summary['crm']['deals'] ),
					self::money( $summary['crm']['deals_value'] )
				),
			),
			array(
				'module'  => __( 'Accounting', 'sahajanand-erp' ),
				'link'    => self::app_link( 'accounting' ),
				'details' => sprintf(
					/* translators: 1: accounts, 2: transactions. */
					__( '%1$s accounts · %2$s transactions', 'sahajanand-erp' ),
					number_format_i18n( $summary['accounting']['accounts'] ),
					number_format_i18n( $summary['accounting']['transactions'] )
				),
			),
			array(
				'module'  => __( 'Invoices', 'sahajanand-erp' ),
				'link'    => '',
				'details' => sprintf(
					/* translators: 1: invoice count, 2: invoiced total. */
					__( '%1$s invoices · %2$s invoiced', 'sahajanand-erp' ),
					number_format_i18n( $summary['invoices']['count'] ),
					self::money( $summary['invoices']['total'] )
				),
			),
			array(
				'module'  => __( 'Expenses', 'sahajanand-erp' ),
				'link'    => '',
				'details' => sprintf(
					/* translators: 1: expense count, 2: expense total. */
					__( '%1$s expenses · %2$s spent', 'sahajanand-erp' ),
					number_format_i18n( $summary['expenses']['count'] ),
					self::money( $summary['expenses']['total'] )
				),
			),
			array(
				'module'  => __( 'Vouchers', 'sahajanand-erp' ),
				'link'    => '',
				'details' => sprintf(
					/* translators: 1: voucher count, 2: voucher total. */
					__( '%1$s vouchers · %2$s', 'sahajanand-erp' ),
					number_format_i18n( $summary['vouchers']['count'] ),
					self::money( $summary['vouchers']['total'] )
				),
			),
			array(
				'module'  => __( 'HR', 'sahajanand-erp' ),
				'link'    => self::app_link( 'hr' ),
				'details' => sprintf(
					/* translators: 1: employees, 2: active employees, 3: pending leave requests. */
					__( '%1$s employees (%2$s active) · %3$s pending leaves', 'sahajanand-erp' ),
					number_format_i18n( $summary['hr']['employees'] ),
					number_format_i18n( $summary['hr']['active_employees'] ),
					number_format_i18n( $summary['hr']['pending_leaves'] )
				),
			),
			array(
				'module'  => __( 'Helpdesk', 'sahajanand-erp' ),
				'link'    => self::app_link( 'helpdesk' ),
				'details' => sprintf(
					/* translators: 1: tickets, 2: unassigned tickets, 3: mailboxes. */
					__( '%1$s tickets · %2$s unassigned · %3$s mailboxes', 'sahajanand-erp' ),
					number_format_i18n( $summary['helpdesk']['tickets'] ),
					number_format_i18n( $summary['helpdesk']['unassigned'] ),
					number_format_i18n( $summary['helpdesk']['mailboxes'] )
				),
			),
		);
		?>
		<table class="widefat striped">
			<tbody>
				<tr>
					<td><strong><?php esc_html_e( 'Income (Invoices)', 'sahajanand-erp' ); ?></strong></td>
					<td><?php echo esc_html( self::money( $summary['finance']['income_total'] ) ); ?></td>
				</tr>
				<tr>
					<td><strong><?php esc_html_e( 'Expenses', 'sahajanand-erp' ); ?></strong></td>
					<td><?php echo esc_html( self::money( $summary['finance']['expense_total'] ) ); ?></td>
				</tr>
				<tr>
					<td><strong><?php esc_html_e( 'Net', 'sahajanand-erp' ); ?></strong></td>
					<td><?php echo esc_html( self::money( $summary['finance']['net_total'] ) ); ?></td>
				</tr>
			</tbody>
		</table>

		<table class="widefat striped" style="margin-top:8px;">
			<tbody>
				<?php foreach ( $rows as $row ) : ?>
					<tr>
						<td style="width:30%;">
							<?php if ( $row['link'] ) : ?>
								<a href="<?php echo esc_url( $row['link'] ); ?>"><strong><?php echo esc_html( $row['module'] ); ?></strong></a>
							<?php else : ?>
								<strong><?php echo esc_html( $row['module'] ); ?></strong>
							<?php endif; ?>
						</td>
						<td><?php echo esc_html( $row['details'] ); ?></td>
					</tr>
				<?php endforeach; ?>
			</tbody>
		</table>

		<p style="margin-bottom:0;">
			<a class="button button-small" href="<?php echo esc_url( self::app_link( 'dashboard' ) ); ?>">
				<?php esc_html_e( 'Open ERP Dashboard', 'sahajanand-erp' ); ?>
			</a>
		</p>
		<?php
	}
}
