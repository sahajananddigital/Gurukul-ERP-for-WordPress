<?php
/**
 * Quotes Module
 *
 * @package Gurukul_ERP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WP_ERP_Quotes {

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
            __( 'Daily Quotes', 'wp-erp' ),
            __( 'Daily Quotes', 'wp-erp' ),
            'manage_options',
            'wp-erp-quotes',
            array( $this, 'render_page' ),
            'dashicons-format-quote',
            36
        );
    }

    /**
     * Render Admin Page
     */
    public function render_page() {
        ?>
        <div id="wp-erp-quotes-root"></div>
        <?php
    }

    /**
     * Enqueue Scripts
     */
    public function enqueue_scripts( $hook ) {
        if ( 'toplevel_page_wp-erp-quotes' === $hook ) {
            wp_enqueue_media();
        }
    }
}
