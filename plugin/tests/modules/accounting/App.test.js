/**
 * Accounting App Tests
 */
import { render, screen, waitFor } from '@testing-library/react';
import AccountingApp from '../../../src/modules/accounting/App';
import apiFetch from '@wordpress/api-fetch';

jest.mock( '@wordpress/api-fetch' );

describe( 'AccountingApp', () => {
	beforeEach( () => {
		apiFetch.mockClear();
	} );

	it( 'renders Accounting module', () => {
		apiFetch.mockResolvedValue( [] );
		render( <AccountingApp /> );
		expect( screen.getByText( /Chart of Accounts/i ) ).toBeInTheDocument();
		expect( screen.getByText( /Transactions/i ) ).toBeInTheDocument();
		expect( screen.getByText( /Invoices/i ) ).toBeInTheDocument();
		expect( screen.getByText( /Expenses/i ) ).toBeInTheDocument();
		expect( screen.getByText( /Vouchers/i ) ).toBeInTheDocument();
	} );

	it( 'fetches and displays accounts', async () => {
		const mockAccounts = [
			{
				id: 1,
				code: '1000',
				name: 'Cash',
				type: 'Asset',
				balance: 5000.0,
			},
		];

		apiFetch.mockResolvedValue( mockAccounts );
		render( <AccountingApp /> );

		await waitFor( () => {
			expect( screen.getByText( 'Cash' ) ).toBeInTheDocument();
		} );
	} );

	it( 'displays transactions view', () => {
		apiFetch.mockResolvedValue( [] );
		render( <AccountingApp view="transactions" /> );
		expect( screen.getByText( /Transactions/i ) ).toBeInTheDocument();
	} );

	it( 'displays invoices view', () => {
		apiFetch.mockResolvedValue( [] );
		render( <AccountingApp view="invoices" /> );
		expect( screen.getByText( /All Invoices/i ) ).toBeInTheDocument();
	} );

	it( 'displays expenses view', () => {
		apiFetch.mockResolvedValue( [] );
		render( <AccountingApp view="expenses" /> );
		expect( screen.getByText( /All Expenses/i ) ).toBeInTheDocument();
	} );

	it( 'displays vouchers view', () => {
		apiFetch.mockResolvedValue( [] );
		render( <AccountingApp view="vouchers" /> );
		expect( screen.getByText( /All Vouchers/i ) ).toBeInTheDocument();
	} );
} );
