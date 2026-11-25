<?php
// Temporary script to force database schema update
add_action( 'admin_init', function() {
	if ( get_option( 'erp_db_version_temp' ) !== '1.0.1' ) {
		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		if ( class_exists( \SahajanandERP\Install::class ) ) {
			\SahajanandERP\Install::install();
			update_option( 'erp_db_version_temp', '1.0.1' );
		}
	}
} );
