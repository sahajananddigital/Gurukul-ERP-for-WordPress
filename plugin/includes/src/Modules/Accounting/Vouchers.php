<?php
/**
 * Vouchers Submodule
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
 * Vouchers module class.
 */
class Vouchers extends AbstractModule {

	/**
	 * Module slug.
	 *
	 * @var string
	 */
	public string $slug = 'vouchers';

	/**
	 * Module display name.
	 *
	 * @var string
	 */
	public string $name = 'Vouchers';
}
