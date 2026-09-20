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
// --- Leads ---
export const fetchLeads = async ( params = {} ) => {
	try {
		const queryString = new URLSearchParams( params ).toString();
		return await apiFetch( { path: `/wp-erp/v1/crm/leads?${ queryString }` } );
	} catch ( err ) { throw new Error( err.message || __( 'Failed to fetch leads', 'wp-erp' ) ); }
};
export const createLead = async ( payload ) => {
	try { return await apiFetch( { path: '/wp-erp/v1/crm/leads', method: 'POST', data: payload } ); } 
	catch ( err ) { throw new Error( err.message || __( 'Failed to create lead', 'wp-erp' ) ); }
};
export const updateLead = async ( payload ) => {
	try { return await apiFetch( { path: `/wp-erp/v1/crm/leads/${ payload.id }`, method: 'POST', data: payload } ); } 
	catch ( err ) { throw new Error( err.message || __( 'Failed to update lead', 'wp-erp' ) ); }
};

// --- Deals ---
export const fetchDeals = async ( params = {} ) => {
	try {
		const queryString = new URLSearchParams( params ).toString();
		return await apiFetch( { path: `/wp-erp/v1/crm/deals?${ queryString }` } );
	} catch ( err ) { throw new Error( err.message || __( 'Failed to fetch deals', 'wp-erp' ) ); }
};
export const createDeal = async ( payload ) => {
	try { return await apiFetch( { path: '/wp-erp/v1/crm/deals', method: 'POST', data: payload } ); } 
	catch ( err ) { throw new Error( err.message || __( 'Failed to create deal', 'wp-erp' ) ); }
};
export const updateDeal = async ( payload ) => {
	try { return await apiFetch( { path: `/wp-erp/v1/crm/deals/${ payload.id }`, method: 'POST', data: payload } ); } 
	catch ( err ) { throw new Error( err.message || __( 'Failed to update deal', 'wp-erp' ) ); }
};

// --- Organizations ---
export const fetchOrganizations = async ( params = {} ) => {
	try {
		const queryString = new URLSearchParams( params ).toString();
		return await apiFetch( { path: `/wp-erp/v1/crm/organizations?${ queryString }` } );
	} catch ( err ) { throw new Error( err.message || __( 'Failed to fetch organizations', 'wp-erp' ) ); }
};
export const createOrganization = async ( payload ) => {
	try { return await apiFetch( { path: '/wp-erp/v1/crm/organizations', method: 'POST', data: payload } ); } 
	catch ( err ) { throw new Error( err.message || __( 'Failed to create organization', 'wp-erp' ) ); }
};
export const updateOrganization = async ( payload ) => {
	try { return await apiFetch( { path: `/wp-erp/v1/crm/organizations/${ payload.id }`, method: 'POST', data: payload } ); } 
	catch ( err ) { throw new Error( err.message || __( 'Failed to update organization', 'wp-erp' ) ); }
};
