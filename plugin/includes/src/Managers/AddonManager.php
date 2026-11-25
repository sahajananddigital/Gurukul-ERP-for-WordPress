<?php
/**
 * Modern Addon Manager
 *
 * @package SahajanandERP\Managers
 */

declare(strict_types=1);

namespace SahajanandERP\Managers;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class managing ERP modular addons.
 */
class AddonManager {

	/**
	 * Loaded addons.
	 *
	 * @var array<string, object>
	 */
	private array $addons = array();

	/**
	 * Addons directory path.
	 *
	 * @var string
	 */
	private string $addon_dir;

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->addon_dir = WP_CONTENT_DIR . '/sahajanand-erp-addons';
	}

	/**
	 * Load all active addons.
	 *
	 * @return void
	 */
	public function load_addons(): void {
		global $wpdb;

		$table_name = $wpdb->prefix . 'erp_addons';

		if ( $wpdb->get_var( "SHOW TABLES LIKE '$table_name'" ) !== $table_name ) {
			return;
		}

		$active_addons = $wpdb->get_results( "SELECT addon_key FROM $table_name WHERE active = 1" );

		foreach ( (array) $active_addons as $addon ) {
			$this->load_addon( $addon->addon_key );
		}

		if ( is_dir( $this->addon_dir ) ) {
			$addon_folders = glob( $this->addon_dir . '/*', GLOB_ONLYDIR ) ?: array();

			foreach ( $addon_folders as $addon_folder ) {
				$addon_key  = basename( $addon_folder );
				$addon_file = $addon_folder . '/' . $addon_key . '.php';

				if ( file_exists( $addon_file ) && ! isset( $this->addons[ $addon_key ] ) ) {
					$this->load_addon( $addon_key, $addon_file );
				}
			}
		}
	}

	/**
	 * Load a specific addon.
	 *
	 * @param string      $addon_key Addon key.
	 * @param string|null $addon_file Optional file path.
	 * @return void
	 */
	private function load_addon( string $addon_key, ?string $addon_file = null ): void {
		if ( ! $addon_file ) {
			$addon_file = $this->addon_dir . '/' . $addon_key . '/' . $addon_key . '.php';
		}

		if ( file_exists( $addon_file ) ) {
			require_once $addon_file;

			$pascal_case  = str_replace( ' ', '', ucwords( str_replace( array( '-', '_' ), ' ', $addon_key ) ) );
			$modern_class = '\\SahajanandERP\\Addons\\' . $pascal_case;
			$legacy_class = 'SAHAJANAND_ERP_Addon_' . str_replace( '-', '_', ucwords( $addon_key, '-' ) );
			$snake_class  = str_replace( '-', '_', ucwords( $addon_key, '-' ) );

			$candidate_classes = array(
				'\\SahajanandERP\\Addons\\' . $pascal_case,
				$pascal_case,
				$legacy_class,
				$snake_class,
			);

			foreach ( $candidate_classes as $class ) {
				if ( class_exists( $class ) ) {
					if ( method_exists( $class, 'get_instance' ) ) {
						$this->addons[ $addon_key ] = $class::get_instance();
					} elseif ( method_exists( $class, 'instance' ) ) {
						$this->addons[ $addon_key ] = $class::instance();
					} else {
						$this->addons[ $addon_key ] = new $class();
					}
					break;
				}
			}
		}
	}

	/**
	 * Get loaded addons.
	 *
	 * @return array<string, object>
	 */
	public function get_addons(): array {
		return $this->addons;
	}

	/**
	 * Install an addon.
	 *
	 * @param string $addon_key Addon key.
	 * @param array  $addon_data Addon metadata.
	 * @return void
	 */
	public function install_addon( string $addon_key, array $addon_data ): void {
		global $wpdb;

		$table_name = $wpdb->prefix . 'erp_addons';

		$wpdb->insert(
			$table_name,
			array(
				'addon_key' => $addon_key,
				'name'      => $addon_data['name'] ?? '',
				'version'   => $addon_data['version'] ?? '',
				'active'    => 0,
			),
			array( '%s', '%s', '%s', '%d' )
		);
	}

	/**
	 * Get the addons installed in the addons directory with their status.
	 *
	 * @return array<int, array<string, mixed>>
	 */
	public function get_installed_addons(): array {
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

		$folders = glob( $this->addon_dir . '/*', GLOB_ONLYDIR ) ?: array();
		foreach ( $folders as $addon_folder ) {
			$addon_key  = basename( $addon_folder );
			$addon_file = $addon_folder . '/' . $addon_key . '.php';

			if ( ! file_exists( $addon_file ) ) {
				continue;
			}

			$headers = $this->get_addon_headers( $addon_file );

			$addons[] = array(
				'key'         => $addon_key,
				'name'        => ! empty( $headers['name'] ) ? $headers['name'] : $addon_key,
				'version'     => $headers['version'] ?? '',
				'description' => $headers['description'] ?? '',
				'author'      => $headers['author'] ?? '',
				'active'      => $active[ $addon_key ] ?? 0,
			);
		}

		return $addons;
	}

	/**
	 * Read addon file headers.
	 *
	 * @param string $addon_file Addon file path.
	 * @return array<string, string>
	 */
	private function get_addon_headers( string $addon_file ): array {
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
	 * Activate an addon.
	 *
	 * @param string $addon_key Addon key.
	 * @return void
	 */
	public function activate_addon( string $addon_key ): void {
		$this->set_addon_active( $addon_key, true );
		$this->load_addon( $addon_key );
	}

	/**
	 * Deactivate an addon.
	 *
	 * @param string $addon_key Addon key.
	 * @return void
	 */
	public function deactivate_addon( string $addon_key ): void {
		$this->set_addon_active( $addon_key, false );
		unset( $this->addons[ $addon_key ] );
	}

	/**
	 * Persist an addon's active state.
	 *
	 * @param string $addon_key Addon key.
	 * @param bool   $active    Active status.
	 * @return void
	 */
	private function set_addon_active( string $addon_key, bool $active ): void {
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
