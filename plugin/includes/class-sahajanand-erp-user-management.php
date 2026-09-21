<?php
/**
 * User Management Module
 *
 * @package Sahajanand_ERP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class SAHAJANAND_ERP_User_Management {

	/**
	 * ERP Capabilities
	 *
	 * @var array
	 */
	private $capabilities = array(
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
	 * Constructor
	 */
	public function __construct() {
		add_action( 'init', array( $this, 'init' ) );
		// Removed admin_menu hook since it's migrated to SPA
	}

	/**
	 * Initialize
	 */
	public function init() {
		// Ensure Administrator has all capabilities
		$role = get_role( 'administrator' );
		if ( $role ) {
			foreach ( $this->capabilities as $cap => $label ) {
				if ( ! $role->has_cap( $cap ) ) {
					$role->add_cap( $cap );
				}
			}
		}

		// Add ERP Staff role
		add_role( 'erp_staff', __( 'ERP Staff', 'sahajanand-erp' ), array(
			'read' => true,
		) );
	}

	/**
	 * Render page
	 */
	public function render_page() {
		$selected_user_id = isset( $_GET['user_id'] ) ? intval( $_GET['user_id'] ) : 0;
		$users = get_users( array( 'orderby' => 'display_name' ) );
		$selected_user = $selected_user_id ? get_user_by( 'id', $selected_user_id ) : null;
		
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
							<option value="<?php echo esc_attr( $user->ID ); ?>" <?php selected( $selected_user_id, $user->ID ); ?>>
								<?php echo esc_html( $user->display_name ); ?> (<?php echo esc_html( $user->user_email ); ?>) 
								- <?php echo esc_html( implode( ', ', $user->roles ) ); ?>
							</option>
						<?php endforeach; ?>
					</select>
					<noscript><button type="submit" class="button"><?php esc_html_e( 'Select', 'sahajanand-erp' ); ?></button></noscript>
				</form>
				
				<?php if ( $selected_user ) : ?>
					<hr style="margin: 20px 0;">
					
					<h2><?php printf( esc_html__( 'Access Permissions for %s', 'sahajanand-erp' ), '<code>' . esc_html( $selected_user->display_name ) . '</code>' ); ?></h2>
					
					<?php if ( in_array( 'administrator', $selected_user->roles ) ) : ?>
						<div class="notice notice-warning inline">
							<p><?php esc_html_e( 'This user is an Administrator and has access to all modules by default.', 'sahajanand-erp' ); ?></p>
						</div>
					<?php else : ?>
						<form method="post">
							<?php wp_nonce_field( 'sahajanand_erp_save_permissions', 'sahajanand_erp_permissions_nonce' ); ?>
							<input type="hidden" name="user_id" value="<?php echo esc_attr( $selected_user->ID ); ?>" />
							
							<table class="form-table">
								<tr>
									<th scope="row"><?php esc_html_e( 'Allowed Modules', 'sahajanand-erp' ); ?></th>
									<td>
										<fieldset>
											<?php foreach ( $this->capabilities as $cap => $label ) : ?>
												<label for="<?php echo esc_attr( $cap ); ?>" style="display: block; margin-bottom: 8px;">
													<input name="erp_caps[<?php echo esc_attr( $cap ); ?>]" type="checkbox" id="<?php echo esc_attr( $cap ); ?>" value="1" <?php checked( $selected_user->has_cap( $cap ) ); ?> />
													<?php echo esc_html( $label ); ?>
												</label>
											<?php endforeach; ?>
										</fieldset>
										<p class="description"><?php esc_html_e( 'Check the modules this user should have access to.', 'sahajanand-erp' ); ?></p>
									</td>
								</tr>
							</table>
							
							<?php submit_button( __( 'Save Permissions', 'sahajanand-erp' ) ); ?>
						</form>
					<?php endif; ?>
					
				<?php endif; ?>
			</div>
		</div>
		<?php
	}

	/**
	 * Handle form submission
	 */
	public function handle_form_submission() {
		if ( ! isset( $_POST['sahajanand_erp_permissions_nonce'] ) || ! wp_verify_nonce( $_POST['sahajanand_erp_permissions_nonce'], 'sahajanand_erp_save_permissions' ) ) {
			return;
		}
		
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}
		
		$user_id = isset( $_POST['user_id'] ) ? intval( $_POST['user_id'] ) : 0;
		if ( ! $user_id ) {
			return;
		}
		
		$user = get_user_by( 'id', $user_id );
		if ( ! $user ) {
			return;
		}
		
		$posted_caps = isset( $_POST['erp_caps'] ) ? array_keys( $_POST['erp_caps'] ) : array();
		
		foreach ( $this->capabilities as $cap => $label ) {
			if ( in_array( $cap, $posted_caps ) ) {
				$user->add_cap( $cap );
			} else {
				$user->remove_cap( $cap );
			}
		}
		
		add_settings_error( 'sahajanand_erp_user_access', 'settings_updated', __( 'Permissions saved.', 'sahajanand-erp' ), 'success' );
	}
}
