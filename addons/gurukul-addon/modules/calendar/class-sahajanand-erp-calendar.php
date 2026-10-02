<?php
/**
 * Calendar Module
 *
 * @package Sahajanand_ERP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class SAHAJANAND_ERP_Calendar {

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
            __( 'Calendar', 'sahajanand-erp' ),
            __( 'Calendar', 'sahajanand-erp' ),
            'manage_options',
            'sahajanand-erp-calendar',
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
        <div id="sahajanand-erp-calendar-root"></div>
        <?php
    }
}
