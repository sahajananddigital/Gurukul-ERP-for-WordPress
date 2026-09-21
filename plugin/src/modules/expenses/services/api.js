/**
 * Expenses API Service
 */
import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';

export const fetchExpenses = async () => {
	try {
		return await apiFetch( { path: '/sahajanand-erp/v1/expenses' } );
	} catch ( err ) {
		throw new Error(
			err.message || __( 'Failed to fetch expenses', 'sahajanand-erp' )
		);
	}
};

export const createExpense = async ( payload ) => {
	try {
		return await apiFetch( {
			path: '/sahajanand-erp/v1/expenses',
			method: 'POST',
			data: payload,
		} );
	} catch ( err ) {
		throw new Error(
			err.message || __( 'Failed to create expense', 'sahajanand-erp' )
		);
	}
};
