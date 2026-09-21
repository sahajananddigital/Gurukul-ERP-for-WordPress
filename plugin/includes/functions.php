<?php
/**
 * Helper functions
 *
 * @package Sahajanand_ERP
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Get ERP module
 *
 * @param string $slug Module slug
 * @return object|null
 */
function sahajanand_erp_get_module( $slug ) {
	$erp = Sahajanand_ERP();
	return $erp->modules->get_module( $slug );
}

/**
 * Check if module is active
 *
 * @param string $slug Module slug
 * @return bool
 */
function sahajanand_erp_is_module_active( $slug ) {
	$erp = Sahajanand_ERP();
	return $erp->modules->is_module_active( $slug );
}

