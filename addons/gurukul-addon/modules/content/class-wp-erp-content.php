<?php
/**
 * Content Module
 *
 * @package Gurukul_ERP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WP_ERP_Content {

	/**
	 * Constructor
	 */
	public function __construct() {
        add_action( 'init', array( $this, 'register_cpt' ) );
        // add_action( 'admin_menu', array( , 'add_admin_menu' ) );
        add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_scripts' ) );
	}

    /**
     * Register Custom Post Type
     */
    public function register_cpt() {
        $labels = array(
            'name'                  => _x( 'Daily Darshans', 'Post Type General Name', 'wp-erp' ),
            'singular_name'         => _x( 'Daily Darshan', 'Post Type Singular Name', 'wp-erp' ),
            'menu_name'             => __( 'Daily Darshan', 'wp-erp' ),
        );
        $args = array(
            'label'                 => __( 'Daily Darshan', 'wp-erp' ),
            'labels'                => $labels,
            'supports'              => array( 'title', 'thumbnail' ),
            'public'                => true,
            'show_ui'               => true,
            'show_in_menu'          => false, // Hidden from menu, accessed via custom page
            'show_in_rest'          => true,
            'capability_type'       => 'post',
        );
        register_post_type( 'daily_darshan', $args );
    }

    /**
     * Add Admin Menu
     */
    public function add_admin_menu() {
        add_menu_page(
            __( 'Daily Darshan', 'wp-erp' ),
            __( 'Daily Darshan', 'wp-erp' ),
            'manage_options',
            'wp-erp-content',
            array( $this, 'render_page' ),
            'dashicons-format-gallery',
            35
        );
    }

    /**
     * Render Admin Page
     */
    public function render_page() {
        ?>
        <div id="wp-erp-content-root"></div>
        <?php
    }

    /**
     * Enqueue Scripts
     */
    public function enqueue_scripts( $hook ) {
        if ( 'toplevel_page_wp-erp-content' === $hook ) {
            wp_enqueue_media();
        }
    }
}
