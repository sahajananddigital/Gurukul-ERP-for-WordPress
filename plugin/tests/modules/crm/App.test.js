/**
 * CRM App Tests
 */
import { render, screen, waitFor } from '@testing-library/react';

import CRMApp from '../../../src/modules/crm/App';
import apiFetch from '@wordpress/api-fetch';

jest.mock( '@wordpress/api-fetch' );

describe( 'CRMApp', () => {
	beforeEach( () => {
		apiFetch.mockClear();
	} );

	it( 'renders CRM module', async () => {
		apiFetch.mockResolvedValue( [] );
		render( <CRMApp /> );
		// "Contacts" appears in header and tab list, use getAll or check for specific header
		await waitFor( () => {
			expect(
				screen.getAllByText( /Contacts/i )[ 0 ]
			).toBeInTheDocument();
		} );
	} );

	it( 'fetches and displays contacts', async () => {
		const mockContacts = [
			{
				id: 1,
				first_name: 'John',
				last_name: 'Doe',
				email: 'john@example.com',
				phone: '1234567890',
				company: 'Test Corp',
				status: 'lead',
			},
		];

		apiFetch.mockResolvedValue( mockContacts );
		render( <CRMApp /> );

		await waitFor( () => {
			expect( screen.getByText( 'John Doe' ) ).toBeInTheDocument();
		} );
	} );

	it( 'handles fetch failure gracefully', async () => {
		apiFetch.mockRejectedValue( new Error( 'Network error' ) );

		// Component should render without crashing
		render( <CRMApp /> );

		// Wait for async operations to complete
		await waitFor(
			() => {
				const elements = screen.getAllByText( /Contacts/i );
				expect( elements.length ).toBeGreaterThan( 0 );
			},
			{ timeout: 2000 }
		);
	} );
} );
