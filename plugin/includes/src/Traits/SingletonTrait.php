<?php
/**
 * Singleton Trait
 *
 * @package SahajanandERP\Traits
 */

declare(strict_types=1);

namespace SahajanandERP\Traits;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Trait providing modern singleton pattern.
 */
trait SingletonTrait {

	/**
	 * Single instance of the class.
	 *
	 * @var static|null
	 */
	protected static ?self $instance = null;

	/**
	 * Get class instance.
	 *
	 * @return static
	 */
	public static function instance(): static {
		if ( null === static::$instance ) {
			static::$instance = new static();
		}
		return static::$instance;
	}

	/**
	 * Get class instance (alias).
	 *
	 * @return static
	 */
	public static function get_instance(): static {
		return static::instance();
	}

	/**
	 * Protected constructor to prevent direct creation.
	 */
	protected function __construct() {
		$this->init();
	}

	/**
	 * Optional initializer hook for classes using this trait.
	 */
	protected function init(): void {}

	/**
	 * Prevent cloning.
	 */
	protected function __clone() {}

	/**
	 * Prevent unserializing.
	 *
	 * @throws \Exception When attempting to unserialize singleton.
	 */
	public function __wakeup() {
		throw new \Exception( 'Cannot unserialize singleton instance.' );
	}
}
