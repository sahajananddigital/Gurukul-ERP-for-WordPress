<?php
/**
 * SPA Layout Settings
 *
 * @package WP_ERP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WP_ERP_SPA {
	
	/**
	 * Constructor
	 */
	public function __construct() {
		add_action( 'admin_menu', array( $this, 'add_spa_menu' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_spa_scripts' ) );
	}
	
	/**
	 * Add SPA menu
	 */
	public function add_spa_menu() {
		// Register a single main menu page
		add_menu_page(
			__( 'Sahajanand ERP', 'wp-erp' ),
			__( 'Sahajanand ERP', 'wp-erp' ),
			'manage_options',
			'wp-erp-app',
			array( $this, 'render_spa_page' ),
			'dashicons-building',
			30
		);

		// Hide all sub-modules from the WordPress sidebar,
		// as they will be accessed via our React Router sidebar.
		// However, we still need to register the capability for the admin page
		// if other modules relied on standard WordPress routing, but since
		// it's an SPA, 'wp-erp-app' is the only page we need.
	}
	
	/**
	 * Enqueue scripts for SPA
	 */
	public function enqueue_spa_scripts( $hook ) {
		if ( $hook !== 'toplevel_page_wp-erp-app' ) {
			return;
		}

		// Inject inline CSS to hide WordPress admin menus and topbar
		// to achieve the FSE (Full Site Editing) fullscreen UI.
		$css = '
			#wpadminbar { display: none !important; }
			#adminmenumain, #adminmenuwrap { display: none !important; }
			#wpcontent, #wpfooter { margin-left: 0 !important; }
			html.wp-toolbar { padding-top: 0 !important; }
			#wpbody-content { padding-bottom: 0 !important; }
			.auto-fold #wpcontent { padding-left: 0 !important; }
			
			/* Root container taking full height */
			#wp-erp-root {
				min-height: 100vh;
				background-color: #fff;
			}
		';
		wp_add_inline_style( 'wp-components', $css );
	}

	/**
	 * Render the root div for the React SPA
	 */
	public function render_spa_page() {
		echo '<div id="wp-erp-root"></div>';
	}
}

new WP_ERP_SPA();
