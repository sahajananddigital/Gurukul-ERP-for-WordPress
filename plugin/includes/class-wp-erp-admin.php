<?php
/**
 * Admin Settings
 *
 * @package WP_ERP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WP_ERP_Admin {
	
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
			__( 'ERP Settings', 'wp-erp' ),
			__( 'ERP Settings', 'wp-erp' ),
			'manage_options',
			'wp-erp-settings',
			array( $this, 'render_settings_page' ),
			'dashicons-admin-generic',
			90
		);
		
		add_submenu_page(
			'wp-erp-settings',
			__( 'Settings', 'wp-erp' ),
			__( 'Settings', 'wp-erp' ),
			'manage_options',
			'wp-erp-settings',
			array( $this, 'render_settings_page' )
		);
		
		add_submenu_page(
			'wp-erp-settings',
			__( 'Addons', 'wp-erp' ),
			__( 'Addons', 'wp-erp' ),
			'manage_options',
			'wp-erp-addons',
			array( $this, 'render_addons_page' )
		);
	}
	
	/**
	 * Register settings
	 */
	public function register_settings() {
		register_setting( 'wp_erp_settings', 'wp_erp_settings' );
	}
	
	/**
	 * Render settings page
	 */
	public function render_settings_page() {
		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'WP ERP Settings', 'wp-erp' ); ?></h1>
			<form method="post" action="options.php">
				<?php settings_fields( 'wp_erp_settings' ); ?>
				<table class="form-table">
					<tr>
						<th scope="row"><?php esc_html_e( 'Company Name', 'wp-erp' ); ?></th>
						<td>
							<?php
							$settings = get_option( 'wp_erp_settings', array() );
							$company_name = isset( $settings['company_name'] ) ? $settings['company_name'] : '';
							?>
							<input type="text" name="wp_erp_settings[company_name]" value="<?php echo esc_attr( $company_name ); ?>" class="regular-text" />
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
			echo '<div class="wrap"><h1>' . esc_html__( 'WP ERP Addons', 'wp-erp' ) . '</h1>';
			echo '<p>' . esc_html__( 'Database tables not initialized. Please deactivate and reactivate the plugin.', 'wp-erp' ) . '</p></div>';
			return;
		}
		
		$addons = $wpdb->get_results( "SELECT * FROM $table_name" );
		
		// Handle activation/deactivation
		if ( isset( $_GET['action'] ) && isset( $_GET['addon'] ) ) {
			$erp = WP_ERP();
			$addon_key = sanitize_text_field( $_GET['addon'] );
			
			if ( $_GET['action'] === 'activate' ) {
				$erp->addons->activate_addon( $addon_key );
				echo '<div class="notice notice-success"><p>' . esc_html__( 'Addon activated.', 'wp-erp' ) . '</p></div>';
			} elseif ( $_GET['action'] === 'deactivate' ) {
				$erp->addons->deactivate_addon( $addon_key );
				echo '<div class="notice notice-success"><p>' . esc_html__( 'Addon deactivated.', 'wp-erp' ) . '</p></div>';
			}
			
			// Refresh addons list
			$addons = $wpdb->get_results( "SELECT * FROM $table_name" );
		}
		
		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'WP ERP Addons', 'wp-erp' ); ?></h1>
			
			<?php if ( empty( $addons ) ) : ?>
				<p><?php esc_html_e( 'No addons installed.', 'wp-erp' ); ?></p>
			<?php else : ?>
				<table class="wp-list-table widefat fixed striped">
					<thead>
						<tr>
							<th><?php esc_html_e( 'Name', 'wp-erp' ); ?></th>
							<th><?php esc_html_e( 'Version', 'wp-erp' ); ?></th>
							<th><?php esc_html_e( 'Status', 'wp-erp' ); ?></th>
							<th><?php esc_html_e( 'Actions', 'wp-erp' ); ?></th>
						</tr>
					</thead>
					<tbody>
						<?php foreach ( $addons as $addon ) : ?>
							<tr>
								<td><?php echo esc_html( $addon->name ); ?></td>
								<td><?php echo esc_html( $addon->version ); ?></td>
								<td>
									<?php if ( $addon->active ) : ?>
										<span class="dashicons dashicons-yes-alt" style="color: green;"></span> <?php esc_html_e( 'Active', 'wp-erp' ); ?>
									<?php else : ?>
										<span class="dashicons dashicons-dismiss" style="color: red;"></span> <?php esc_html_e( 'Inactive', 'wp-erp' ); ?>
									<?php endif; ?>
								</td>
								<td>
									<?php if ( $addon->active ) : ?>
										<a href="<?php echo esc_url( admin_url( 'admin.php?page=wp-erp-addons&action=deactivate&addon=' . $addon->addon_key ) ); ?>" class="button">
											<?php esc_html_e( 'Deactivate', 'wp-erp' ); ?>
										</a>
									<?php else : ?>
										<a href="<?php echo esc_url( admin_url( 'admin.php?page=wp-erp-addons&action=activate&addon=' . $addon->addon_key ) ); ?>" class="button button-primary">
											<?php esc_html_e( 'Activate', 'wp-erp' ); ?>
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

new WP_ERP_Admin();

