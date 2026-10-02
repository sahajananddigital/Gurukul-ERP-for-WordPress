<?php
/**
 * Plugin Name: Sahajanand ERP Addon - Example Addon
 * Description: Example addon demonstrating how to extend Sahajanand ERP
 * Version: 1.0.0
 * Author: Your Name
 * Requires Sahajanand ERP: 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Example Addon Class
 */
class SAHAJANAND_ERP_Addon_Example_Addon {
	
	/**
	 * Constructor
	 */
	public function __construct() {
		add_action( 'sahajanand_erp_init', array( $this, 'init' ) );
		add_action( 'admin_menu', array( $this, 'add_menu' ) );
	}
	
	/**
	 * Initialize addon
	 */
	public function init() {
		// Add custom functionality here
		// You can hook into Sahajanand ERP actions and filters
		do_action( 'sahajanand_erp_example_addon_init' );
	}
	
	/**
	 * Add admin menu
	 */
	public function add_menu() {
		add_submenu_page(
			'sahajanand-erp-crm',
			__( 'Example Addon', 'sahajanand-erp' ),
			__( 'Example Addon', 'sahajanand-erp' ),
			'manage_options',
			'sahajanand-erp-example-addon',
			array( $this, 'render_page' )
		);
	}
	
	/**
	 * Render addon page
	 */
	public function render_page() {
		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'Example Addon', 'sahajanand-erp' ); ?></h1>
			<p><?php esc_html_e( 'This is an example addon for Sahajanand ERP.', 'sahajanand-erp' ); ?></p>
		</div>
		<?php
	}
}

// Initialize addon
new SAHAJANAND_ERP_Addon_Example_Addon();

