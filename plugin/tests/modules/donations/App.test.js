/**
 * Donations App Tests
 */
import { render, screen, waitFor } from '@testing-library/react';
import DonationsApp from '../../../src/modules/donations/App';
import apiFetch from '@wordpress/api-fetch';

jest.mock( '@wordpress/api-fetch' );

describe( 'DonationsApp', () => {
	beforeEach( () => {
		apiFetch.mockClear();
	} );

	it( 'renders Donations module', () => {
		apiFetch.mockResolvedValue( [] ); // Mock ledger fetch
		render( <DonationsApp /> );
		expect( screen.getByText( /New Donation/i ) ).toBeInTheDocument();
		expect( screen.getByText( /Date/i ) ).toBeInTheDocument();
	} );

	it( 'fetches ledgers on mount', async () => {
		const mockLedgers = [ 'General Fund', 'Building Fund' ];
		apiFetch.mockResolvedValue( mockLedgers );

		render( <DonationsApp /> );

		await waitFor( () => {
			expect( apiFetch ).toHaveBeenCalledWith( {
				path: '/sahajanand-erp/v1/donations/ledgers',
			} );
		} );
	} );
} );
