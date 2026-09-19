<?php
/**
 * Helpdesk Module
 *
 * @package WP_ERP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WP_ERP_Helpdesk {
	
	/**
	 * Module slug
	 *
	 * @var string
	 */
	public $slug = 'helpdesk';
	
	/**
	 * Module name
	 *
	 * @var string
	 */
	public $name = 'Helpdesk';
	
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
			__( 'Helpdesk', 'wp-erp' ),
			__( 'Helpdesk', 'wp-erp' ),
			'erp_manage_helpdesk',
			'wp-erp-helpdesk',
			array( $this, 'render_page' ),
			'dashicons-tickets-alt',
			33
		);
		

	}
	
	/**
	 * Render Helpdesk page
	 */
	public function render_page() {
		?>
		<div id="wp-erp-helpdesk-root"></div>
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

