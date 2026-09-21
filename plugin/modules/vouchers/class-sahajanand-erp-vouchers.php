<?php
/**
 * Vouchers Module
 *
 * @package Sahajanand_ERP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class SAHAJANAND_ERP_Vouchers {
	
	/**
	 * Module slug
	 *
	 * @var string
	 */
	public $slug = 'vouchers';
	
	/**
	 * Module name
	 *
	 * @var string
	 */
	public $name = 'Vouchers';
	
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
			__( 'Vouchers', 'sahajanand-erp' ),
			__( 'Vouchers', 'sahajanand-erp' ),
			'erp_manage_vouchers',
			'sahajanand-erp-vouchers',
			array( $this, 'render_page' )
		);
		

	}
	
	/**
	 * Render Vouchers page
	 */
	public function render_page() {
		?>
		<div id="sahajanand-erp-vouchers-root"></div>
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

