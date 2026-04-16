/**
 * Expenses App Tests
 */
import { render, screen, waitFor } from '@testing-library/react';
import ExpensesApp from '../../../src/modules/expenses/App';
import apiFetch from '@wordpress/api-fetch';

jest.mock( '@wordpress/api-fetch' );

describe( 'ExpensesApp', () => {
	beforeEach( () => {
		apiFetch.mockClear();
	} );

	it( 'renders Expenses module', async () => {
		apiFetch.mockResolvedValue( [] );
		render( <ExpensesApp /> );
		await waitFor( () => {
			expect(
				screen.getAllByText( /All Expenses/i )[ 0 ]
			).toBeInTheDocument();
		} );
	} );

	it( 'fetches and displays expenses', async () => {
		const mockExpenses = [
			{
				id: 1,
				expense_no: 'EXP-001',
				expense_type: 'travel',
				date: '2024-01-01',
				amount: 500.0,
				category: 'Transportation',
				status: 'pending',
			},
		];

		apiFetch.mockResolvedValue( mockExpenses );
		render( <ExpensesApp /> );

		await waitFor( () => {
			expect( screen.getByText( 'EXP-001' ) ).toBeInTheDocument();
		} );
	} );

	it( 'renders create expense form', async () => {
		render( <ExpensesApp view="create" /> );
		await waitFor( () => {
			expect(
				screen.getAllByText( /Add Expense/i )[ 0 ]
			).toBeInTheDocument();
			expect(
				screen.getByLabelText( /Expense Type/i )
			).toBeInTheDocument();
		} );
	} );
} );
