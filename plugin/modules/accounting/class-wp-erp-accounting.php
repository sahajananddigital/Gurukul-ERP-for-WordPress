<?php
/**
 * Accounting Module
 *
 * @package WP_ERP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WP_ERP_Accounting {
	
	/**
	 * Module slug
	 *
	 * @var string
	 */
	public $slug = 'accounting';
	
	/**
	 * Module name
	 *
	 * @var string
	 */
	public $name = 'Accounting';
	
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
		add_menu_page(
			__( 'Accounting', 'wp-erp' ),
			__( 'Accounting', 'wp-erp' ),
			'erp_manage_accounting',
			'wp-erp-accounting',
			array( $this, 'render_page' ),
			'dashicons-chart-line',
			31
		);
		

	}
	
	/**
	 * Render Accounting page
	 */
	public function render_page() {
		?>
		<div id="wp-erp-accounting-root"></div>
		<!-- Accounting Root -->
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

