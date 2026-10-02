/**
 * MailboxView tests
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import apiFetch from '@wordpress/api-fetch';
import MailboxView from '../../../src/modules/helpdesk/components/MailboxView';

jest.mock( '@wordpress/api-fetch' );
jest.mock( '../../../src/modules/helpdesk/components/TicketDetail', () => {
	const React = require( 'react' );
	return ( { ticketId, onBack } ) =>
		React.createElement(
			'div',
			{ 'data-testid': 'ticket-detail' },
			`Ticket ${ ticketId }`,
			React.createElement(
				'button',
				{ type: 'button', onClick: onBack },
				'Back'
			)
		);
} );

const baseProps = () => ( {
	mailbox: { id: 1, name: 'Support', email_address: 'support@example.com' },
	tickets: [
		{
			id: 3,
			ticket_no: '#3',
			subject: 'Test ticket',
			status: 'open',
			customer_name: 'Ada',
			is_starred: 0,
			created_at: '2026-01-01T00:00:00',
		},
		{
			id: 4,
			ticket_no: '#4',
			subject: 'Second',
			status: 'pending',
			customer_email: 'bob@example.com',
			is_starred: 1,
			created_at: '2026-01-02T00:00:00',
		},
	],
	pagination: { total: 2, totalPages: 1, page: 1, perPage: 20 },
	loading: false,
	onBackToDashboard: jest.fn(),
	onSettingsClick: jest.fn(),
	handleAddNew: jest.fn(),
	handleFetchEmails: jest.fn(),
	isFetchingEmails: false,
	addSnackbar: jest.fn(),
	fetchTickets: jest.fn(),
	handleDelete: jest.fn(),
} );

describe( 'MailboxView', () => {
	beforeEach( () => {
		apiFetch.mockReset();
		apiFetch.mockResolvedValue( {} );
	} );

	it( 'renders mailbox name and folders', async () => {
		const props = baseProps();
		render( <MailboxView { ...props } /> );
		expect( screen.getByText( 'Support' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Unassigned' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Starred' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Test ticket' ) ).toBeInTheDocument();
		expect( props.fetchTickets ).toHaveBeenCalled();
	} );

	it( 'fetches tickets when folder changes', async () => {
		const props = baseProps();
		render( <MailboxView { ...props } /> );
		fireEvent.click( screen.getByText( 'Starred' ) );
		await waitFor( () => {
			expect( props.fetchTickets ).toHaveBeenCalledWith(
				expect.objectContaining( {
					mailbox_id: 1,
					folder: 'starred',
				} )
			);
		} );
	} );

	it( 'opens ticket detail via View action', async () => {
		const props = baseProps();
		render( <MailboxView { ...props } /> );
		fireEvent.click( screen.getAllByText( 'View Conversation' )[ 0 ] );
		expect( screen.getByTestId( 'ticket-detail' ) ).toHaveTextContent(
			'Ticket 3'
		);
		fireEvent.click( screen.getByText( 'Back' ) );
		expect(
			screen.queryByTestId( 'ticket-detail' )
		).not.toBeInTheDocument();
	} );

	it( 'runs bulk star action', async () => {
		const props = baseProps();
		render( <MailboxView { ...props } /> );
		fireEvent.click( screen.getByLabelText( 'Select 3' ) );
		const bulk = screen.getByTestId( 'bulk-footer' );
		fireEvent.click(
			[ ...bulk.querySelectorAll( 'button' ) ].find( ( b ) =>
				/Star/i.test( b.textContent )
			)
		);
		await waitFor( () => {
			expect( apiFetch ).toHaveBeenCalledWith(
				expect.objectContaining( {
					path: '/sahajanand-erp/v1/helpdesk/tickets/bulk',
					method: 'POST',
					data: expect.objectContaining( {
						action: 'star',
						ids: [ 3 ],
					} ),
				} )
			);
		} );
		expect( props.addSnackbar ).toHaveBeenCalled();
	} );

	it( 'shows spinner while loading empty list', () => {
		const props = baseProps();
		props.loading = true;
		props.tickets = [];
		render( <MailboxView { ...props } /> );
		expect( screen.getByTestId( 'spinner' ) ).toBeInTheDocument();
	} );

	it( 'calls fetch emails and settings handlers', () => {
		const props = baseProps();
		render( <MailboxView { ...props } /> );
		fireEvent.click( screen.getByLabelText( 'Fetch Emails' ) );
		expect( props.handleFetchEmails ).toHaveBeenCalled();
		fireEvent.click( screen.getByLabelText( 'Settings' ) );
		expect( props.onSettingsClick ).toHaveBeenCalled();
	} );

	it( 'creates new conversation', () => {
		const props = baseProps();
		render( <MailboxView { ...props } /> );
		fireEvent.click( screen.getByText( 'New Conversation' ) );
		expect( props.handleAddNew ).toHaveBeenCalled();
	} );

	it( 'returns to dashboard', () => {
		const props = baseProps();
		render( <MailboxView { ...props } /> );
		fireEvent.click( screen.getByText( 'Dashboard' ) );
		expect( props.onBackToDashboard ).toHaveBeenCalled();
	} );

	it( 'stars a conversation via the row action', async () => {
		const props = baseProps();
		render( <MailboxView { ...props } /> );
		fireEvent.click( screen.getAllByText( 'Star' )[ 0 ] );
		await waitFor( () => {
			expect( apiFetch ).toHaveBeenCalledWith(
				expect.objectContaining( {
					path: '/sahajanand-erp/v1/helpdesk/tickets/3',
					method: 'POST',
					data: { is_starred: 1 },
				} )
			);
		} );
	} );

	it( 'unstars an already starred conversation', async () => {
		const props = baseProps();
		render( <MailboxView { ...props } /> );
		fireEvent.click( screen.getByText( 'Unstar' ) );
		await waitFor( () => {
			expect( apiFetch ).toHaveBeenCalledWith(
				expect.objectContaining( {
					path: '/sahajanand-erp/v1/helpdesk/tickets/4',
					method: 'POST',
					data: { is_starred: 0 },
				} )
			);
		} );
	} );

	it( 'moves a conversation to spam', async () => {
		const props = baseProps();
		render( <MailboxView { ...props } /> );
		fireEvent.click( screen.getAllByText( 'Move to Spam' )[ 0 ] );
		await waitFor( () => {
			expect( apiFetch ).toHaveBeenCalledWith(
				expect.objectContaining( {
					data: { is_spam: 1 },
				} )
			);
		} );
	} );

	it( 'moves a conversation to trash', async () => {
		const props = baseProps();
		render( <MailboxView { ...props } /> );
		fireEvent.click( screen.getAllByText( 'Move to Trash' )[ 0 ] );
		await waitFor( () => {
			expect( apiFetch ).toHaveBeenCalledWith(
				expect.objectContaining( {
					data: { is_deleted: 1 },
				} )
			);
		} );
	} );

	it( 'offers restore and delete in the trash folder', async () => {
		const props = baseProps();
		render( <MailboxView { ...props } /> );
		fireEvent.click( screen.getByText( 'Trash' ) );

		await waitFor( () =>
			expect( props.fetchTickets ).toHaveBeenCalledWith(
				expect.objectContaining( { folder: 'trash' } )
			)
		);

		fireEvent.click( screen.getAllByText( 'Restore' )[ 0 ] );
		await waitFor( () => {
			expect( apiFetch ).toHaveBeenCalledWith(
				expect.objectContaining( {
					data: { is_deleted: 0 },
				} )
			);
		} );

		fireEvent.click( screen.getAllByText( 'Delete Permanently' )[ 0 ] );
		expect( props.handleDelete ).toHaveBeenCalledWith(
			expect.objectContaining( { id: 3 } )
		);
	} );

	it( 'marks a spam conversation as not spam', async () => {
		const props = baseProps();
		render( <MailboxView { ...props } /> );
		fireEvent.click( screen.getByText( 'Spam' ) );

		await waitFor( () =>
			expect( props.fetchTickets ).toHaveBeenCalledWith(
				expect.objectContaining( { folder: 'spam' } )
			)
		);

		fireEvent.click( screen.getAllByText( 'Not Spam' )[ 0 ] );
		await waitFor( () => {
			expect( apiFetch ).toHaveBeenCalledWith(
				expect.objectContaining( {
					data: { is_spam: 0 },
				} )
			);
		} );
	} );

	it( 'refetches the page after an update', async () => {
		const props = baseProps();
		render( <MailboxView { ...props } /> );
		props.fetchTickets.mockClear();
		fireEvent.click( screen.getAllByText( 'Move to Trash' )[ 0 ] );
		await waitFor( () => {
			expect( props.fetchTickets ).toHaveBeenCalledWith(
				expect.objectContaining( {
					mailbox_id: 1,
					folder: 'unassigned',
					page: 1,
					per_page: 20,
				} )
			);
		} );
	} );

	it( 'notifies when an update fails', async () => {
		const props = baseProps();
		apiFetch.mockRejectedValue( new Error( 'nope' ) );
		render( <MailboxView { ...props } /> );
		fireEvent.click( screen.getAllByText( 'Move to Spam' )[ 0 ] );
		await waitFor( () => {
			expect( props.addSnackbar ).toHaveBeenCalledWith(
				expect.stringMatching( /Failed to update the conversation/i )
			);
		} );
	} );

	it( 'notifies when a bulk action fails', async () => {
		const props = baseProps();
		apiFetch.mockRejectedValue( new Error( 'nope' ) );
		render( <MailboxView { ...props } /> );
		fireEvent.click( screen.getByLabelText( 'Select 3' ) );
		const bulk = screen.getByTestId( 'bulk-footer' );
		fireEvent.click(
			[ ...bulk.querySelectorAll( 'button' ) ].find( ( b ) =>
				/Move to Trash/i.test( b.textContent )
			)
		);
		await waitFor( () => {
			expect( props.addSnackbar ).toHaveBeenCalledWith(
				expect.stringMatching( /Bulk action failed/i )
			);
		} );
	} );

	it( 'bulk restores from the trash folder', async () => {
		const props = baseProps();
		render( <MailboxView { ...props } /> );
		fireEvent.click( screen.getByText( 'Trash' ) );
		await waitFor( () =>
			expect( props.fetchTickets ).toHaveBeenCalledWith(
				expect.objectContaining( { folder: 'trash' } )
			)
		);

		fireEvent.click( screen.getByLabelText( 'Select 3' ) );
		fireEvent.click(
			[
				...screen
					.getByTestId( 'bulk-footer' )
					.querySelectorAll( 'button' ),
			].find( ( b ) => /Restore/i.test( b.textContent ) )
		);
		await waitFor( () => {
			expect( apiFetch ).toHaveBeenCalledWith(
				expect.objectContaining( {
					path: '/sahajanand-erp/v1/helpdesk/tickets/bulk',
					data: expect.objectContaining( {
						action: 'restore',
						ids: [ 3 ],
					} ),
				} )
			);
		} );
	} );

	it( 'bulk marks spam conversations as not spam', async () => {
		const props = baseProps();
		render( <MailboxView { ...props } /> );
		fireEvent.click( screen.getByText( 'Spam' ) );
		await waitFor( () =>
			expect( props.fetchTickets ).toHaveBeenCalledWith(
				expect.objectContaining( { folder: 'spam' } )
			)
		);

		fireEvent.click( screen.getByLabelText( 'Select 3' ) );
		fireEvent.click(
			[
				...screen
					.getByTestId( 'bulk-footer' )
					.querySelectorAll( 'button' ),
			].find( ( b ) => /Not Spam/i.test( b.textContent ) )
		);
		await waitFor( () => {
			expect( apiFetch ).toHaveBeenCalledWith(
				expect.objectContaining( {
					data: expect.objectContaining( {
						action: 'spam',
						value: 0,
					} ),
				} )
			);
		} );
	} );

	it( 'refetches after leaving ticket detail', async () => {
		const props = baseProps();
		render( <MailboxView { ...props } /> );
		fireEvent.click( screen.getAllByText( 'View Conversation' )[ 0 ] );
		props.fetchTickets.mockClear();
		fireEvent.click( screen.getByText( 'Back' ) );
		await waitFor( () => {
			expect( props.fetchTickets ).toHaveBeenCalledWith(
				expect.objectContaining( { mailbox_id: 1 } )
			);
		} );
	} );
} );
