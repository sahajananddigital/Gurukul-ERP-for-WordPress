<?php
/**
 * Programs Module
 *
 * @package Sahajanand_ERP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class SAHAJANAND_ERP_Programs extends \SahajanandERP\Abstracts\AbstractModule {

	public string $slug = 'programs';
	public string $name = 'Daily Programs';

	public function init(): void {
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_scripts' ) );
	}

	public function add_admin_menu(): void {
		add_menu_page(
			__( 'Daily Programs', 'sahajanand-erp' ),
			__( 'Daily Programs', 'sahajanand-erp' ),
			'manage_options',
			'sahajanand-erp-programs',
			array( $this, 'render_page' ),
			'dashicons-calendar-alt',
			39
		);
	}

	public function render_page(): void {
		?>
		<div id="sahajanand-erp-programs-root"></div>
		<?php
	}

	public function enqueue_scripts( $hook ) {
		if ( 'toplevel_page_sahajanand-erp-programs' === $hook ) {
			wp_enqueue_media();
		}
	}
}
