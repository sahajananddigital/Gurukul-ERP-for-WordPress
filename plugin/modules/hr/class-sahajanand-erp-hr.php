<?php
/**
 * HR Module
 *
 * @package Sahajanand_ERP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class SAHAJANAND_ERP_HR {
	
	/**
	 * Module slug
	 *
	 * @var string
	 */
	public $slug = 'hr';
	
	/**
	 * Module name
	 *
	 * @var string
	 */
	public $name = 'HR';
	
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
			__( 'HR', 'sahajanand-erp' ),
			__( 'HR', 'sahajanand-erp' ),
			'erp_manage_hr',
			'sahajanand-erp-hr',
			array( $this, 'render_page' ),
			'dashicons-id',
			32
		);
		

	}
	
	/**
	 * Render HR page
	 */
	public function render_page() {
		?>
		<div id="sahajanand-erp-hr-root"></div>
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

