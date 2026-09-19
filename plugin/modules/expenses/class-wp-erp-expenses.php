<?php
/**
 * Expenses Module
 *
 * @package WP_ERP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WP_ERP_Expenses {
	
	/**
	 * Module slug
	 *
	 * @var string
	 */
	public $slug = 'expenses';
	
	/**
	 * Module name
	 *
	 * @var string
	 */
	public $name = 'Expenses';
	
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
			__( 'Expenses', 'wp-erp' ),
			__( 'Expenses', 'wp-erp' ),
			'erp_manage_expenses',
			'wp-erp-expenses',
			array( $this, 'render_page' )
		);
		

	}
	
	/**
	 * Render Expenses page
	 */
	public function render_page() {
		?>
		<div id="wp-erp-expenses-root"></div>
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

