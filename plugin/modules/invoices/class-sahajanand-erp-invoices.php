<?php
/**
 * Invoices Module
 *
 * @package Sahajanand_ERP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class SAHAJANAND_ERP_Invoices {
	
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
			'sahajanand-erp-accounting',
			__( 'Invoices', 'sahajanand-erp' ),
			__( 'Invoices', 'sahajanand-erp' ),
			'erp_manage_invoices',
			'sahajanand-erp-invoices',
			array( $this, 'render_page' )
		);
		

	}
	
	/**
	 * Render Invoices page
	 */
	public function render_page() {
		?>
		<div id="sahajanand-erp-invoices-root"></div>
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

