/**
 * Helpdesk App Tests
 */
import { render, screen, waitFor } from '@testing-library/react';
import HelpdeskApp from '../../../src/modules/helpdesk/App';
import apiFetch from '@wordpress/api-fetch';

jest.mock( '@wordpress/api-fetch' );

describe( 'HelpdeskApp', () => {
	beforeEach( () => {
		apiFetch.mockClear();
	} );

	it( 'renders Helpdesk module', async () => {
		apiFetch.mockResolvedValue( [] );
		render( <HelpdeskApp /> );
		await waitFor( () => {
			// "Tickets" or "Create Ticket" depending on default view?
			// HelpdeskApp default is 'tickets' (list) usually, unless changed.
			// Let's check for "Helpdesk" title or "Tickets" tab
			expect(
				screen.getAllByText( /Tickets/i )[ 0 ]
			).toBeInTheDocument();
		} );
	} );

	it( 'fetches and displays tickets', async () => {
		const mockTickets = [
			{
				id: 1,
				ticket_no: 'TKT-001',
				subject: 'Test Ticket',
				priority: 'high',
				status: 'open',
				created_at: '2024-01-01',
			},
		];

		apiFetch.mockResolvedValue( mockTickets );
		render( <HelpdeskApp /> );

		await waitFor( () => {
			expect( screen.getByText( 'TKT-001' ) ).toBeInTheDocument();
		} );
	} );

	it( 'handles fetch failure gracefully', async () => {
		apiFetch.mockRejectedValue( new Error( 'Network error' ) );

		// Component should render without crashing
		render( <HelpdeskApp /> );

		// Verify component renders placeholder or tab
		expect( screen.getAllByText( /Tickets/i )[ 0 ] ).toBeInTheDocument();

		// Wait for async operations to complete
		await waitFor(
			() => {
				const elements = screen.getAllByText( /Tickets/i );
				expect( elements.length ).toBeGreaterThan( 0 );
			},
			{ timeout: 2000 }
		);
	} );
} );
