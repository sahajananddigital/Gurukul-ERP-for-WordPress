<?php
/**
 * Satsang Module
 *
 * @package Sahajanand_ERP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class SAHAJANAND_ERP_Satsang {

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
            __( 'Daily Satsang', 'sahajanand-erp' ),
            __( 'Daily Satsang', 'sahajanand-erp' ),
            'manage_options',
            'sahajanand-erp-satsang',
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
        <div id="sahajanand-erp-satsang-root"></div>
        <?php
    }
}
