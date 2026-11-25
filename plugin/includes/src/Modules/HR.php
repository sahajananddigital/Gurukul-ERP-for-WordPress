<?php
/**
 * HR Module
 *
 * @package SahajanandERP\Modules
 */

declare(strict_types=1);

namespace SahajanandERP\Modules;

use SahajanandERP\Abstracts\AbstractModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Modern HR module class.
 */
class HR extends AbstractModule {

	/**
	 * Module slug.
	 *
	 * @var string
	 */
	public string $slug = 'hr';

	/**
	 * Module display name.
	 *
	 * @var string
	 */
	public string $name = 'HR';

	/**
	 * Add admin menu page.
	 *
	 * @return void
	 */
	public function add_admin_menu(): void {
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
}
