<?php
/**
 * Accounting Module
 *
 * Unified Accounting module encompassing chart of accounts, transactions,
 * invoices, expenses, and vouchers.
 *
 * @package SahajanandERP\Modules
 */

declare(strict_types=1);

namespace SahajanandERP\Modules;

use SahajanandERP\Abstracts\AbstractModule;
use SahajanandERP\Modules\Accounting\Invoices;
use SahajanandERP\Modules\Accounting\Expenses;
use SahajanandERP\Modules\Accounting\Vouchers;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Modern Accounting module class.
 */
class Accounting extends AbstractModule {

	/**
	 * Module slug.
	 *
	 * @var string
	 */
	public string $slug = 'accounting';

	/**
	 * Module display name.
	 *
	 * @var string
	 */
	public string $name = 'Accounting';

	/**
	 * Invoices submodule.
	 *
	 * @var Invoices|null
	 */
	public ?Invoices $invoices = null;

	/**
	 * Expenses submodule.
	 *
	 * @var Expenses|null
	 */
	public ?Expenses $expenses = null;

	/**
	 * Vouchers submodule.
	 *
	 * @var Vouchers|null
	 */
	public ?Vouchers $vouchers = null;

	/**
	 * Initialize module and sub-modules.
	 *
	 * @return void
	 */
	public function init(): void {
		$this->invoices = new Invoices();
		$this->expenses = new Expenses();
		$this->vouchers = new Vouchers();
	}

	/**
	 * Add admin menu page.
	 *
	 * @return void
	 */
	public function add_admin_menu(): void {
		add_menu_page(
			__( 'Accounting', 'sahajanand-erp' ),
			__( 'Accounting', 'sahajanand-erp' ),
			'erp_manage_accounting',
			'sahajanand-erp-accounting',
			array( $this, 'render_page' ),
			'dashicons-chart-pie',
			31
		);
	}
}
