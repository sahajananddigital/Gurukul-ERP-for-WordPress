<?php
/**
 * CRM Module
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
 * Modern CRM module class.
 */
class CRM extends AbstractModule {

	/**
	 * Module slug.
	 *
	 * @var string
	 */
	public string $slug = 'crm';

	/**
	 * Module display name.
	 *
	 * @var string
	 */
	public string $name = 'CRM';

	/**
	 * Add admin menu page.
	 *
	 * @return void
	 */
	public function add_admin_menu(): void {
		add_menu_page(
			__( 'CRM', 'sahajanand-erp' ),
			__( 'CRM', 'sahajanand-erp' ),
			'erp_manage_crm',
			'sahajanand-erp-crm',
			array( $this, 'render_page' ),
			'dashicons-groups',
			30
		);
	}
}
