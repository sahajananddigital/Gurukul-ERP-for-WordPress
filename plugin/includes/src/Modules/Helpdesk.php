<?php
/**
 * Helpdesk Module
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
 * Modern Helpdesk module class.
 */
class Helpdesk extends AbstractModule {

	/**
	 * Module slug.
	 *
	 * @var string
	 */
	public string $slug = 'helpdesk';

	/**
	 * Module display name.
	 *
	 * @var string
	 */
	public string $name = 'Helpdesk';

	/**
	 * Add admin menu page.
	 *
	 * @return void
	 */
	public function add_admin_menu(): void {
		add_menu_page(
			__( 'Helpdesk', 'sahajanand-erp' ),
			__( 'Helpdesk', 'sahajanand-erp' ),
			'erp_manage_helpdesk',
			'sahajanand-erp-helpdesk',
			array( $this, 'render_page' ),
			'dashicons-tickets-alt',
			33
		);
	}
}
