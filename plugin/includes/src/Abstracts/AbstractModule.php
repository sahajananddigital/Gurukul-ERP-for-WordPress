<?php
/**
 * Abstract Base Module
 *
 * @package SahajanandERP\Abstracts
 */

declare(strict_types=1);

namespace SahajanandERP\Abstracts;

use SahajanandERP\Interfaces\ModuleInterface;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Abstract class providing foundation for all ERP modules.
 */
abstract class AbstractModule implements ModuleInterface {

	/**
	 * Module slug.
	 *
	 * @var string
	 */
	public string $slug = '';

	/**
	 * Module display name.
	 *
	 * @var string
	 */
	public string $name = '';

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->init();
	}

	/**
	 * Get module slug.
	 *
	 * @return string
	 */
	public function get_slug(): string {
		return $this->slug;
	}

	/**
	 * Get module display name.
	 *
	 * @return string
	 */
	public function get_name(): string {
		return $this->name;
	}

	/**
	 * Initialize module hooks and dependencies.
	 *
	 * @return void
	 */
	public function init(): void {
		// Subclasses override as needed.
	}

	/**
	 * Register admin menu for the module.
	 *
	 * @return void
	 */
	public function add_admin_menu(): void {
		// Subclasses override as needed.
	}

	/**
	 * Default render page wrapper for SPA routing.
	 *
	 * @return void
	 */
	public function render_page(): void {
		?>
		<div id="sahajanand-erp-root"></div>
		<?php
	}
}
