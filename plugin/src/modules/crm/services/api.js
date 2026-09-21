/**
 * CRM API Service
 */
import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';

export const fetchContacts = async ( params = {} ) => {
	try {
		const queryString = new URLSearchParams( params ).toString();
		return await apiFetch( {
			path: `/sahajanand-erp/v1/crm/contacts?${ queryString }`,
		} );
	} catch ( err ) {
		throw new Error(
			err.message || __( 'Failed to fetch contacts', 'sahajanand-erp' )
		);
	}
};

export const createContact = async ( payload ) => {
	try {
		return await apiFetch( {
			path: '/sahajanand-erp/v1/crm/contacts',
			method: 'POST',
			data: payload,
		} );
	} catch ( err ) {
		throw new Error(
			err.message || __( 'Failed to create contact', 'sahajanand-erp' )
		);
	}
};

export const updateContact = async ( payload ) => {
	try {
		const id = payload.id;
		return await apiFetch( {
			path: `/sahajanand-erp/v1/crm/contacts/${ id }`,
			method: 'POST',
			data: payload,
		} );
	} catch ( err ) {
		throw new Error(
			err.message || __( 'Failed to update contact', 'sahajanand-erp' )
		);
	}
};

export const deleteContact = async ( id ) => {
	try {
		return await apiFetch( {
			path: `/sahajanand-erp/v1/crm/contacts/${ id }`,
			method: 'DELETE',
		} );
	} catch ( err ) {
		throw new Error(
			err.message || __( 'Failed to delete contact', 'sahajanand-erp' )
		);
	}
};
// --- Leads ---
export const fetchLeads = async ( params = {} ) => {
	try {
		const queryString = new URLSearchParams( params ).toString();
		return await apiFetch( { path: `/sahajanand-erp/v1/crm/leads?${ queryString }` } );
	} catch ( err ) { throw new Error( err.message || __( 'Failed to fetch leads', 'sahajanand-erp' ) ); }
};
export const createLead = async ( payload ) => {
	try { return await apiFetch( { path: '/sahajanand-erp/v1/crm/leads', method: 'POST', data: payload } ); } 
	catch ( err ) { throw new Error( err.message || __( 'Failed to create lead', 'sahajanand-erp' ) ); }
};
export const updateLead = async ( payload ) => {
	try { return await apiFetch( { path: `/sahajanand-erp/v1/crm/leads/${ payload.id }`, method: 'POST', data: payload } ); } 
	catch ( err ) { throw new Error( err.message || __( 'Failed to update lead', 'sahajanand-erp' ) ); }
};

// --- Deals ---
export const fetchDeals = async ( params = {} ) => {
	try {
		const queryString = new URLSearchParams( params ).toString();
		return await apiFetch( { path: `/sahajanand-erp/v1/crm/deals?${ queryString }` } );
	} catch ( err ) { throw new Error( err.message || __( 'Failed to fetch deals', 'sahajanand-erp' ) ); }
};
export const createDeal = async ( payload ) => {
	try { return await apiFetch( { path: '/sahajanand-erp/v1/crm/deals', method: 'POST', data: payload } ); } 
	catch ( err ) { throw new Error( err.message || __( 'Failed to create deal', 'sahajanand-erp' ) ); }
};
export const updateDeal = async ( payload ) => {
	try { return await apiFetch( { path: `/sahajanand-erp/v1/crm/deals/${ payload.id }`, method: 'POST', data: payload } ); } 
	catch ( err ) { throw new Error( err.message || __( 'Failed to update deal', 'sahajanand-erp' ) ); }
};

// --- Organizations ---
export const fetchOrganizations = async ( params = {} ) => {
	try {
		const queryString = new URLSearchParams( params ).toString();
		return await apiFetch( { path: `/sahajanand-erp/v1/crm/organizations?${ queryString }` } );
	} catch ( err ) { throw new Error( err.message || __( 'Failed to fetch organizations', 'sahajanand-erp' ) ); }
};
export const createOrganization = async ( payload ) => {
	try { return await apiFetch( { path: '/sahajanand-erp/v1/crm/organizations', method: 'POST', data: payload } ); } 
	catch ( err ) { throw new Error( err.message || __( 'Failed to create organization', 'sahajanand-erp' ) ); }
};
export const updateOrganization = async ( payload ) => {
	try { return await apiFetch( { path: `/sahajanand-erp/v1/crm/organizations/${ payload.id }`, method: 'POST', data: payload } ); } 
	catch ( err ) { throw new Error( err.message || __( 'Failed to update organization', 'sahajanand-erp' ) ); }
};
