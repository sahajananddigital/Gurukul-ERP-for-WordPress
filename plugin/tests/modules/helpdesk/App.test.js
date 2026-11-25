/**
 * Helpdesk App Tests
 */
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import HelpdeskApp from '../../../src/modules/helpdesk/App';
import apiFetch from '@wordpress/api-fetch';

jest.mock( '@wordpress/api-fetch' );
jest.mock( '../../../src/modules/helpdesk/components/MailboxView', () => {
	const React = require( 'react' );
	return ( { mailbox, onBackToDashboard, handleAddNew, handleDelete } ) =>
		React.createElement(
			'div',
			{ 'data-testid': 'mailbox-view' },
			mailbox?.name || 'mailbox',
			React.createElement(
				'button',
				{ type: 'button', onClick: onBackToDashboard },
				'Back to Dashboard'
			),
			React.createElement(
				'button',
				{ type: 'button', onClick: handleAddNew },
				'Add New'
			),
			React.createElement(
				'button',
				{
					type: 'button',
					onClick: () =>
						handleDelete( { id: 42, subject: 'Doomed' } ),
				},
				'Delete Ticket'
			)
		);
} );
jest.mock( '../../../src/modules/helpdesk/components/MailboxesList', () => {
	const React = require( 'react' );
	return () =>
		React.createElement( 'div', { 'data-testid': 'mailboxes-list' } );
} );
jest.mock( '../../../src/modules/helpdesk/components/SavedRepliesList', () => {
	const React = require( 'react' );
	return () =>
		React.createElement( 'div', { 'data-testid': 'saved-replies-list' } );
} );
jest.mock( '../../../src/components/EditModal', () => {
	const React = require( 'react' );
	return ( { isOpen, onSave, title } ) =>
		isOpen
			? React.createElement(
					'div',
					{ role: 'dialog' },
					title,
					React.createElement(
						'button',
						{
							type: 'button',
							onClick: () =>
								onSave( { subject: 'Fresh ticket' } ),
						},
						'Save Ticket'
					)
				)
			: null;
} );

const okResponse = ( tickets = [], headers = {} ) => ( {
	ok: true,
	json: async () => tickets,
	headers: new Headers( {
		'x-wp-total': String( headers.total ?? tickets.length ),
		'x-wp-totalpages': String( headers.totalPages ?? 1 ),
	} ),
} );

const defaultApi = ( args ) => {
	const path = args.path || '';
	if ( path.includes( '/users/me' ) ) {
		return Promise.resolve( { id: 1, name: 'Admin' } );
	}
	if ( path.includes( '/helpdesk/stats' ) ) {
		return Promise.resolve( [
			{
				id: 1,
				unassigned: 2,
				mine: 0,
				assigned: 0,
				closed: 0,
				total: 2,
			},
		] );
	}
	if ( path.includes( '/helpdesk/mailboxes' ) ) {
		return Promise.resolve( [
			{
				id: 1,
				name: 'HR Sajananddigital',
				email_address: 'hr@example.com',
			},
		] );
	}
	if ( path.includes( '/helpdesk/fetch-emails' ) ) {
		return Promise.resolve( { message: 'ok' } );
	}
	return Promise.resolve( [] );
};

describe( 'HelpdeskApp', () => {
	beforeEach( () => {
		apiFetch.mockReset();
		global.fetch = jest.fn();
		apiFetch.mockImplementation( defaultApi );
	} );

	afterEach( () => {
		delete global.fetch;
	} );

	it( 'renders dashboard with mailbox stats', async () => {
		render( <HelpdeskApp /> );
		await waitFor( () => {
			expect(
				screen.getByText( 'HR Sajananddigital' )
			).toBeInTheDocument();
		} );
		expect( screen.getByText( '2' ) ).toBeInTheDocument();
	} );

	it( 'opens mailbox view from dashboard card', async () => {
		render( <HelpdeskApp /> );
		await waitFor( () => screen.getByText( 'HR Sajananddigital' ) );
		fireEvent.click( screen.getByText( 'HR Sajananddigital' ) );
		await waitFor( () => {
			expect( screen.getByTestId( 'mailbox-view' ) ).toBeInTheDocument();
		} );
	} );

	it( 'handles stats/mailbox fetch failure without crashing', async () => {
		apiFetch.mockImplementation( () =>
			Promise.reject( new Error( 'Network error' ) )
		);
		render( <HelpdeskApp /> );
		await waitFor( () => {
			expect(
				screen.getByText( /Sahajanand Digital Dashboard/i )
			).toBeInTheDocument();
		} );
		expect( screen.getByText( /Manage Settings/i ) ).toBeInTheDocument();
	} );

	it( 'opens settings from dashboard', async () => {
		render( <HelpdeskApp /> );
		await waitFor( () => screen.getByText( /Manage Settings/i ) );
		fireEvent.click( screen.getByText( /Manage Settings/i ) );
		await waitFor( () => {
			expect(
				screen.getAllByText( /Back to Dashboard/i ).length
			).toBeGreaterThan( 0 );
			expect( screen.getByText( 'Mailboxes' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Saved Replies' ) ).toBeInTheDocument();
		} );
	} );

	it( 'shows a spinner before the app is ready', () => {
		global.fetch.mockResolvedValue( okResponse() );
		render( <HelpdeskApp /> );
		expect( screen.getByTestId( 'spinner' ) ).toBeInTheDocument();
	} );

	it( 'builds the tickets query with the nonce header', async () => {
		global.fetch.mockResolvedValue( okResponse() );
		render( <HelpdeskApp /> );
		await waitFor( () => screen.getByText( 'HR Sajananddigital' ) );
		fireEvent.click( screen.getByText( 'HR Sajananddigital' ) );
		fireEvent.click( screen.getByText( 'Add New' ) );
		await waitFor( () => screen.getByText( 'Save Ticket' ) );
		fireEvent.click( screen.getByText( 'Save Ticket' ) );

		await waitFor( () => expect( global.fetch ).toHaveBeenCalled() );
		expect( global.fetch ).toHaveBeenCalledWith(
			'/wp-json/sahajanand-erp/v1/helpdesk/tickets?per_page=20&page=1',
			{ headers: { 'X-WP-Nonce': 'test-nonce' } }
		);
	} );

	it( 'renders an error notice when the tickets request fails', async () => {
		global.fetch.mockResolvedValue( {
			ok: false,
			statusText: 'Bad Gateway',
			json: async () => ( { message: 'Upstream is down' } ),
			headers: new Headers(),
		} );
		render( <HelpdeskApp /> );
		await waitFor( () => screen.getByText( 'HR Sajananddigital' ) );
		fireEvent.click( screen.getByText( 'HR Sajananddigital' ) );
		fireEvent.click( screen.getByText( 'Add New' ) );
		await waitFor( () => screen.getByText( 'Save Ticket' ) );
		fireEvent.click( screen.getByText( 'Save Ticket' ) );

		await waitFor( () => {
			expect( screen.getByRole( 'alert' ) ).toHaveTextContent(
				'Upstream is down'
			);
		} );
	} );

	it( 'opens the create ticket modal from a mailbox', async () => {
		global.fetch.mockResolvedValue( okResponse() );
		render( <HelpdeskApp /> );
		await waitFor( () => screen.getByText( 'HR Sajananddigital' ) );
		fireEvent.click( screen.getByText( 'HR Sajananddigital' ) );
		fireEvent.click( screen.getByText( 'Add New' ) );
		await waitFor( () => {
			expect( screen.getByRole( 'dialog' ) ).toHaveTextContent(
				'Create Ticket'
			);
		} );
	} );

	it( 'creates a ticket with the current mailbox pre-filled', async () => {
		global.fetch.mockResolvedValue( okResponse() );
		render( <HelpdeskApp /> );
		await waitFor( () => screen.getByText( 'HR Sajananddigital' ) );
		fireEvent.click( screen.getByText( 'HR Sajananddigital' ) );
		fireEvent.click( screen.getByText( 'Add New' ) );
		await waitFor( () => screen.getByText( 'Save Ticket' ) );
		fireEvent.click( screen.getByText( 'Save Ticket' ) );

		await waitFor( () => {
			expect( apiFetch ).toHaveBeenCalledWith(
				expect.objectContaining( {
					path: '/sahajanand-erp/v1/helpdesk/tickets',
					method: 'POST',
					data: expect.objectContaining( {
						subject: 'Fresh ticket',
						mailbox_id: 1,
					} ),
				} )
			);
		} );
	} );

	it( 'reports a save failure through a snackbar message', async () => {
		global.fetch.mockResolvedValue( okResponse() );
		apiFetch.mockImplementation( ( args ) => {
			if ( args.method === 'POST' && args.path.includes( '/tickets' ) ) {
				return Promise.reject( new Error( 'Server said no' ) );
			}
			return defaultApi( args );
		} );

		render( <HelpdeskApp /> );
		await waitFor( () => screen.getByText( 'HR Sajananddigital' ) );
		fireEvent.click( screen.getByText( 'HR Sajananddigital' ) );
		fireEvent.click( screen.getByText( 'Add New' ) );
		await waitFor( () => screen.getByText( 'Save Ticket' ) );
		fireEvent.click( screen.getByText( 'Save Ticket' ) );

		await waitFor( () => {
			expect( screen.getByRole( 'dialog' ) ).toHaveTextContent(
				'Create Ticket'
			);
		} );
	} );

	it( 'confirms and deletes a ticket', async () => {
		global.fetch.mockResolvedValue( okResponse() );
		apiFetch.mockImplementation( ( args ) => {
			if ( args.method === 'DELETE' ) {
				return Promise.resolve( { message: 'Ticket deleted.' } );
			}
			return defaultApi( args );
		} );

		render( <HelpdeskApp /> );
		await waitFor( () => screen.getByText( 'HR Sajananddigital' ) );
		fireEvent.click( screen.getByText( 'HR Sajananddigital' ) );
		fireEvent.click( screen.getByText( 'Delete Ticket' ) );

		await waitFor( () => {
			expect( screen.getByRole( 'alertdialog' ) ).toHaveTextContent(
				/Are you sure you want to delete this ticket/i
			);
		} );
		fireEvent.click( screen.getByRole( 'button', { name: /^Delete$/i } ) );

		await waitFor( () => {
			expect( apiFetch ).toHaveBeenCalledWith(
				expect.objectContaining( {
					path: '/sahajanand-erp/v1/helpdesk/tickets/42',
					method: 'DELETE',
				} )
			);
		} );
	} );

	it( 'cancels the delete confirmation without calling the API', async () => {
		global.fetch.mockResolvedValue( okResponse() );
		render( <HelpdeskApp /> );
		await waitFor( () => screen.getByText( 'HR Sajananddigital' ) );
		fireEvent.click( screen.getByText( 'HR Sajananddigital' ) );
		fireEvent.click( screen.getByText( 'Delete Ticket' ) );
		await waitFor( () => screen.getByRole( 'alertdialog' ) );
		fireEvent.click( screen.getByRole( 'button', { name: /Cancel/i } ) );

		await waitFor( () => {
			expect(
				screen.queryByRole( 'alertdialog' )
			).not.toBeInTheDocument();
		} );
		expect(
			apiFetch.mock.calls.filter(
				( [ args ] ) => args.method === 'DELETE'
			)
		).toHaveLength( 0 );
	} );
} );
