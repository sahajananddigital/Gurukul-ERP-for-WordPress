<?php
/**
 * Invoices Module
 *
 * @package WP_ERP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WP_ERP_Invoices {
	
	/**
	 * Module slug
	 *
	 * @var string
	 */
	public $slug = 'invoices';
	
	/**
	 * Module name
	 *
	 * @var string
	 */
	public $name = 'Invoices';
	
	/**
	 * Constructor
	 */
	public function __construct() {
		$this->init();
	}
	
	/**
	 * Initialize module
	 */
	private function init() {
		// add_action( 'admin_menu', array( , 'add_admin_menu' ) );
	}
	
	/**
	 * Add admin menu
	 */
	public function add_admin_menu() {
		add_submenu_page(
			'wp-erp-accounting',
			__( 'Invoices', 'wp-erp' ),
			__( 'Invoices', 'wp-erp' ),
			'erp_manage_invoices',
			'wp-erp-invoices',
			array( $this, 'render_page' )
		);
		

	}
	
	/**
	 * Render Invoices page
	 */
	public function render_page() {
		?>
		<div id="wp-erp-invoices-root"></div>
		<?php
	}
	

	
	/**
	 * Check if module is active
	 *
	 * @return bool
	 */
	public function is_active() {
		return true;
	}
}

