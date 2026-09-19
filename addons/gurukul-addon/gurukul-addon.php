<?php
/**
 * Plugin Name: Gurukul Addon for Sahajanand ERP
 * Plugin URI: https://sahajananddigital.in
 * Description: Premium addon for Sahajanand ERP providing Donations, Food Pass, and Content Darshan management.
 * Version: 1.0.0
 * Author: Sahajanand Digital
 * Author URI: https://sahajananddigital.in
 * License: GPL v3 or later
 * Text Domain: gurukul-addon
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'GURUKUL_ADDON_VERSION', '1.0.0' );
define( 'GURUKUL_ADDON_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'GURUKUL_ADDON_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

class Gurukul_Addon {
	
	private static $instance = null;
	
	public static function instance() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
		}
		return self::$instance;
	}
	
	private function __construct() {
		register_activation_hook( __FILE__, array( $this, 'install' ) );
		add_action( 'wp_erp_init', array( $this, 'init' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_scripts' ) );
	}
	
	public function install() {
		global $wpdb;
		$charset_collate = $wpdb->get_charset_collate();
		require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );

		// Create Donations table
		$table_name = $wpdb->prefix . 'erp_donations';
		$sql = "CREATE TABLE IF NOT EXISTS $table_name (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			donor_name varchar(255) NOT NULL,
			phone varchar(50) NOT NULL,
			ledger varchar(100) NOT NULL,
			amount decimal(10,2) NOT NULL,
			notes text,
			issue_date date NOT NULL,
			created_by bigint(20) unsigned DEFAULT NULL,
			created_at datetime DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY (id),
			KEY donor_name (donor_name),
			KEY phone (phone),
			KEY issue_date (issue_date)
		) $charset_collate;";
		dbDelta( $sql );

		// Create Food Pass tables
		$table_name = $wpdb->prefix . 'erp_food_passes';
		$sql = "CREATE TABLE IF NOT EXISTS $table_name (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			pass_no varchar(50) NOT NULL,
			employee_id bigint(20) unsigned DEFAULT NULL,
			contact_id bigint(20) unsigned DEFAULT NULL,
			issue_date date NOT NULL,
			valid_from date NOT NULL,
			valid_to date NOT NULL,
			meals_per_day int(11) DEFAULT 1,
			total_meals int(11) DEFAULT 0,
			used_meals int(11) DEFAULT 0,
			status varchar(20) DEFAULT 'active',
			notes text,
			created_by bigint(20) unsigned NOT NULL,
			created_at datetime DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY (id),
			UNIQUE KEY pass_no (pass_no)
		) $charset_collate;";
		dbDelta( $sql );

		$table_name = $wpdb->prefix . 'erp_food_pass_usage';
		$sql = "CREATE TABLE IF NOT EXISTS $table_name (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			pass_id bigint(20) unsigned NOT NULL,
			meal_date date NOT NULL,
			meal_type varchar(20) DEFAULT 'lunch',
			used_at datetime DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY (id),
			KEY pass_id (pass_id)
		) $charset_collate;";
		dbDelta( $sql );

		// Add Content/Darshan tables if needed...
	}
	
	public function init() {
		// Verify core is available
		if ( ! function_exists( 'WP_ERP' ) ) {
			return;
		}

		// Load Controllers
		require_once GURUKUL_ADDON_PLUGIN_DIR . 'includes/api/class-wp-erp-api-donations.php';
		require_once GURUKUL_ADDON_PLUGIN_DIR . 'includes/api/class-wp-erp-api-food-pass.php';
		require_once GURUKUL_ADDON_PLUGIN_DIR . 'includes/api/class-wp-erp-api-content.php';
		
		// Load Modules
		require_once GURUKUL_ADDON_PLUGIN_DIR . 'modules/donations/class-wp-erp-donations.php';
		require_once GURUKUL_ADDON_PLUGIN_DIR . 'modules/food-pass/class-wp-erp-food-pass.php';
		require_once GURUKUL_ADDON_PLUGIN_DIR . 'modules/content/class-wp-erp-content.php';

		$erp = WP_ERP();
		
		// Register Modules to core
		$erp->modules->register_module( 'donations', new WP_ERP_Donations() );
		$erp->modules->register_module( 'food-pass', new WP_ERP_Food_Pass() );
		$erp->modules->register_module( 'content', new WP_ERP_Content() );
		
		// Register APIs
		add_action( 'rest_api_init', function() {
			$donations_api = new WP_ERP_API_Donations();
			$donations_api->register_routes();
			
			$food_pass_api = new WP_ERP_API_Food_Pass();
			$food_pass_api->register_routes();
			
			$content_api = new WP_ERP_API_Content();
			$content_api->register_routes();
		});
	}

	public function enqueue_scripts( $hook ) {
		if ( $hook !== 'toplevel_page_wp-erp-app' ) {
			return;
		}

		$build_js = GURUKUL_ADDON_PLUGIN_DIR . 'build/index.js';
		if ( file_exists( $build_js ) ) {
			$asset_file = GURUKUL_ADDON_PLUGIN_DIR . 'build/index.asset.php';
			$asset = file_exists( $asset_file ) ? require $asset_file : array( 'dependencies' => array('wp-hooks', 'wp-element'), 'version' => GURUKUL_ADDON_VERSION );
			
			wp_enqueue_script(
				'gurukul-addon-admin',
				GURUKUL_ADDON_PLUGIN_URL . 'build/index.js',
				$asset['dependencies'],
				$asset['version'],
				true
			);
		}
	}
}

Gurukul_Addon::instance();
