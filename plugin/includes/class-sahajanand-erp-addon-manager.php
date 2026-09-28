<?php
/**
 * Addon Manager
 *
 * @package Sahajanand_ERP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class SAHAJANAND_ERP_Addon_Manager {
	
	/**
	 * Loaded addons
	 *
	 * @var array
	 */
	private $addons = array();
	
	/**
	 * Addon directory
	 *
	 * @var string
	 */
	private $addon_dir;
	
	/**
	 * Constructor
	 */
	public function __construct() {
		$this->addon_dir = WP_CONTENT_DIR . '/sahajanand-erp-addons';
	}
	
	/**
	 * Load all active addons
	 */
	public function load_addons() {
		global $wpdb;
		
		$table_name = $wpdb->prefix . 'erp_addons';
		
		// Check if table exists
		if ( $wpdb->get_var( "SHOW TABLES LIKE '$table_name'" ) != $table_name ) {
			return;
		}
		
		// Get active addons from database
		$active_addons = $wpdb->get_results(
			"SELECT addon_key FROM $table_name WHERE active = 1"
		);
		
		foreach ( $active_addons as $addon ) {
			$this->load_addon( $addon->addon_key );
		}
		
		// Also scan addon directory for installed addons
		if ( is_dir( $this->addon_dir ) ) {
			$addon_folders = glob( $this->addon_dir . '/*', GLOB_ONLYDIR );
			
			foreach ( $addon_folders as $addon_folder ) {
				$addon_key = basename( $addon_folder );
				$addon_file = $addon_folder . '/' . $addon_key . '.php';
				
				if ( file_exists( $addon_file ) && ! isset( $this->addons[ $addon_key ] ) ) {
					$this->load_addon( $addon_key, $addon_file );
				}
			}
		}
	}
	
	/**
	 * Load a specific addon
	 *
	 * @param string $addon_key Addon key
	 * @param string $addon_file Addon file path
	 */
	private function load_addon( $addon_key, $addon_file = null ) {
		if ( ! $addon_file ) {
			$addon_file = $this->addon_dir . '/' . $addon_key . '/' . $addon_key . '.php';
		}
		
		if ( file_exists( $addon_file ) ) {
			require_once $addon_file;
			
			// Check if addon class exists
			$class_name = 'SAHAJANAND_ERP_Addon_' . str_replace( '-', '_', ucwords( $addon_key, '-' ) );
			
			if ( class_exists( $class_name ) ) {
				$this->addons[ $addon_key ] = new $class_name();
			}
		}
	}
	
	/**
	 * Get loaded addons
	 *
	 * @return array
	 */
	public function get_addons() {
		return $this->addons;
	}
	
	/**
	 * Install an addon
	 *
	 * @param string $addon_key Addon key
	 * @param array $addon_data Addon data
	 */
	public function install_addon( $addon_key, $addon_data ) {
		global $wpdb;
		
		$table_name = $wpdb->prefix . 'erp_addons';
		
		$wpdb->insert(
			$table_name,
			array(
				'addon_key' => $addon_key,
				'name' => $addon_data['name'],
				'version' => $addon_data['version'],
				'active' => 0,
			),
			array( '%s', '%s', '%s', '%d' )
		);
	}
	
	/**
	 * Get the addons installed in the addons directory with their status.
	 *
	 * @return array
	 */
	public function get_installed_addons() {
		global $wpdb;

		$table_name = $wpdb->prefix . 'erp_addons';
		$active     = array();

		$rows = $wpdb->get_results( "SELECT addon_key, active FROM $table_name" );
		foreach ( (array) $rows as $row ) {
			$active[ $row->addon_key ] = (int) $row->active;
		}

		$addons = array();
		if ( ! is_dir( $this->addon_dir ) ) {
			return $addons;
		}

		foreach ( glob( $this->addon_dir . '/*', GLOB_ONLYDIR ) as $addon_folder ) {
			$addon_key  = basename( $addon_folder );
			$addon_file = $addon_folder . '/' . $addon_key . '.php';

			if ( ! file_exists( $addon_file ) ) {
				continue;
			}

			$headers = $this->get_addon_headers( $addon_file );

			$addons[] = array(
				'key'         => $addon_key,
				'name'        => ! empty( $headers['name'] ) ? $headers['name'] : $addon_key,
				'version'     => isset( $headers['version'] ) ? $headers['version'] : '',
				'description' => isset( $headers['description'] ) ? $headers['description'] : '',
				'author'      => isset( $headers['author'] ) ? $headers['author'] : '',
				'active'      => isset( $active[ $addon_key ] ) ? $active[ $addon_key ] : 0,
			);
		}

		return $addons;
	}

	/**
	 * Read the addon file headers.
	 *
	 * @param string $addon_file Addon main file.
	 * @return array
	 */
	private function get_addon_headers( $addon_file ) {
		return get_file_data(
			$addon_file,
			array(
				'name'        => 'Addon Name',
				'version'     => 'Version',
				'description' => 'Description',
				'author'      => 'Author',
			)
		);
	}

	/**
	 * Activate an addon
	 *
	 * @param string $addon_key Addon key
	 */
	public function activate_addon( $addon_key ) {
		$this->set_addon_active( $addon_key, true );

		// Reload addon
		$this->load_addon( $addon_key );
	}

	/**
	 * Deactivate an addon
	 *
	 * @param string $addon_key Addon key
	 */
	public function deactivate_addon( $addon_key ) {
		$this->set_addon_active( $addon_key, false );

		unset( $this->addons[ $addon_key ] );
	}

	/**
	 * Persist an addon's active state, creating the record when it is missing.
	 *
	 * @param string $addon_key Addon key
	 * @param bool   $active    Whether the addon should be active
	 */
	private function set_addon_active( $addon_key, $active ) {
		global $wpdb;

		$table_name = $wpdb->prefix . 'erp_addons';
		$value      = $active ? 1 : 0;

		$exists = $wpdb->get_var( $wpdb->prepare( "SELECT id FROM $table_name WHERE addon_key = %s", $addon_key ) );
		if ( $exists ) {
			$wpdb->update(
				$table_name,
				array( 'active' => $value ),
				array( 'addon_key' => $addon_key ),
				array( '%d' ),
				array( '%s' )
			);
			return;
		}

		$addon_file = $this->addon_dir . '/' . $addon_key . '/' . $addon_key . '.php';
		$headers    = file_exists( $addon_file ) ? $this->get_addon_headers( $addon_file ) : array();

		$wpdb->insert(
			$table_name,
			array(
				'addon_key' => $addon_key,
				'name'      => ! empty( $headers['name'] ) ? $headers['name'] : $addon_key,
				'version'   => ! empty( $headers['version'] ) ? $headers['version'] : '',
				'active'    => $value,
			),
			array( '%s', '%s', '%s', '%d' )
		);
	}
}

