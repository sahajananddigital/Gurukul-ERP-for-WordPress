<?php
/**
 * Satsang Module
 *
 * @package Gurukul_ERP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WP_ERP_Satsang {

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
            __( 'Daily Satsang', 'wp-erp' ),
            __( 'Daily Satsang', 'wp-erp' ),
            'manage_options',
            'wp-erp-satsang',
            array( $this, 'render_page' ),
            'dashicons-video-alt3',
            38
        );
    }

    /**
     * Render Admin Page
     */
    public function render_page() {
        ?>
        <div id="wp-erp-satsang-root"></div>
        <?php
    }
}
