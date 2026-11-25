<?php
/**
 * Food Pass Module
 *
 * @package Sahajanand_ERP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class SAHAJANAND_ERP_Food_Pass extends \SahajanandERP\Abstracts\AbstractModule {
	
	/**
	 * Module slug
	 *
	 * @var string
	 */
	public string $slug = 'food-pass';
	
	/**
	 * Module name
	 *
	 * @var string
	 */
	public string $name = 'Food Pass';
	
	/**
	 * Initialize module
	 */
	public function init(): void {
		// Module initialization hooks.
	}
	
	/**
	 * Add admin menu
	 */
	public function add_admin_menu(): void {
		add_menu_page(
			__( 'Food Pass', 'sahajanand-erp' ),
			__( 'Food Pass', 'sahajanand-erp' ),
			'erp_manage_food_pass',
			'sahajanand-erp-food-pass',
			array( $this, 'render_page' ),
			'dashicons-food',
			37
		);
	}
	
	/**
	 * Render Food Pass page
	 */
	public function render_page(): void {
		?>
		<div id="sahajanand-erp-food-pass-root"></div>
		<?php
	}

	/**
	 * Check if module is active
	 *
	 * @return bool
	 */
	public function is_active(): bool {
		return true;
	}
}
