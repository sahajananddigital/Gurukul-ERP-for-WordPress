<?php
/**
 * Calendar Module
 *
 * @package Gurukul_ERP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WP_ERP_Calendar {

	/**
	 * Constructor
	 */
	public function __construct() {
        // add_action( 'admin_menu', array( , 'add_admin_menu' ) );
	}

    /**
     * Add Admin Menu
     */
    public function add_admin_menu() {
        add_menu_page(
            __( 'Calendar', 'wp-erp' ),
            __( 'Calendar', 'wp-erp' ),
            'manage_options',
            'wp-erp-calendar',
            array( $this, 'render_page' ),
            'dashicons-calendar',
            40
        );
    }

    /**
     * Render Admin Page
     */
    public function render_page() {
        ?>
        <div id="wp-erp-calendar-root"></div>
        <?php
    }
}
