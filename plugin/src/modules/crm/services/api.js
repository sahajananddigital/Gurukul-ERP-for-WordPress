/**
 * CRM API Service
 */
import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';

export const fetchContacts = async ( params = {} ) => {
	try {
		const queryString = new URLSearchParams( params ).toString();
		return await apiFetch( {
			path: `/wp-erp/v1/crm/contacts?${ queryString }`,
		} );
	} catch ( err ) {
		throw new Error(
			err.message || __( 'Failed to fetch contacts', 'wp-erp' )
		);
	}
};

export const createContact = async ( payload ) => {
	try {
		return await apiFetch( {
			path: '/wp-erp/v1/crm/contacts',
			method: 'POST',
			data: payload,
		} );
	} catch ( err ) {
		throw new Error(
			err.message || __( 'Failed to create contact', 'wp-erp' )
		);
	}
};

export const updateContact = async ( payload ) => {
	try {
		const id = payload.id;
		return await apiFetch( {
			path: `/wp-erp/v1/crm/contacts/${ id }`,
			method: 'POST',
			data: payload,
		} );
	} catch ( err ) {
		throw new Error(
			err.message || __( 'Failed to update contact', 'wp-erp' )
		);
	}
};
