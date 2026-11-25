<?php
/**
 * Modern User Management Module
 *
 * @package SahajanandERP\Managers
 */

declare(strict_types=1);

namespace SahajanandERP\Managers;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class managing user capabilities and roles for the ERP.
 */
class UserManagement {

	/**
	 * ERP Capabilities.
	 *
	 * @var array<string, string>
	 */
	private array $capabilities = array(
		'erp_manage_crm'        => 'CRM',
		'erp_manage_accounting' => 'Accounting',
		'erp_manage_hr'         => 'HR',
		'erp_manage_helpdesk'   => 'Helpdesk',
		'erp_manage_vouchers'   => 'Vouchers',
		'erp_manage_invoices'   => 'Invoices',
		'erp_manage_expenses'   => 'Expenses',
		'erp_manage_food_pass'  => 'Food Pass',
		'erp_manage_donations'  => 'Donations',
	);

	/**
	 * Constructor.
	 */
	public function __construct() {
		add_action( 'init', array( $this, 'init' ) );
	}

	/**
	 * Initialize capabilities and ERP Staff role.
	 *
	 * @return void
	 */
	public function init(): void {
		$role = get_role( 'administrator' );
		if ( $role ) {
			foreach ( $this->capabilities as $cap => $label ) {
				if ( ! $role->has_cap( $cap ) ) {
					$role->add_cap( $cap );
				}
			}
		}

		add_role( 'erp_staff', __( 'ERP Staff', 'sahajanand-erp' ), array(
			'read' => true,
		) );
	}

	/**
	 * Render user access page.
	 *
	 * @return void
	 */
	public function render_page(): void {
		$selected_user_id = isset( $_GET['user_id'] ) ? intval( $_GET['user_id'] ) : 0;
		$users            = get_users( array( 'orderby' => 'display_name' ) );
		$selected_user    = $selected_user_id ? get_user_by( 'id', $selected_user_id ) : null;

		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'User Access Management', 'sahajanand-erp' ); ?></h1>
			<div class="card" style="max-width: 800px; padding: 20px; margin-top: 20px;">
				<h2><?php esc_html_e( 'Select User', 'sahajanand-erp' ); ?></h2>
				<form method="get">
					<input type="hidden" name="page" value="sahajanand-erp-user-access" />
					<select name="user_id" onchange="this.form.submit()">
						<option value="0"><?php esc_html_e( '-- Select a user --', 'sahajanand-erp' ); ?></option>
						<?php foreach ( $users as $user ) : ?>
							<option value="<?php echo esc_attr( (string) $user->ID ); ?>" <?php selected( $selected_user_id, $user->ID ); ?>>
								<?php echo esc_html( $user->display_name ); ?> (<?php echo esc_html( $user->user_email ); ?>) 
								- <?php echo esc_html( implode( ', ', (array) $user->roles ) ); ?>
							</option>
						<?php endforeach; ?>
					</select>
					<noscript><button type="submit" class="button"><?php esc_html_e( 'Select', 'sahajanand-erp' ); ?></button></noscript>
				</form>
				<?php if ( $selected_user ) : ?>
					<hr style="margin: 20px 0;">
					<h2><?php printf( esc_html__( 'Access Permissions for %s', 'sahajanand-erp' ), '<code>' . esc_html( $selected_user->display_name ) . '</code>' ); ?></h2>
					<?php if ( in_array( 'administrator', (array) $selected_user->roles, true ) ) : ?>
						<div class="notice notice-warning inline">
							<p><?php esc_html_e( 'This user is an Administrator and has access to all modules by default.', 'sahajanand-erp' ); ?></p>
						</div>
					<?php endif; ?>
				<?php endif; ?>
			</div>
		</div>
		<?php
	}
}
