<?php
/**
 * Programs Module
 *
 * @package Gurukul_ERP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WP_ERP_Programs {

	/**
	 * Constructor
	 */
	public function __construct() {
        // add_action( 'admin_menu', array( , 'add_admin_menu' ) );
        add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_scripts' ) );
	}

    /**
     * Add Admin Menu
     */
    public function add_admin_menu() {
        add_menu_page(
            __( 'Daily Programs', 'wp-erp' ),
            __( 'Daily Programs', 'wp-erp' ),
            'manage_options',
            'wp-erp-programs',
            array( $this, 'render_page' ),
            'dashicons-calendar-alt',
            39
        );
    }

    /**
     * Render Admin Page
     */
    public function render_page() {
        ?>
        <div id="wp-erp-programs-root"></div>
        <?php
    }

    /**
     * Enqueue Scripts
     */
    public function enqueue_scripts( $hook ) {
        if ( 'toplevel_page_wp-erp-programs' === $hook ) {
            wp_enqueue_media();
        }
    }
}
