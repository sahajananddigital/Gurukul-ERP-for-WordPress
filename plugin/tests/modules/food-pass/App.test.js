/**
 * Food Pass App Tests
 */
import { render, screen, waitFor } from '@testing-library/react';
import FoodPassApp from '../../../src/modules/food-pass/App';
import apiFetch from '@wordpress/api-fetch';

jest.mock( '@wordpress/api-fetch' );

describe( 'FoodPassApp', () => {
	beforeEach( () => {
		apiFetch.mockClear();
	} );

	it( 'renders Food Pass module', () => {
		apiFetch.mockResolvedValue( [] );
		render( <FoodPassApp /> );
		expect( screen.getByText( /Quantity:/i ) ).toBeInTheDocument();
	} );

	it( 'fetches and displays food passes', async () => {
		const mockFoodPasses = [
			{
				id: 123,
				issue_date: '2024-01-01',
				total_meals: 1,
				notes: JSON.stringify( { amount: 90, mealType: 'Lunch' } ),
				status: 'active',
			},
		];

		apiFetch.mockResolvedValue( mockFoodPasses );
		render( <FoodPassApp view="list" /> ); // Must explicitly set view to list

		await waitFor( () => {
			expect( screen.getByText( '123' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Lunch' ) ).toBeInTheDocument();
		} );
	} );

	it( 'renders create food pass form', () => {
		apiFetch.mockResolvedValue( [] );
		render( <FoodPassApp view="create" /> );
		// Check for form-specific field
		expect( screen.getByLabelText( /Quantity:/i ) ).toBeInTheDocument();
		expect(
			screen.getByText( /Total Amount to Pay:/i )
		).toBeInTheDocument();
	} );
} );
