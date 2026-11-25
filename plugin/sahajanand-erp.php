<?php
/**
 * Plugin Name: Sahajanand ERP
 * Plugin URI: https://github.com/sahajananddigital/Simple-ERP-for-WordPress
 * Description: A comprehensive Management System (ERP) for WordPress. Includes CRM, Accounting, HR, Helpdesk, and API.
 * Version: 1.1.4
 * Author: Sahajanand Digital
 * Author URI: https://sahajananddigital.in
 * License: GPL v3 or later
 * License URI: https://www.gnu.org/licenses/gpl-3.0.html
 * Text Domain: sahajanand-erp
 * Domain Path: /languages
 * Requires at least: 6.8
 * Requires PHP: 7.4
 * Update URI: false
 */

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Define plugin constants
define( 'SAHAJANAND_ERP_VERSION', '1.1.4' );
define( 'SAHAJANAND_ERP_PLUGIN_FILE', __FILE__ );
define( 'SAHAJANAND_ERP_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'SAHAJANAND_ERP_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'SAHAJANAND_ERP_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );

// 1. Load Composer Autoloader
if ( file_exists( SAHAJANAND_ERP_PLUGIN_DIR . 'vendor/autoload.php' ) ) {
	require_once SAHAJANAND_ERP_PLUGIN_DIR . 'vendor/autoload.php';
}

// 2. Fallback PSR-4 Autoloader for SahajanandERP namespace (WooCommerce style)
spl_autoload_register( function ( $class ) {
	$prefix   = 'SahajanandERP\\';
	$base_dir = SAHAJANAND_ERP_PLUGIN_DIR . 'includes/src/';
	$len      = strlen( $prefix );
	if ( strncmp( $prefix, $class, $len ) !== 0 ) {
		return;
	}
	$relative_class = substr( $class, $len );
	$file           = $base_dir . str_replace( '\\', '/', $relative_class ) . '.php';
	if ( file_exists( $file ) ) {
		require_once $file;
	}
} );

// 3. Action Scheduler & helper functions
if ( file_exists( SAHAJANAND_ERP_PLUGIN_DIR . 'vendor/woocommerce/action-scheduler/action-scheduler.php' ) ) {
	require_once SAHAJANAND_ERP_PLUGIN_DIR . 'vendor/woocommerce/action-scheduler/action-scheduler.php';
}
require_once SAHAJANAND_ERP_PLUGIN_DIR . 'includes/update-db.php';
require_once SAHAJANAND_ERP_PLUGIN_DIR . 'includes/functions.php';

/**
 * Main Sahajanand ERP Class
 */
final class Sahajanand_ERP {

	use \SahajanandERP\Traits\SingletonTrait;

	/**
	 * Addon manager instance
	 *
	 * @var \SahajanandERP\Managers\AddonManager
	 */
	public $addons;

	/**
	 * Module manager instance
	 *
	 * @var \SahajanandERP\Managers\ModuleManager
	 */
	public $modules;

	/**
	 * User Management instance
	 *
	 * @var \SahajanandERP\Managers\UserManagement
	 */
	public $user_management;

	/**
	 * User Sync instance
	 *
	 * @var \SahajanandERP\Managers\UserSync
	 */
	public $user_sync;

	/**
	 * API instance
	 *
	 * @var \SahajanandERP\API\Server
	 */
	public $api;

	/**
	 * Admin settings instance
	 *
	 * @var \SahajanandERP\Admin\Admin
	 */
	public $admin;

	/**
	 * SPA handler instance
	 *
	 * @var \SahajanandERP\Admin\SPA
	 */
	public $spa;

	/**
	 * Constructor
	 */
	protected function __construct() {
		$this->init_hooks();
		$this->api   = new \SahajanandERP\API\Server();
		$this->admin = new \SahajanandERP\Admin\Admin();
		$this->spa   = new \SahajanandERP\Admin\SPA();
	}

	/**
	 * Initialize hooks
	 */
	private function init_hooks() {
		register_activation_hook( SAHAJANAND_ERP_PLUGIN_FILE, array( '\SahajanandERP\Install', 'install' ) );
		register_deactivation_hook( SAHAJANAND_ERP_PLUGIN_FILE, array( '\SahajanandERP\Install', 'deactivate' ) );

		add_action( 'init', array( $this, 'init' ), 0 );
		add_action( 'admin_enqueue_scripts', array( $this, 'admin_scripts' ) );
		add_action( 'rest_api_init', array( $this, 'register_rest_routes' ) );

		\SahajanandERP\Admin\DashboardWidget::init();
	}

	/**
	 * Initialize plugin
	 */
	public function init() {
		// Load text domain
		load_plugin_textdomain( 'sahajanand-erp', false, dirname( SAHAJANAND_ERP_PLUGIN_BASENAME ) . '/languages' );

		// Check for updates
		\SahajanandERP\Install::check_for_updates();

		// Init Mail Fetcher
		\SahajanandERP\Helpdesk\MailFetcher::init();

		// Initialize managers
		$this->modules         = new \SahajanandERP\Managers\ModuleManager();
		$this->addons          = new \SahajanandERP\Managers\AddonManager();
		$this->user_management = new \SahajanandERP\Managers\UserManagement();
		$this->user_sync       = new \SahajanandERP\Managers\UserSync();

		// Load core modules (Accounting unifies invoices, expenses, and vouchers)
		$this->modules->register_module( 'crm', new \SahajanandERP\Modules\CRM() );
		$this->modules->register_module( 'accounting', new \SahajanandERP\Modules\Accounting() );
		$this->modules->register_module( 'hr', new \SahajanandERP\Modules\HR() );
		$this->modules->register_module( 'helpdesk', new \SahajanandERP\Modules\Helpdesk() );
		
		// Load addons
		$this->addons->load_addons();
		
		do_action( 'sahajanand_erp_init' );
	}
	
	/**
	 * Enqueue admin scripts and styles
	 */
	public function admin_scripts( $hook ) {
		// Only load on ERP pages
		if ( strpos( $hook, 'sahajanand-erp' ) === false ) {
			return;
		}
		
		// Enqueue Gutenberg styles
		wp_enqueue_style( 'wp-components' );

		// Enqueue media scripts for wp.media
		wp_enqueue_media();
		
		// Enqueue WP Editor (TinyMCE)
		if ( function_exists( 'wp_enqueue_editor' ) ) {
			wp_enqueue_editor();
		}
		
		// Check if build files exist
		$build_js = SAHAJANAND_ERP_PLUGIN_DIR . 'build/index.js';
		$asset_file = SAHAJANAND_ERP_PLUGIN_DIR . 'build/index.asset.php';
		
		if ( file_exists( $build_js ) && file_exists( $asset_file ) ) {
			// Get dependencies and version from asset file
			$asset = require $asset_file;
			
			// Ensure asset is an array with required keys
			if ( ! is_array( $asset ) || ! isset( $asset['dependencies'] ) || ! isset( $asset['version'] ) ) {
				$asset = array(
					'dependencies' => array( 'wp-element', 'wp-api-fetch', 'wp-components', 'wp-i18n' ),
					'version' => SAHAJANAND_ERP_VERSION,
				);
			}
			
			// Enqueue plugin assets
			wp_enqueue_script(
				'sahajanand-erp-admin',
				SAHAJANAND_ERP_PLUGIN_URL . 'build/index.js',
				$asset['dependencies'],
				$asset['version'],
				true
			);
			
			if ( file_exists( SAHAJANAND_ERP_PLUGIN_DIR . 'build/style-index.css' ) ) {
				wp_enqueue_style(
					'sahajanand-erp-admin-style',
					SAHAJANAND_ERP_PLUGIN_URL . 'build/style-index.css',
					array( 'wp-components' ),
					$asset['version']
				);
			}
			
			// Localize script
			$modules_data = array();
			if ( isset( $this->modules ) && is_object( $this->modules ) ) {
				$modules_data = $this->modules->get_registered_modules();
			}
			
			wp_localize_script( 'sahajanand-erp-admin', 'sahajanandErp', array(
				'apiUrl' => rest_url( 'sahajanand-erp/v1/' ),
				'nonce' => wp_create_nonce( 'wp_rest' ),
				'modules' => $modules_data,
				'adminUrl' => admin_url(),
			) );
		} else {
			// Add admin notice if build files don't exist
			add_action( 'admin_notices', array( $this, 'build_files_missing_notice' ) );
		}
	}
	
	/**
	 * Show notice if build files are missing
	 */
	public function build_files_missing_notice() {
		?>
		<div class="notice notice-error">
			<p>
				<strong><?php esc_html_e( 'Sahajanand ERP:', 'sahajanand-erp' ); ?></strong>
				<?php esc_html_e( 'Build files are missing. Please run "npm install" and "npm run build" in the plugin directory.', 'sahajanand-erp' ); ?>
			</p>
		</div>
		<?php
	}
	
	/**
	 * Register REST API routes
	 */
	public function register_rest_routes() {
		$this->api->register_routes();
	}
}

/**
 * Main function to get Sahajanand ERP instance
 *
 * @return Sahajanand_ERP
 */
function Sahajanand_ERP() {
	return Sahajanand_ERP::instance();
}

// Initialize plugin
Sahajanand_ERP();

