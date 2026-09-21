<?php
/**
 * Module Manager
 *
 * @package Sahajanand_ERP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class SAHAJANAND_ERP_Module_Manager {
	
	/**
	 * Registered modules
	 *
	 * @var array
	 */
	private $modules = array();
	
	/**
	 * Register a module
	 *
	 * @param string $slug Module slug
	 * @param object $module Module instance
	 */
	public function register_module( $slug, $module ) {
		$this->modules[ $slug ] = $module;
	}
	
	/**
	 * Get registered modules
	 *
	 * @return array
	 */
	public function get_registered_modules() {
		return $this->modules;
	}
	
	/**
	 * Get a specific module
	 *
	 * @param string $slug Module slug
	 * @return object|null
	 */
	public function get_module( $slug ) {
		return isset( $this->modules[ $slug ] ) ? $this->modules[ $slug ] : null;
	}
	
	/**
	 * Check if module is active
	 *
	 * @param string $slug Module slug
	 * @return bool
	 */
	public function is_module_active( $slug ) {
		$module = $this->get_module( $slug );
		return $module && method_exists( $module, 'is_active' ) ? $module->is_active() : true;
	}
}

