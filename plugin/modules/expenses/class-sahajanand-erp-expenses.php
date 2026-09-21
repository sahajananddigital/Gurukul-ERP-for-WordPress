<?php
/**
 * Expenses Module
 *
 * @package Sahajanand_ERP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class SAHAJANAND_ERP_Expenses {
	
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
			'sahajanand-erp-accounting',
			__( 'Expenses', 'sahajanand-erp' ),
			__( 'Expenses', 'sahajanand-erp' ),
			'erp_manage_expenses',
			'sahajanand-erp-expenses',
			array( $this, 'render_page' )
		);
		

	}
	
	/**
	 * Render Expenses page
	 */
	public function render_page() {
		?>
		<div id="sahajanand-erp-expenses-root"></div>
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

