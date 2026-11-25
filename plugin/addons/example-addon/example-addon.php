<?php
/**
 * Plugin Name: Sahajanand ERP Addon - Example Addon
 * Description: Example addon demonstrating how to extend Sahajanand ERP with modern PSR-4 architecture
 * Version: 2.0.0
 * Author: Sahajanand Digital
 * Requires Sahajanand ERP: 2.0.0
 *
 * @package SahajanandERP\Addons
 */

declare(strict_types=1);

namespace SahajanandERP\Addons;

use SahajanandERP\Abstracts\AbstractModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Example Addon Class demonstrating modern module extension.
 */
class ExampleAddon extends AbstractModule {

	/**
	 * Module slug.
	 *
	 * @var string
	 */
	public string $slug = 'example-addon';

	/**
	 * Module display name.
	 *
	 * @var string
	 */
	public string $name = 'Example Addon';

	/**
	 * Initialize addon hooks and listeners.
	 *
	 * @return void
	 */
	public function init(): void {
		add_action( 'sahajanand_erp_init', array( $this, 'on_erp_init' ) );
		add_action( 'admin_menu', array( $this, 'add_admin_menu' ) );
	}

	/**
	 * ERP initialization handler.
	 *
	 * @return void
	 */
	public function on_erp_init(): void {
		if ( function_exists( 'Sahajanand_ERP' ) ) {
			Sahajanand_ERP()->modules->register_module( $this->slug, $this );
		}

		do_action( 'sahajanand_erp_example_addon_init' );
	}

	/**
	 * Register admin menu.
	 *
	 * @return void
	 */
	public function add_admin_menu(): void {
		add_submenu_page(
			'sahajanand-erp-crm',
			__( 'Example Addon', 'sahajanand-erp' ),
			__( 'Example Addon', 'sahajanand-erp' ),
			'manage_options',
			'sahajanand-erp-example-addon',
			array( $this, 'render_page' )
		);
	}

	/**
	 * Render addon page.
	 *
	 * @return void
	 */
	public function render_page(): void {
		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'Example Addon', 'sahajanand-erp' ); ?></h1>
			<p><?php esc_html_e( 'This is a modernized example addon for Sahajanand ERP built with PSR-4 conventions.', 'sahajanand-erp' ); ?></p>
		</div>
		<?php
	}
}

// Initialize addon
new ExampleAddon();
