<?php
/**
 * Admin Settings
 *
 * @package Sahajanand_ERP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class SAHAJANAND_ERP_Admin {
	
	/**
	 * Constructor
	 */
	public function __construct() {
		// add_action( 'admin_menu', array( $this, 'add_settings_menu' ) );
		add_action( 'admin_init', array( $this, 'register_settings' ) );
	}
	
	/**
	 * Add settings menu
	 */
	public function add_settings_menu() {
		add_menu_page(
			__( 'ERP Settings', 'sahajanand-erp' ),
			__( 'ERP Settings', 'sahajanand-erp' ),
			'manage_options',
			'sahajanand-erp-settings',
			array( $this, 'render_settings_page' ),
			'dashicons-admin-generic',
			90
		);
		
		add_submenu_page(
			'sahajanand-erp-settings',
			__( 'Settings', 'sahajanand-erp' ),
			__( 'Settings', 'sahajanand-erp' ),
			'manage_options',
			'sahajanand-erp-settings',
			array( $this, 'render_settings_page' )
		);
		
		add_submenu_page(
			'sahajanand-erp-settings',
			__( 'Addons', 'sahajanand-erp' ),
			__( 'Addons', 'sahajanand-erp' ),
			'manage_options',
			'sahajanand-erp-addons',
			array( $this, 'render_addons_page' )
		);
	}
	
	/**
	 * Register settings
	 */
	public function register_settings() {
		register_setting( 'sahajanand_erp_settings', 'sahajanand_erp_settings' );
	}
	
	/**
	 * Render settings page
	 */
	public function render_settings_page() {
		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'Sahajanand ERP Settings', 'sahajanand-erp' ); ?></h1>
			<form method="post" action="options.php">
				<?php settings_fields( 'sahajanand_erp_settings' ); ?>
				<table class="form-table">
					<tr>
						<th scope="row"><?php esc_html_e( 'Company Name', 'sahajanand-erp' ); ?></th>
						<td>
							<?php
							$settings = get_option( 'sahajanand_erp_settings', array() );
							$company_name = isset( $settings['company_name'] ) ? $settings['company_name'] : '';
							?>
							<input type="text" name="sahajanand_erp_settings[company_name]" value="<?php echo esc_attr( $company_name ); ?>" class="regular-text" />
						</td>
					</tr>
				</table>
				<?php submit_button(); ?>
			</form>
		</div>
		<?php
	}
	
	/**
	 * Render addons page
	 */
	public function render_addons_page() {
		global $wpdb;
		
		$table_name = $wpdb->prefix . 'erp_addons';
		
		// Check if table exists
		if ( $wpdb->get_var( "SHOW TABLES LIKE '$table_name'" ) != $table_name ) {
			echo '<div class="wrap"><h1>' . esc_html__( 'Sahajanand ERP Addons', 'sahajanand-erp' ) . '</h1>';
			echo '<p>' . esc_html__( 'Database tables not initialized. Please deactivate and reactivate the plugin.', 'sahajanand-erp' ) . '</p></div>';
			return;
		}
		
		$addons = $wpdb->get_results( "SELECT * FROM $table_name" );
		
		// Handle activation/deactivation
		if ( isset( $_GET['action'] ) && isset( $_GET['addon'] ) ) {
			$erp = Sahajanand_ERP();
			$addon_key = sanitize_text_field( $_GET['addon'] );
			
			if ( $_GET['action'] === 'activate' ) {
				$erp->addons->activate_addon( $addon_key );
				echo '<div class="notice notice-success"><p>' . esc_html__( 'Addon activated.', 'sahajanand-erp' ) . '</p></div>';
			} elseif ( $_GET['action'] === 'deactivate' ) {
				$erp->addons->deactivate_addon( $addon_key );
				echo '<div class="notice notice-success"><p>' . esc_html__( 'Addon deactivated.', 'sahajanand-erp' ) . '</p></div>';
			}
			
			// Refresh addons list
			$addons = $wpdb->get_results( "SELECT * FROM $table_name" );
		}
		
		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'Sahajanand ERP Addons', 'sahajanand-erp' ); ?></h1>
			
			<?php if ( empty( $addons ) ) : ?>
				<p><?php esc_html_e( 'No addons installed.', 'sahajanand-erp' ); ?></p>
			<?php else : ?>
				<table class="wp-list-table widefat fixed striped">
					<thead>
						<tr>
							<th><?php esc_html_e( 'Name', 'sahajanand-erp' ); ?></th>
							<th><?php esc_html_e( 'Version', 'sahajanand-erp' ); ?></th>
							<th><?php esc_html_e( 'Status', 'sahajanand-erp' ); ?></th>
							<th><?php esc_html_e( 'Actions', 'sahajanand-erp' ); ?></th>
						</tr>
					</thead>
					<tbody>
						<?php foreach ( $addons as $addon ) : ?>
							<tr>
								<td><?php echo esc_html( $addon->name ); ?></td>
								<td><?php echo esc_html( $addon->version ); ?></td>
								<td>
									<?php if ( $addon->active ) : ?>
										<span class="dashicons dashicons-yes-alt" style="color: green;"></span> <?php esc_html_e( 'Active', 'sahajanand-erp' ); ?>
									<?php else : ?>
										<span class="dashicons dashicons-dismiss" style="color: red;"></span> <?php esc_html_e( 'Inactive', 'sahajanand-erp' ); ?>
									<?php endif; ?>
								</td>
								<td>
									<?php if ( $addon->active ) : ?>
										<a href="<?php echo esc_url( admin_url( 'admin.php?page=sahajanand-erp-addons&action=deactivate&addon=' . $addon->addon_key ) ); ?>" class="button">
											<?php esc_html_e( 'Deactivate', 'sahajanand-erp' ); ?>
										</a>
									<?php else : ?>
										<a href="<?php echo esc_url( admin_url( 'admin.php?page=sahajanand-erp-addons&action=activate&addon=' . $addon->addon_key ) ); ?>" class="button button-primary">
											<?php esc_html_e( 'Activate', 'sahajanand-erp' ); ?>
										</a>
									<?php endif; ?>
								</td>
							</tr>
						<?php endforeach; ?>
					</tbody>
				</table>
			<?php endif; ?>
		</div>
		<?php
	}
}

new SAHAJANAND_ERP_Admin();

