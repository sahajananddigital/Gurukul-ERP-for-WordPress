<?php
/**
 * Expenses Submodule
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
 * Expenses module class.
 */
class Expenses extends AbstractModule {

	/**
	 * Module slug.
	 *
	 * @var string
	 */
	public string $slug = 'expenses';

	/**
	 * Module display name.
	 *
	 * @var string
	 */
	public string $name = 'Expenses';
}
