<?php
/**
 * Food Pass Module
 *
 * @package WP_ERP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WP_ERP_Food_Pass {
	
	/**
	 * Module slug
	 *
	 * @var string
	 */
	public $slug = 'food-pass';
	
	/**
	 * Module name
	 *
	 * @var string
	 */
	public $name = 'Food Pass';
	
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
			__( 'Food Pass', 'wp-erp' ),
			__( 'Food Pass', 'wp-erp' ),
			'erp_manage_food_pass',
			'wp-erp-food-pass',
			array( $this, 'render_page' ),
			'dashicons-food',
			37
		);
		

	}
	
	/**
	 * Render Food Pass page
	 */
	public function render_page() {
		?>
		<div id="wp-erp-food-pass-root"></div>
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

