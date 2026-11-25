<?php
/**
 * Satsang Module
 *
 * @package Sahajanand_ERP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class SAHAJANAND_ERP_Satsang extends \SahajanandERP\Abstracts\AbstractModule {

	public string $slug = 'satsang';
	public string $name = 'Daily Satsang';

	public function add_admin_menu(): void {
		add_menu_page(
			__( 'Daily Satsang', 'sahajanand-erp' ),
			__( 'Daily Satsang', 'sahajanand-erp' ),
			'manage_options',
			'sahajanand-erp-satsang',
			array( $this, 'render_page' ),
			'dashicons-video-alt3',
			38
		);
	}

	public function render_page(): void {
		?>
		<div id="sahajanand-erp-satsang-root"></div>
		<?php
	}
}
