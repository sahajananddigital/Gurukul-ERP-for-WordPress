<?php
/**
 * Plugin Name: Gurukul ERP
 * Plugin URI: https://github.com/sahajananddigital/Simple-ERP-for-WordPress
 * Description: A comprehensive Gurukul Management System (ERP) for WordPress. Includes Student CRM, Donations, Food Pass management, and API for Mobile App.
 * Version: 1.0.0
 * Author: Sahajanand Digital
 * Author URI: https://sahajananddigital.in
 * License: GPL v3 or later
 * License URI: https://www.gnu.org/licenses/gpl-3.0.html
 * Text Domain: wp-erp
 * Domain Path: /languages
 * Requires at least: 5.8
 * Requires PHP: 7.4
 */


// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Define plugin constants
define( 'WP_ERP_VERSION', '1.0.0' );
define( 'WP_ERP_PLUGIN_FILE', __FILE__ );
define( 'WP_ERP_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'WP_ERP_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'WP_ERP_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );

/**
 * Main WP ERP Class
 */
final class WP_ERP {
	
	/**
	 * Plugin instance
	 *
	 * @var WP_ERP
	 */
	private static $instance = null;
	
	/**
	 * Addon manager instance
	 *
	 * @var WP_ERP_Addon_Manager
	 */
	public $addons;
	
	/**
	 * Module manager instance
	 *
	 * @var WP_ERP_Module_Manager
	 */
	public $modules;

	/**
	 * User Management instance
	 *
	 * @var WP_ERP_User_Management
	 */
	public $user_management;
	
	/**
	 * User Sync instance
	 *
	 * @var WP_ERP_User_Sync
	 */
	public $user_sync;

	/**
	 * API instance
	 *
	 * @var WP_ERP_API
	 */
	public $api;

	/**
	 * Get plugin instance
	 *
	 * @return WP_ERP
	 */
	public static function instance() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
		}
		return self::$instance;
	}
	
	/**
	 * Constructor
	 */
	private function __construct() {
		$this->includes();
		$this->init_hooks();
        $this->api = new WP_ERP_API();
	}
	
	/**
	 * Include required files
	 */
	private function includes() {
		require_once WP_ERP_PLUGIN_DIR . 'includes/class-wp-erp-install.php';
		require_once WP_ERP_PLUGIN_DIR . 'includes/class-wp-erp-database.php';
		require_once WP_ERP_PLUGIN_DIR . 'includes/class-wp-erp-module-manager.php';
		require_once WP_ERP_PLUGIN_DIR . 'includes/class-wp-erp-addon-manager.php';
		require_once WP_ERP_PLUGIN_DIR . 'includes/class-wp-erp-user-management.php';
		require_once WP_ERP_PLUGIN_DIR . 'includes/class-wp-erp-user-sync.php';
		require_once WP_ERP_PLUGIN_DIR . 'includes/class-wp-erp-api.php';
		require_once WP_ERP_PLUGIN_DIR . 'includes/class-wp-erp-admin.php';
		require_once WP_ERP_PLUGIN_DIR . 'includes/functions.php';
		
		// Load modules
		require_once WP_ERP_PLUGIN_DIR . 'modules/crm/class-wp-erp-crm.php';
		require_once WP_ERP_PLUGIN_DIR . 'modules/accounting/class-wp-erp-accounting.php';
		require_once WP_ERP_PLUGIN_DIR . 'modules/hr/class-wp-erp-hr.php';
		require_once WP_ERP_PLUGIN_DIR . 'modules/helpdesk/class-wp-erp-helpdesk.php';
		require_once WP_ERP_PLUGIN_DIR . 'modules/vouchers/class-wp-erp-vouchers.php';
		require_once WP_ERP_PLUGIN_DIR . 'modules/invoices/class-wp-erp-invoices.php';
		require_once WP_ERP_PLUGIN_DIR . 'modules/expenses/class-wp-erp-expenses.php';
		require_once WP_ERP_PLUGIN_DIR . 'modules/food-pass/class-wp-erp-food-pass.php';
		require_once WP_ERP_PLUGIN_DIR . 'modules/donations/class-wp-erp-donations.php';
        // Content Module (Gurukul)
        require_once WP_ERP_PLUGIN_DIR . 'modules/content/class-wp-erp-content.php';
	}
	
	/**
	 * Initialize hooks
	 */
	private function init_hooks() {
		register_activation_hook( WP_ERP_PLUGIN_FILE, array( 'WP_ERP_Install', 'install' ) );
		register_deactivation_hook( WP_ERP_PLUGIN_FILE, array( 'WP_ERP_Install', 'deactivate' ) );
		
		add_action( 'init', array( $this, 'init' ), 0 );
		add_action( 'admin_enqueue_scripts', array( $this, 'admin_scripts' ) );
		add_action( 'rest_api_init', array( $this, 'register_rest_routes' ) );
	}
	
	/**
	 * Initialize plugin
	 */
	public function init() {
		// Load text domain
		load_plugin_textdomain( 'wp-erp', false, dirname( WP_ERP_PLUGIN_BASENAME ) . '/languages' );
		
		// Initialize managers
		$this->modules = new WP_ERP_Module_Manager();
		$this->addons = new WP_ERP_Addon_Manager();
		$this->user_management = new WP_ERP_User_Management();
		$this->user_sync = new WP_ERP_User_Sync();
		
		// Load core modules
		$this->modules->register_module( 'crm', new WP_ERP_CRM() );
		$this->modules->register_module( 'accounting', new WP_ERP_Accounting() );
		$this->modules->register_module( 'hr', new WP_ERP_HR() );
		$this->modules->register_module( 'helpdesk', new WP_ERP_Helpdesk() );
		$this->modules->register_module( 'vouchers', new WP_ERP_Vouchers() );
		$this->modules->register_module( 'invoices', new WP_ERP_Invoices() );
		$this->modules->register_module( 'expenses', new WP_ERP_Expenses() );
		$this->modules->register_module( 'food-pass', new WP_ERP_Food_Pass() );
		$this->modules->register_module( 'donations', new WP_ERP_Donations() );
        $this->modules->register_module( 'content', new WP_ERP_Content() );
        
        // Load Quotes Module
        require_once WP_ERP_PLUGIN_DIR . 'modules/quotes/class-wp-erp-quotes.php';
        $this->modules->register_module( 'quotes', new WP_ERP_Quotes() );

        // Load Updates Module
        require_once WP_ERP_PLUGIN_DIR . 'modules/updates/class-wp-erp-updates.php';
        $this->modules->register_module( 'updates', new WP_ERP_Updates() );
        
        // Load Satsang Module
        require_once WP_ERP_PLUGIN_DIR . 'modules/satsang/class-wp-erp-satsang.php';
        $this->modules->register_module( 'satsang', new WP_ERP_Satsang() );

        // Load Programs Module
        require_once WP_ERP_PLUGIN_DIR . 'modules/programs/class-wp-erp-programs.php';
        $this->modules->register_module( 'programs', new WP_ERP_Programs() );

        // Load Calendar Module
        require_once WP_ERP_PLUGIN_DIR . 'modules/calendar/class-wp-erp-calendar.php';
        $this->modules->register_module( 'calendar', new WP_ERP_Calendar() );
		
		// Load addons
		$this->addons->load_addons();
		
		do_action( 'wp_erp_init' );
	}
	
	/**
	 * Enqueue admin scripts and styles
	 */
	public function admin_scripts( $hook ) {
		// Only load on ERP pages
		if ( strpos( $hook, 'wp-erp' ) === false ) {
			return;
		}
		
		// Enqueue Gutenberg styles
		wp_enqueue_style( 'wp-components' );
		
		// Check if build files exist
		$build_js = WP_ERP_PLUGIN_DIR . 'build/index.js';
		$asset_file = WP_ERP_PLUGIN_DIR . 'build/index.asset.php';
		
		if ( file_exists( $build_js ) && file_exists( $asset_file ) ) {
			// Get dependencies and version from asset file
			$asset = require $asset_file;
			
			// Ensure asset is an array with required keys
			if ( ! is_array( $asset ) || ! isset( $asset['dependencies'] ) || ! isset( $asset['version'] ) ) {
				$asset = array(
					'dependencies' => array( 'wp-element', 'wp-api-fetch', 'wp-components', 'wp-i18n' ),
					'version' => WP_ERP_VERSION,
				);
			}
			
			// Enqueue plugin assets
			wp_enqueue_script(
				'wp-erp-admin',
				WP_ERP_PLUGIN_URL . 'build/index.js',
				$asset['dependencies'],
				$asset['version'],
				true
			);
			
			// Localize script
			$modules_data = array();
			if ( isset( $this->modules ) && is_object( $this->modules ) ) {
				$modules_data = $this->modules->get_registered_modules();
			}
			
			wp_localize_script( 'wp-erp-admin', 'wpErp', array(
				'apiUrl' => rest_url( 'wp-erp/v1/' ),
				'nonce' => wp_create_nonce( 'wp_rest' ),
				'modules' => $modules_data,
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
				<strong><?php esc_html_e( 'WP ERP:', 'wp-erp' ); ?></strong>
				<?php esc_html_e( 'Build files are missing. Please run "npm install" and "npm run build" in the plugin directory.', 'wp-erp' ); ?>
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
 * Main function to get WP ERP instance
 *
 * @return WP_ERP
 */
function WP_ERP() {
	return WP_ERP::instance();
}

// Initialize plugin
WP_ERP();

