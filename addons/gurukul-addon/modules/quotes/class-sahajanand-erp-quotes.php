<?php
/**
 * Quotes Module
 *
 * @package Sahajanand_ERP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class SAHAJANAND_ERP_Quotes {

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
            __( 'Daily Quotes', 'sahajanand-erp' ),
            __( 'Daily Quotes', 'sahajanand-erp' ),
            'manage_options',
            'sahajanand-erp-quotes',
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
        <div id="sahajanand-erp-quotes-root"></div>
        <?php
    }

    /**
     * Enqueue Scripts
     */
    public function enqueue_scripts( $hook ) {
        if ( 'toplevel_page_sahajanand-erp-quotes' === $hook ) {
            wp_enqueue_media();
        }
    }
}
