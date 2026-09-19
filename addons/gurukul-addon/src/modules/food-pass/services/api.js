/**
 * Food Pass API Service
 */
import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';

export const fetchFoodPasses = async () => {
	try {
		return await apiFetch( { path: '/wp-erp/v1/food-pass' } );
	} catch ( err ) {
		throw new Error(
			err.message || __( 'Failed to fetch food passes', 'wp-erp' )
		);
	}
};

export const createFoodPass = async ( payload ) => {
	try {
		return await apiFetch( {
			path: '/wp-erp/v1/food-pass',
			method: 'POST',
			data: payload,
		} );
	} catch ( err ) {
		// Preserve detailed error info if available
		const message =
			err.message && err.data?.status
				? `${ err.message } (${ err.data.status })`
				: err.message || __( 'Failed to save food pass', 'wp-erp' );
		throw new Error( message );
	}
};
