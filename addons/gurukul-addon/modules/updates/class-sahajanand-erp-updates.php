<?php
/**
 * Updates Module
 *
 * @package Sahajanand_ERP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class SAHAJANAND_ERP_Updates extends \SahajanandERP\Abstracts\AbstractModule {

	public string $slug = 'updates';
	public string $name = 'Daily Updates';

	public function init(): void {
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_scripts' ) );
	}

	public function add_admin_menu(): void {
		add_menu_page(
			__( 'Daily Updates', 'sahajanand-erp' ),
			__( 'Daily Updates', 'sahajanand-erp' ),
			'manage_options',
			'sahajanand-erp-updates',
			array( $this, 'render_page' ),
			'dashicons-megaphone',
			37
		);
	}

	public function render_page(): void {
		?>
		<div id="sahajanand-erp-updates-root"></div>
		<?php
	}

	public function enqueue_scripts( $hook ) {
		if ( 'toplevel_page_sahajanand-erp-updates' === $hook ) {
			wp_enqueue_media();
		}
	}
}
