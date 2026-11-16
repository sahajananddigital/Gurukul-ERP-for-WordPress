/**
 * Expenses List Tests
 */
import { render, screen, waitFor } from '@testing-library/react';
import ExpensesList from '../../../src/modules/accounting/components/ExpensesList';
import apiFetch from '@wordpress/api-fetch';

jest.mock( '@wordpress/api-fetch' );

describe( 'ExpensesList', () => {
	beforeEach( () => {
		apiFetch.mockClear();
	} );

	it( 'renders Expenses component', async () => {
		apiFetch.mockResolvedValue( [] );
		render( <ExpensesList /> );
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
		render( <ExpensesList /> );

		await waitFor( () => {
			expect( screen.getByText( 'EXP-001' ) ).toBeInTheDocument();
		} );
	} );

	it( 'renders create expense form', async () => {
		render( <ExpensesList view="create" /> );
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
