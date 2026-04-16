/**
 * Invoices App Tests
 */
import { render, screen, waitFor } from '@testing-library/react';
import InvoicesApp from '../../../src/modules/invoices/App';
import apiFetch from '@wordpress/api-fetch';

jest.mock( '@wordpress/api-fetch' );

describe( 'InvoicesApp', () => {
	beforeEach( () => {
		apiFetch.mockClear();
	} );

	it( 'renders Invoices module', async () => {
		apiFetch.mockResolvedValue( [] );
		render( <InvoicesApp /> );
		await waitFor( () => {
			expect(
				screen.getAllByText( /All Invoices/i )[ 0 ]
			).toBeInTheDocument();
		} );
	} );

	it( 'fetches and displays invoices', async () => {
		const mockInvoices = [
			{
				id: 1,
				invoice_no: 'INV-001',
				invoice_date: '2024-01-01',
				due_date: '2024-01-31',
				total_amount: 1180.0,
				status: 'draft',
			},
		];

		apiFetch.mockResolvedValue( mockInvoices );
		render( <InvoicesApp /> );

		await waitFor( () => {
			expect( screen.getByText( 'INV-001' ) ).toBeInTheDocument();
		} );
	} );

	it( 'renders create invoice form', async () => {
		apiFetch.mockResolvedValue( [] );
		render( <InvoicesApp view="create" /> );
		await waitFor( () => {
			expect(
				screen.getAllByText( /Invoice Date/i )[ 0 ]
			).toBeInTheDocument();
		} );
	} );
} );
