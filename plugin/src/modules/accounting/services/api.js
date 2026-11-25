/**
 * Accounting API Service
 * Unified service for accounts, transactions, invoices, expenses, and vouchers.
 */
import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';

// Accounts
export const fetchAccounts = async () => {
	try {
		return await apiFetch( {
			path: '/sahajanand-erp/v1/accounting/accounts',
		} );
	} catch ( err ) {
		throw new Error(
			err.message || __( 'Failed to fetch accounts', 'sahajanand-erp' )
		);
	}
};

export const createAccount = async ( payload ) => {
	try {
		return await apiFetch( {
			path: '/sahajanand-erp/v1/accounting/accounts',
			method: 'POST',
			data: payload,
		} );
	} catch ( err ) {
		throw new Error(
			err.message || __( 'Failed to create account', 'sahajanand-erp' )
		);
	}
};

// Transactions
export const fetchTransactions = async () => {
	try {
		return await apiFetch( {
			path: '/sahajanand-erp/v1/accounting/transactions',
		} );
	} catch ( err ) {
		throw new Error(
			err.message ||
				__( 'Failed to fetch transactions', 'sahajanand-erp' )
		);
	}
};

export const createTransaction = async ( payload ) => {
	try {
		return await apiFetch( {
			path: '/sahajanand-erp/v1/accounting/transactions',
			method: 'POST',
			data: payload,
		} );
	} catch ( err ) {
		throw new Error(
			err.message ||
				__( 'Failed to create transaction', 'sahajanand-erp' )
		);
	}
};

// Invoices
export const fetchInvoices = async () => {
	try {
		return await apiFetch( { path: '/sahajanand-erp/v1/invoices' } );
	} catch ( err ) {
		throw new Error(
			err.message || __( 'Failed to fetch invoices', 'sahajanand-erp' )
		);
	}
};

export const createInvoice = async ( payload ) => {
	try {
		return await apiFetch( {
			path: '/sahajanand-erp/v1/invoices',
			method: 'POST',
			data: payload,
		} );
	} catch ( err ) {
		throw new Error(
			err.message || __( 'Failed to create invoice', 'sahajanand-erp' )
		);
	}
};

// Expenses
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

export const updateExpense = async ( id, payload ) => {
	try {
		return await apiFetch( {
			path: `/sahajanand-erp/v1/expenses/${ id }`,
			method: 'POST',
			data: payload,
		} );
	} catch ( err ) {
		throw new Error(
			err.message || __( 'Failed to update expense', 'sahajanand-erp' )
		);
	}
};

export const deleteExpense = async ( id ) => {
	try {
		return await apiFetch( {
			path: `/sahajanand-erp/v1/expenses/${ id }`,
			method: 'DELETE',
		} );
	} catch ( err ) {
		throw new Error(
			err.message || __( 'Failed to delete expense', 'sahajanand-erp' )
		);
	}
};

// Vouchers
export const fetchVouchers = async () => {
	try {
		return await apiFetch( { path: '/sahajanand-erp/v1/vouchers' } );
	} catch ( err ) {
		throw new Error(
			err.message || __( 'Failed to fetch vouchers', 'sahajanand-erp' )
		);
	}
};

export const createVoucher = async ( payload ) => {
	try {
		return await apiFetch( {
			path: '/sahajanand-erp/v1/vouchers',
			method: 'POST',
			data: payload,
		} );
	} catch ( err ) {
		throw new Error(
			err.message || __( 'Failed to create voucher', 'sahajanand-erp' )
		);
	}
};
