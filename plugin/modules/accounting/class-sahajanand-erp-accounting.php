<?php
/**
 * Accounting Module
 *
 * Unified Accounting module encompassing chart of accounts, transactions,
 * invoices, expenses, and vouchers.
 *
 * @package Sahajanand_ERP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class SAHAJANAND_ERP_Accounting {
	
	/**
	 * Module slug
	 *
	 * @var string
	 */
	public $slug = 'accounting';
	
	/**
	 * Module name
	 *
	 * @var string
	 */
	public $name = 'Accounting';

	/**
	 * Invoices submodule instance
	 *
	 * @var object|null
	 */
	public $invoices = null;

	/**
	 * Expenses submodule instance
	 *
	 * @var object|null
	 */
	public $expenses = null;

	/**
	 * Vouchers submodule instance
	 *
	 * @var object|null
	 */
	public $vouchers = null;
	
	/**
	 * Constructor
	 */
	public function __construct() {
		$this->init();
	}
	
	/**
	 * Initialize module and sub-modules
	 */
	private function init() {
		$this->invoices = new SAHAJANAND_ERP_Invoices();
		$this->expenses = new SAHAJANAND_ERP_Expenses();
		$this->vouchers = new SAHAJANAND_ERP_Vouchers();
	}
	
	/**
	 * Add admin menu
	 */
	public function add_admin_menu() {
		add_menu_page(
			__( 'Accounting', 'sahajanand-erp' ),
			__( 'Accounting', 'sahajanand-erp' ),
			'erp_manage_accounting',
			'sahajanand-erp-accounting',
			array( $this, 'render_page' ),
			'dashicons-chart-line',
			31
		);
	}
	
	/**
	 * Render Accounting page
	 */
	public function render_page() {
		?>
		<div id="sahajanand-erp-accounting-root"></div>
		<!-- Accounting Root -->
		<?php
	}
	
	/**
	 * Check if module is active
	 *
	 * @return bool
	 */
	public function is_active() {
		return true;
	}
}

if ( ! class_exists( 'SAHAJANAND_ERP_Invoices' ) ) {
	/**
	 * Invoices submodule compatibility class.
	 */
	class SAHAJANAND_ERP_Invoices {
		/**
		 * Module slug
		 *
		 * @var string
		 */
		public $slug = 'invoices';

		/**
		 * Module name
		 *
		 * @var string
		 */
		public $name = 'Invoices';

		/**
		 * Check if active
		 *
		 * @return bool
		 */
		public function is_active() {
			return true;
		}
	}
}

if ( ! class_exists( 'SAHAJANAND_ERP_Expenses' ) ) {
	/**
	 * Expenses submodule compatibility class.
	 */
	class SAHAJANAND_ERP_Expenses {
		/**
		 * Module slug
		 *
		 * @var string
		 */
		public $slug = 'expenses';

		/**
		 * Module name
		 *
		 * @var string
		 */
		public $name = 'Expenses';

		/**
		 * Check if active
		 *
		 * @return bool
		 */
		public function is_active() {
			return true;
		}
	}
}

if ( ! class_exists( 'SAHAJANAND_ERP_Vouchers' ) ) {
	/**
	 * Vouchers submodule compatibility class.
	 */
	class SAHAJANAND_ERP_Vouchers {
		/**
		 * Module slug
		 *
		 * @var string
		 */
		public $slug = 'vouchers';

		/**
		 * Module name
		 *
		 * @var string
		 */
		public $name = 'Vouchers';

		/**
		 * Check if active
		 *
		 * @return bool
		 */
		public function is_active() {
			return true;
		}
	}
}
