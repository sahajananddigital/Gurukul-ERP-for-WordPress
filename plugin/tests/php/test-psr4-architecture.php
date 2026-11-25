<?php
/**
 * Test PSR-4 Autoloading and Architecture
 *
 * Verifies PSR-4 loading, traits, interfaces, inheritance, and legacy compatibility.
 *
 * @package SahajanandERP\Tests
 */

// Define mock WP constants and functions if running outside WordPress.
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/../../' );
}
if ( ! defined( 'SAHAJANAND_ERP_PLUGIN_DIR' ) ) {
	define( 'SAHAJANAND_ERP_PLUGIN_DIR', dirname( __DIR__, 2 ) . '/' );
}
if ( ! function_exists( 'current_user_can' ) ) {
	function current_user_can( $cap ) {
		return 'manage_options' === $cap;
	}
}
if ( ! function_exists( 'is_user_logged_in' ) ) {
	function is_user_logged_in() {
		return true;
	}
}
if ( ! function_exists( 'add_menu_page' ) ) {
	function add_menu_page( ...$args ) {}
}
if ( ! function_exists( 'add_action' ) ) {
	function add_action( ...$args ) {}
}
if ( ! function_exists( 'add_filter' ) ) {
	function add_filter( ...$args ) {}
}
if ( ! function_exists( '__' ) ) {
	function __( $text, $domain = 'default' ) {
		return $text;
	}
}

// 1. Require Composer Autoloader
$composer_autoload = dirname( __DIR__, 2 ) . '/vendor/autoload.php';
if ( file_exists( $composer_autoload ) ) {
	require_once $composer_autoload;
}

// Helper assertion function
function erp_assert( $condition, $message ) {
	if ( ! $condition ) {
		echo "FAIL: $message\n";
		exit( 1 );
	}
	echo "PASS: $message\n";
}

echo "=== Testing PSR-4 Autoloading & Modern Architecture ===\n";

// Test 1: Interface existences and autoloading
erp_assert( interface_exists( \SahajanandERP\Interfaces\ModuleInterface::class ), 'ModuleInterface autoloaded' );
erp_assert( interface_exists( \SahajanandERP\Interfaces\ControllerInterface::class ), 'ControllerInterface autoloaded' );
erp_assert( interface_exists( \SahajanandERP\Interfaces\SchemaInterface::class ), 'SchemaInterface autoloaded' );

// Test 2: Trait existences and autoloading
erp_assert( trait_exists( \SahajanandERP\Traits\SingletonTrait::class ), 'SingletonTrait autoloaded' );
erp_assert( trait_exists( \SahajanandERP\Traits\PermissionTrait::class ), 'PermissionTrait autoloaded' );

// Test 3: Abstract classes autoloading and contracts
erp_assert( class_exists( \SahajanandERP\Abstracts\AbstractModule::class ), 'AbstractModule autoloaded' );
erp_assert( class_exists( \SahajanandERP\Abstracts\AbstractController::class ), 'AbstractController autoloaded' );

// Test 4: Concrete modules autoloading and inheritance
$crm = new \SahajanandERP\Modules\CRM();
erp_assert( $crm instanceof \SahajanandERP\Interfaces\ModuleInterface, 'CRM implements ModuleInterface' );
erp_assert( $crm instanceof \SahajanandERP\Abstracts\AbstractModule, 'CRM extends AbstractModule' );
erp_assert( 'crm' === $crm->get_slug(), 'CRM slug is crm' );
erp_assert( 'CRM' === $crm->get_name(), 'CRM name is CRM' );

$accounting = new \SahajanandERP\Modules\Accounting();
erp_assert( $accounting instanceof \SahajanandERP\Interfaces\ModuleInterface, 'Accounting implements ModuleInterface' );
erp_assert( $accounting->invoices instanceof \SahajanandERP\Modules\Accounting\Invoices, 'Accounting has Invoices submodule' );
erp_assert( $accounting->expenses instanceof \SahajanandERP\Modules\Accounting\Expenses, 'Accounting has Expenses submodule' );
erp_assert( $accounting->vouchers instanceof \SahajanandERP\Modules\Accounting\Vouchers, 'Accounting has Vouchers submodule' );

$hr = new \SahajanandERP\Modules\HR();
erp_assert( $hr instanceof \SahajanandERP\Interfaces\ModuleInterface, 'HR implements ModuleInterface' );
erp_assert( 'hr' === $hr->get_slug(), 'HR slug is hr' );

$helpdesk = new \SahajanandERP\Modules\Helpdesk();
erp_assert( $helpdesk instanceof \SahajanandERP\Interfaces\ModuleInterface, 'Helpdesk implements ModuleInterface' );
erp_assert( 'helpdesk' === $helpdesk->get_slug(), 'Helpdesk slug is helpdesk' );

// Test 5: Module Manager
$manager = new \SahajanandERP\Managers\ModuleManager();
$manager->register_module( 'crm', $crm );
$manager->register_module( 'accounting', $accounting );
erp_assert( $manager->get_module( 'crm' ) === $crm, 'ModuleManager retrieves registered crm' );
erp_assert( $manager->get_module( 'invoices' ) === $accounting->invoices, 'ModuleManager retrieves submodules' );
erp_assert( $manager->is_module_active( 'crm' ), 'ModuleManager checks active status' );

// Test 6: Database schema manager
erp_assert( class_exists( \SahajanandERP\Database\Database::class ), 'Database manager autoloaded' );
erp_assert( is_subclass_of( \SahajanandERP\Database\Database::class, \SahajanandERP\Interfaces\SchemaInterface::class ), 'Database implements SchemaInterface' );

// Test 7: SingletonTrait implementation
class TestSingleton {
	use \SahajanandERP\Traits\SingletonTrait;
	public string $state = 'default';
}
$s1 = TestSingleton::instance();
$s1->state = 'modified';
$s2 = TestSingleton::instance();
erp_assert( $s1 === $s2 && 'modified' === $s2->state, 'SingletonTrait provides true single instance' );

// Test 8: PermissionTrait implementation
class TestController extends \SahajanandERP\Abstracts\AbstractController {
	public function register_routes() {}
}
$ctrl = new TestController();
erp_assert( $ctrl instanceof \SahajanandERP\Interfaces\ControllerInterface, 'TestController implements ControllerInterface' );
erp_assert( true === $ctrl->check_permission(), 'PermissionTrait check_permission succeeds' );
erp_assert( true === $ctrl->check_cap( 'manage_options' ), 'PermissionTrait check_cap succeeds' );

// Test 9: Modern API Controllers autoloading
$api_classes = array(
	\SahajanandERP\API\Accounting::class,
	\SahajanandERP\API\Auth::class,
	\SahajanandERP\API\CRM::class,
	\SahajanandERP\API\Deals::class,
	\SahajanandERP\API\Financials::class,
	\SahajanandERP\API\General::class,
	\SahajanandERP\API\Helpdesk::class,
	\SahajanandERP\API\HR::class,
	\SahajanandERP\API\Leads::class,
	\SahajanandERP\API\Organizations::class,
	\SahajanandERP\API\Settings::class,
	\SahajanandERP\API\UserAccess::class,
	\SahajanandERP\API\Data::class,
	\SahajanandERP\API\Server::class,
);

foreach ( $api_classes as $class ) {
	erp_assert( class_exists( $class ), "API class $class is autoloaded" );
}

$server = new \SahajanandERP\API\Server();
erp_assert( $server instanceof \SahajanandERP\API\Server, 'Server instantiated cleanly' );

// Test 10: Modern Database, Helpdesk, Manager, and Admin classes
$modern_classes = array(
	\SahajanandERP\Install::class,
	\SahajanandERP\Managers\AddonManager::class,
	\SahajanandERP\Managers\UserManagement::class,
	\SahajanandERP\Managers\UserSync::class,
	\SahajanandERP\Admin\Admin::class,
	\SahajanandERP\Admin\SPA::class,
	\SahajanandERP\Admin\Summary::class,
	\SahajanandERP\Admin\DashboardWidget::class,
	\SahajanandERP\Helpdesk\MailHTML::class,
	\SahajanandERP\Helpdesk\MailSender::class,
	\SahajanandERP\Helpdesk\MailFetcher::class,
	\SahajanandERP\Database\CRM::class,
	\SahajanandERP\Database\Accounting::class,
	\SahajanandERP\Database\Invoices::class,
	\SahajanandERP\Database\Expenses::class,
	\SahajanandERP\Database\Vouchers::class,
	\SahajanandERP\Database\HR::class,
	\SahajanandERP\Database\Helpdesk::class,
	\SahajanandERP\Database\General::class,
);

foreach ( $modern_classes as $class ) {
	erp_assert( class_exists( $class ), "Modern class $class is autoloaded" );
}

// Test 11: Confirm strict modern PSR-4 architecture (no legacy aliases registered)
erp_assert( ! class_exists( 'SAHAJANAND_ERP_API_Controller', false ), 'Legacy alias SAHAJANAND_ERP_API_Controller is absent' );
erp_assert( ! class_exists( 'SAHAJANAND_ERP_CRM', false ), 'Legacy alias SAHAJANAND_ERP_CRM is absent' );
erp_assert( ! class_exists( 'SAHAJANAND_ERP_Accounting', false ), 'Legacy alias SAHAJANAND_ERP_Accounting is absent' );
erp_assert( ! class_exists( 'SAHAJANAND_ERP_Install', false ), 'Legacy alias SAHAJANAND_ERP_Install is absent' );
erp_assert( ! class_exists( 'SAHAJANAND_ERP_Database', false ), 'Legacy alias SAHAJANAND_ERP_Database is absent' );

echo "=== All PSR-4 Architecture Tests Passed! ===\n";
