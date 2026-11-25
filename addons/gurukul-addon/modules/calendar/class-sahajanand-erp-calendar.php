<?php
/**
 * Calendar Module
 *
 * @package Sahajanand_ERP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class SAHAJANAND_ERP_Calendar extends \SahajanandERP\Abstracts\AbstractModule {

	public string $slug = 'calendar';
	public string $name = 'Calendar';

	public function add_admin_menu(): void {
		add_menu_page(
			__( 'Calendar', 'sahajanand-erp' ),
			__( 'Calendar', 'sahajanand-erp' ),
			'manage_options',
			'sahajanand-erp-calendar',
			array( $this, 'render_page' ),
			'dashicons-calendar',
			40
		);
	}

	public function render_page(): void {
		?>
		<div id="sahajanand-erp-calendar-root"></div>
		<?php
	}
}
