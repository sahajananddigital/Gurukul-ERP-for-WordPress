<?php
/**
 * Quotes Module
 *
 * @package Sahajanand_ERP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class SAHAJANAND_ERP_Quotes extends \SahajanandERP\Abstracts\AbstractModule {

	public string $slug = 'quotes';
	public string $name = 'Daily Quotes';

	public function init(): void {
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_scripts' ) );
	}

	public function add_admin_menu(): void {
		add_menu_page(
			__( 'Daily Quotes', 'sahajanand-erp' ),
			__( 'Daily Quotes', 'sahajanand-erp' ),
			'manage_options',
			'sahajanand-erp-quotes',
			array( $this, 'render_page' ),
			'dashicons-format-quote',
			36
		);
	}

	public function render_page(): void {
		?>
		<div id="sahajanand-erp-quotes-root"></div>
		<?php
	}

	public function enqueue_scripts( $hook ) {
		if ( 'toplevel_page_sahajanand-erp-quotes' === $hook ) {
			wp_enqueue_media();
		}
	}
}
