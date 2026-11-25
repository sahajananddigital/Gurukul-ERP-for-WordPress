<?php
/**
 * Invoices Submodule
 *
 * @package SahajanandERP\Modules\Accounting
 */

declare(strict_types=1);

namespace SahajanandERP\Modules\Accounting;

use SahajanandERP\Abstracts\AbstractModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Invoices module class.
 */
class Invoices extends AbstractModule {

	/**
	 * Module slug.
	 *
	 * @var string
	 */
	public string $slug = 'invoices';

	/**
	 * Module display name.
	 *
	 * @var string
	 */
	public string $name = 'Invoices';
}
