/**
 * Donations API Service
 */
import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';

export const fetchDonations = async () => {
	try {
		return await apiFetch( { path: '/wp-erp/v1/donations' } );
	} catch ( err ) {
		throw new Error(
			err.message || __( 'Failed to fetch donations', 'wp-erp' )
		);
	}
};

export const createDonation = async ( payload ) => {
	try {
		return await apiFetch( {
			path: '/wp-erp/v1/donations',
			method: 'POST',
			data: payload,
		} );
	} catch ( err ) {
		throw new Error(
			err.message || __( 'Failed to save donation', 'wp-erp' )
		);
	}
};

export const fetchLedgers = async () => {
	try {
		return await apiFetch( { path: '/wp-erp/v1/donations/ledgers' } );
	} catch ( err ) {
		console.error( err );
		return [];
	}
};

export const createLedger = async ( ledgers ) => {
	try {
		return await apiFetch( {
			path: '/wp-erp/v1/donations/ledgers',
			method: 'POST',
			data: { ledgers },
		} );
	} catch ( err ) {
		throw new Error( 'Failed to save ledger' );
	}
};

export const fetchDonorByPhone = async ( phone ) => {
	try {
		return await apiFetch( {
			path: `/wp-erp/v1/donations/donor?phone=${ phone }`,
		} );
	} catch ( err ) {
		console.log( 'Donor lookup failed', err );
		return null;
	}
};

export const updateDonation = async ( payload ) => {
	try {
		const id = payload.id;
		return await apiFetch( {
			path: `/wp-erp/v1/donations/${ id }`,
			method: 'POST',
			data: payload,
		} );
	} catch ( err ) {
		throw new Error( 'Failed to update donation' );
	}
};
