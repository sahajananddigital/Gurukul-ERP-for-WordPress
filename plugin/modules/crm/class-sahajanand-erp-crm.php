<?php
/**
 * CRM Module
 *
 * @package Sahajanand_ERP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class SAHAJANAND_ERP_CRM {
	
	/**
	 * Module slug
	 *
	 * @var string
	 */
	public $slug = 'crm';
	
	/**
	 * Module name
	 *
	 * @var string
	 */
	public $name = 'CRM';
	
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
			__( 'CRM', 'sahajanand-erp' ),
			__( 'CRM', 'sahajanand-erp' ),
			'erp_manage_crm',
			'sahajanand-erp-crm',
			array( $this, 'render_page' ),
			'dashicons-groups',
			30
		);
		

	}
	
	/**
	 * Render CRM page
	 */
	public function render_page() {
		?>
		<div id="sahajanand-erp-crm-root"></div>
		<!-- CRM Root -->
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

