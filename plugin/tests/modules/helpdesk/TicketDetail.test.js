/**
 * TicketDetail tests
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import apiFetch from '@wordpress/api-fetch';
import TicketDetail from '../../../src/modules/helpdesk/components/TicketDetail';

jest.mock( '@wordpress/api-fetch' );
jest.mock( '../../../src/components/EditModal', () => {
	const React = require( 'react' );
	return ( { isOpen, title, onSave } ) =>
		isOpen
			? React.createElement(
					'div',
					null,
					title,
					React.createElement(
						'button',
						{
							type: 'button',
							onClick: () =>
								onSave( {
									first_name: 'Ada',
									last_name: 'Lovelace',
								} ),
						},
						'Save Modal'
					)
				)
			: null;
} );
jest.mock( '../../../src/components/WPEditor', () => {
	const React = require( 'react' );
	return ( { value, onChange, placeholder } ) =>
		React.createElement( 'textarea', {
			'aria-label': placeholder || 'editor',
			value,
			onChange: ( e ) => onChange( e.target.value ),
		} );
} );

const mockMediaFrame = () => {
	const handlers = {};
	window.wp.media = jest.fn( () => ( {
		on: ( event, cb ) => {
			handlers[ event ] = cb;
		},
		state: () => ( {
			get: () => [
				{ toJSON: () => ( { id: 77, filename: 'shot.png' } ) },
			],
		} ),
		// A real frame emits "select" once the user picks files and confirms.
		open: () => handlers.select && handlers.select(),
	} ) );
	return window.wp.media;
};

describe( 'TicketDetail', () => {
	const addSnackbar = jest.fn();
	const onBack = jest.fn();

	const ticket = {
		id: 3,
		ticket_no: '#3',
		subject: 'Broken printer',
		description: '<p>Help</p>',
		status: 'open',
		priority: 'medium',
		assignee_id: '',
		contact_id: 9,
		attachments: [
			{
				id: 8,
				filename: 'photo.pdf',
				url: 'http://example.com/photo.pdf',
			},
		],
	};

	const contact = {
		id: 9,
		first_name: 'Ada',
		last_name: 'Lovelace',
		email: 'ada@example.com',
		phone: '555',
		company: 'Analytical',
		city: 'London',
		country: 'UK',
	};

	beforeEach( () => {
		apiFetch.mockReset();
		addSnackbar.mockReset();
		onBack.mockReset();
		apiFetch.mockImplementation( ( args ) => {
			const path = args.path || '';
			if ( path.match( /\/helpdesk\/tickets\/3$/ ) && ! args.method ) {
				return Promise.resolve( ticket );
			}
			if ( path.includes( '/replies' ) && ! args.method ) {
				return Promise.resolve( [
					{
						id: 1,
						message: '<p>Customer message</p>',
						is_note: 0,
						user_id: '0',
						created_at: '2026-01-01T00:00:00',
						attachments: [],
					},
				] );
			}
			if ( path.includes( '/wp/v2/users' ) ) {
				return Promise.resolve( [ { id: 1, name: 'Admin' } ] );
			}
			if ( path.includes( '/saved-replies' ) ) {
				return Promise.resolve( [
					{ id: 1, title: 'Thanks', content: 'Thank you!' },
				] );
			}
			if ( path.includes( '/crm/contacts/9' ) && ! args.method ) {
				return Promise.resolve( contact );
			}
			if ( args.method === 'POST' && path.includes( '/replies' ) ) {
				return Promise.resolve( {
					id: 99,
					message: '<p>ok</p>',
					is_note: args.data?.is_note ? 1 : 0,
					user_id: '1',
					created_at: '2026-01-02T00:00:00',
					attachments: [],
				} );
			}
			if ( args.method === 'POST' ) {
				return Promise.resolve( {} );
			}
			return Promise.resolve( {} );
		} );
	} );

	it( 'loads ticket details and contact', async () => {
		render(
			<TicketDetail
				ticketId={ 3 }
				onBack={ onBack }
				addSnackbar={ addSnackbar }
			/>
		);
		await waitFor( () => {
			expect(
				screen.getByText( /#3 - Broken printer/ )
			).toBeInTheDocument();
		} );
		expect( screen.getByText( /Ada/ ) ).toBeInTheDocument();
		expect( screen.getAllByText( 'photo.pdf' ).length ).toBeGreaterThan(
			0
		);
		expect( screen.getByText( /Customer message/ ) ).toBeInTheDocument();
	} );

	it( 'sends a reply', async () => {
		render(
			<TicketDetail
				ticketId={ 3 }
				onBack={ onBack }
				addSnackbar={ addSnackbar }
			/>
		);
		await waitFor( () => screen.getByText( /Broken printer/ ) );
		fireEvent.change( screen.getByLabelText( /Type your reply/i ), {
			target: { value: 'We are on it' },
		} );
		fireEvent.click(
			screen.getByRole( 'button', { name: /Send Reply/i } )
		);
		await waitFor( () => {
			expect( apiFetch ).toHaveBeenCalledWith(
				expect.objectContaining( {
					path: '/sahajanand-erp/v1/helpdesk/tickets/3/replies',
					method: 'POST',
					data: expect.objectContaining( {
						message: 'We are on it',
						is_note: false,
					} ),
				} )
			);
		} );
		expect( addSnackbar ).toHaveBeenCalled();
	} );

	it( 'adds an internal note', async () => {
		render(
			<TicketDetail
				ticketId={ 3 }
				onBack={ onBack }
				addSnackbar={ addSnackbar }
			/>
		);
		await waitFor( () => screen.getByText( /Broken printer/ ) );
		fireEvent.click( screen.getByRole( 'button', { name: /^Note$/i } ) );
		fireEvent.change( screen.getByLabelText( /internal note/i ), {
			target: { value: 'Private note' },
		} );
		fireEvent.click( screen.getByRole( 'button', { name: /Add Note/i } ) );
		await waitFor( () => {
			expect( apiFetch ).toHaveBeenCalledWith(
				expect.objectContaining( {
					path: '/sahajanand-erp/v1/helpdesk/tickets/3/replies',
					method: 'POST',
					data: expect.objectContaining( {
						message: 'Private note',
						is_note: true,
					} ),
				} )
			);
		} );
	} );

	it( 'updates status via properties panel', async () => {
		render(
			<TicketDetail
				ticketId={ 3 }
				onBack={ onBack }
				addSnackbar={ addSnackbar }
			/>
		);
		await waitFor( () => screen.getByLabelText( /Status/i ) );
		fireEvent.change( screen.getByLabelText( /Status/i ), {
			target: { value: 'closed' },
		} );
		await waitFor( () => {
			expect( apiFetch ).toHaveBeenCalledWith(
				expect.objectContaining( {
					path: '/sahajanand-erp/v1/helpdesk/tickets/3',
					method: 'POST',
					data: { status: 'closed' },
				} )
			);
		} );
	} );

	it( 'detaches attachment from sidebar', async () => {
		render(
			<TicketDetail
				ticketId={ 3 }
				onBack={ onBack }
				addSnackbar={ addSnackbar }
			/>
		);
		await waitFor( () =>
			expect( screen.getAllByText( 'photo.pdf' ).length ).toBeGreaterThan(
				0
			)
		);
		const removeButtons = screen.getAllByRole( 'button', {
			name: /Remove/i,
		} );
		fireEvent.click( removeButtons[ removeButtons.length - 1 ] );
		await waitFor( () => {
			expect( apiFetch ).toHaveBeenCalledWith(
				expect.objectContaining( {
					path: '/sahajanand-erp/v1/helpdesk/tickets/3',
					method: 'POST',
					data: { attachment_ids: [] },
				} )
			);
		} );
	} );

	it( 'calls onBack', async () => {
		render(
			<TicketDetail
				ticketId={ 3 }
				onBack={ onBack }
				addSnackbar={ addSnackbar }
			/>
		);
		await waitFor( () => screen.getByText( /Back/i ) );
		fireEvent.click( screen.getByText( /Back/i ) );
		expect( onBack ).toHaveBeenCalled();
	} );

	it( 'handles load failure', async () => {
		apiFetch.mockRejectedValueOnce( new Error( 'boom' ) );
		render(
			<TicketDetail
				ticketId={ 3 }
				onBack={ onBack }
				addSnackbar={ addSnackbar }
			/>
		);
		await waitFor( () => {
			expect( addSnackbar ).toHaveBeenCalledWith(
				expect.stringMatching( /Failed to load ticket/i )
			);
		} );
	} );

	it( 'inserts a saved reply', async () => {
		render(
			<TicketDetail
				ticketId={ 3 }
				onBack={ onBack }
				addSnackbar={ addSnackbar }
			/>
		);
		await waitFor( () => screen.getByText( /Insert Saved Reply/i ) );
		fireEvent.click( screen.getByText( /Insert Saved Reply/i ) );
		await waitFor( () => screen.getByText( 'Thanks' ) );
		fireEvent.click( screen.getByText( 'Thanks' ) );
		expect( screen.getByLabelText( /Type your reply/i ).value ).toContain(
			'Thank you!'
		);
	} );

	it( 'appends a saved reply after existing draft text', async () => {
		render(
			<TicketDetail
				ticketId={ 3 }
				onBack={ onBack }
				addSnackbar={ addSnackbar }
			/>
		);
		await waitFor( () => screen.getByText( /Insert Saved Reply/i ) );
		fireEvent.change( screen.getByLabelText( /Type your reply/i ), {
			target: { value: 'Hi there,' },
		} );
		fireEvent.click( screen.getByText( /Insert Saved Reply/i ) );
		await waitFor( () => screen.getByText( 'Thanks' ) );
		fireEvent.click( screen.getByText( 'Thanks' ) );
		expect( screen.getByLabelText( /Type your reply/i ).value ).toBe(
			'Hi there,\n\nThank you!'
		);
	} );

	it( 'reports when there are no saved replies', async () => {
		apiFetch.mockImplementation( ( args ) => {
			const path = args.path || '';
			if ( path.includes( '/saved-replies' ) ) {
				return Promise.resolve( [] );
			}
			if ( path.match( /\/helpdesk\/tickets\/3$/ ) && ! args.method ) {
				return Promise.resolve( ticket );
			}
			if ( path.includes( '/replies' ) && ! args.method ) {
				return Promise.resolve( [] );
			}
			if ( path.includes( '/wp/v2/users' ) ) {
				return Promise.resolve( [ { id: 1, name: 'Admin' } ] );
			}
			if ( path.includes( '/crm/contacts/9' ) && ! args.method ) {
				return Promise.resolve( contact );
			}
			return Promise.resolve( {} );
		} );

		render(
			<TicketDetail
				ticketId={ 3 }
				onBack={ onBack }
				addSnackbar={ addSnackbar }
			/>
		);
		await waitFor( () => screen.getByText( /Insert Saved Reply/i ) );
		fireEvent.click( screen.getByText( /Insert Saved Reply/i ) );
		await waitFor( () => {
			expect( screen.getByRole( 'dialog' ) ).toHaveTextContent(
				/No saved replies found/i
			);
		} );
	} );

	it( 'disables inserting saved replies while writing a note', async () => {
		render(
			<TicketDetail
				ticketId={ 3 }
				onBack={ onBack }
				addSnackbar={ addSnackbar }
			/>
		);
		await waitFor( () => screen.getByText( /Insert Saved Reply/i ) );
		fireEvent.click( screen.getByRole( 'button', { name: /^Note$/i } ) );
		await waitFor( () => {
			expect(
				screen.getByRole( 'button', { name: /Insert Saved Reply/i } )
			).toBeDisabled();
		} );
	} );

	it( 'renders internal notes as warnings and agent replies by author', async () => {
		apiFetch.mockImplementation( ( args ) => {
			const path = args.path || '';
			if ( path.match( /\/helpdesk\/tickets\/3$/ ) && ! args.method ) {
				return Promise.resolve( ticket );
			}
			if ( path.includes( '/replies' ) && ! args.method ) {
				return Promise.resolve( [
					{
						id: 1,
						message: '<p>Note body</p>',
						is_note: 1,
						user_id: '1',
						created_at: '2026-01-01T00:00:00',
						attachments: [],
					},
					{
						id: 2,
						message: '<p>Agent body</p>',
						is_note: 0,
						user_id: '1',
						created_at: '2026-01-01T00:00:00',
						attachments: [],
					},
				] );
			}
			if ( path.includes( '/wp/v2/users' ) ) {
				return Promise.resolve( [ { id: 1, name: 'Admin' } ] );
			}
			if ( path.includes( '/saved-replies' ) ) {
				return Promise.resolve( [] );
			}
			if ( path.includes( '/crm/contacts/9' ) && ! args.method ) {
				return Promise.resolve( contact );
			}
			return Promise.resolve( {} );
		} );

		render(
			<TicketDetail
				ticketId={ 3 }
				onBack={ onBack }
				addSnackbar={ addSnackbar }
			/>
		);
		await waitFor( () => screen.getByText( /Internal Note by Agent/i ) );
		expect( screen.getByText( /Agent Reply/i ) ).toBeInTheDocument();
		expect( screen.getByText( /Note body/i ) ).toBeInTheDocument();
	} );

	it( 'does not send an empty reply', async () => {
		render(
			<TicketDetail
				ticketId={ 3 }
				onBack={ onBack }
				addSnackbar={ addSnackbar }
			/>
		);
		await waitFor( () => screen.getByText( /Broken printer/i ) );
		apiFetch.mockClear();
		fireEvent.click(
			screen.getByRole( 'button', { name: /Send Reply/i } )
		);
		expect(
			apiFetch.mock.calls.filter(
				( [ args ] ) =>
					args.method === 'POST' && args.path.includes( '/replies' )
			)
		).toHaveLength( 0 );
	} );

	it( 'does not POST the reply when the draft is only whitespace', async () => {
		render(
			<TicketDetail
				ticketId={ 3 }
				onBack={ onBack }
				addSnackbar={ addSnackbar }
			/>
		);
		await waitFor( () => screen.getByText( /Broken printer/i ) );
		fireEvent.change( screen.getByLabelText( /Type your reply/i ), {
			target: { value: '   ' },
		} );
		apiFetch.mockClear();
		fireEvent.click(
			screen.getByRole( 'button', { name: /Send Reply/i } )
		);
		expect(
			apiFetch.mock.calls.filter(
				( [ args ] ) =>
					args.method === 'POST' && args.path.includes( '/replies' )
			)
		).toHaveLength( 0 );
	} );

	it( 'flips the ticket to pending after a public reply', async () => {
		render(
			<TicketDetail
				ticketId={ 3 }
				onBack={ onBack }
				addSnackbar={ addSnackbar }
			/>
		);
		await waitFor( () => screen.getByText( /Broken printer/i ) );
		fireEvent.change( screen.getByLabelText( /Type your reply/i ), {
			target: { value: 'On it' },
		} );
		fireEvent.click(
			screen.getByRole( 'button', { name: /Send Reply/i } )
		);

		await waitFor( () => {
			expect( apiFetch ).toHaveBeenCalledWith(
				expect.objectContaining( {
					path: '/sahajanand-erp/v1/helpdesk/tickets/3',
					method: 'POST',
					data: { status: 'pending' },
				} )
			);
		} );
	} );

	it( 'keeps status when adding a note', async () => {
		render(
			<TicketDetail
				ticketId={ 3 }
				onBack={ onBack }
				addSnackbar={ addSnackbar }
			/>
		);
		await waitFor( () => screen.getByText( /Broken printer/i ) );
		fireEvent.click( screen.getByRole( 'button', { name: /^Note$/i } ) );
		fireEvent.change( screen.getByLabelText( /internal note/i ), {
			target: { value: 'Only for us' },
		} );
		fireEvent.click( screen.getByRole( 'button', { name: /Add Note/i } ) );

		await waitFor( () => {
			expect(
				apiFetch.mock.calls.filter(
					( [ args ] ) =>
						args.method === 'POST' &&
						args.path === '/sahajanand-erp/v1/helpdesk/tickets/3'
				)
			).toHaveLength( 0 );
		} );
	} );

	it( 'updates priority and assignee', async () => {
		render(
			<TicketDetail
				ticketId={ 3 }
				onBack={ onBack }
				addSnackbar={ addSnackbar }
			/>
		);
		await waitFor( () => screen.getByLabelText( /Priority/i ) );
		fireEvent.change( screen.getByLabelText( /Priority/i ), {
			target: { value: 'high' },
		} );
		await waitFor( () => {
			expect( apiFetch ).toHaveBeenCalledWith(
				expect.objectContaining( {
					data: { priority: 'high' },
				} )
			);
		} );

		fireEvent.change( screen.getByLabelText( /Assignee/i ), {
			target: { value: '1' },
		} );
		await waitFor( () => {
			expect( apiFetch ).toHaveBeenCalledWith(
				expect.objectContaining( {
					data: { assignee_id: '1' },
				} )
			);
		} );
	} );

	it( 'reports a failed field update', async () => {
		apiFetch.mockImplementation( ( args ) => {
			if ( args.method === 'POST' ) {
				return Promise.reject( new Error( 'denied' ) );
			}
			const path = args.path || '';
			if ( path.match( /\/helpdesk\/tickets\/3$/ ) ) {
				return Promise.resolve( ticket );
			}
			if ( path.includes( '/replies' ) ) {
				return Promise.resolve( [] );
			}
			if ( path.includes( '/wp/v2/users' ) ) {
				return Promise.resolve( [ { id: 1, name: 'Admin' } ] );
			}
			if ( path.includes( '/saved-replies' ) ) {
				return Promise.resolve( [] );
			}
			if ( path.includes( '/crm/contacts/9' ) ) {
				return Promise.resolve( contact );
			}
			return Promise.resolve( {} );
		} );

		render(
			<TicketDetail
				ticketId={ 3 }
				onBack={ onBack }
				addSnackbar={ addSnackbar }
			/>
		);
		await waitFor( () => screen.getByLabelText( /Status/i ) );
		fireEvent.change( screen.getByLabelText( /Status/i ), {
			target: { value: 'closed' },
		} );
		await waitFor( () => {
			expect( addSnackbar ).toHaveBeenCalledWith(
				expect.stringMatching( /Failed to update status/i )
			);
		} );
	} );

	it( 'reports a failed reply', async () => {
		apiFetch.mockImplementation( ( args ) => {
			if ( args.method === 'POST' && args.path.includes( '/replies' ) ) {
				return Promise.reject( new Error( 'smtp down' ) );
			}
			const path = args.path || '';
			if ( path.match( /\/helpdesk\/tickets\/3$/ ) && ! args.method ) {
				return Promise.resolve( ticket );
			}
			if ( path.includes( '/replies' ) && ! args.method ) {
				return Promise.resolve( [] );
			}
			if ( path.includes( '/wp/v2/users' ) ) {
				return Promise.resolve( [ { id: 1, name: 'Admin' } ] );
			}
			if ( path.includes( '/saved-replies' ) ) {
				return Promise.resolve( [] );
			}
			if ( path.includes( '/crm/contacts/9' ) && ! args.method ) {
				return Promise.resolve( contact );
			}
			return Promise.resolve( {} );
		} );

		render(
			<TicketDetail
				ticketId={ 3 }
				onBack={ onBack }
				addSnackbar={ addSnackbar }
			/>
		);
		await waitFor( () => screen.getByText( /Broken printer/i ) );
		fireEvent.change( screen.getByLabelText( /Type your reply/i ), {
			target: { value: 'Hello' },
		} );
		fireEvent.click(
			screen.getByRole( 'button', { name: /Send Reply/i } )
		);
		await waitFor( () => {
			expect( addSnackbar ).toHaveBeenCalledWith(
				expect.stringMatching( /Failed to send reply/i )
			);
		} );
	} );

	it( 'warns when the media library is unavailable', async () => {
		render(
			<TicketDetail
				ticketId={ 3 }
				onBack={ onBack }
				addSnackbar={ addSnackbar }
			/>
		);
		await waitFor( () => screen.getByText( /Attach Files/i ) );
		fireEvent.click( screen.getByText( /Attach Files/i ) );
		await waitFor( () => {
			expect( addSnackbar ).toHaveBeenCalledWith(
				expect.stringMatching( /Media library is not available/i )
			);
		} );
	} );

	it( 'attaches picked media files and sends them with the reply', async () => {
		const media = mockMediaFrame();

		render(
			<TicketDetail
				ticketId={ 3 }
				onBack={ onBack }
				addSnackbar={ addSnackbar }
			/>
		);
		await waitFor( () => screen.getByText( /Attach Files/i ) );
		fireEvent.click( screen.getByText( /Attach Files/i ) );

		expect( media ).toHaveBeenCalled();
		await waitFor( () => screen.getByText( 'shot.png' ) );

		fireEvent.click(
			screen.getByRole( 'button', { name: /Send Reply/i } )
		);
		await waitFor( () => {
			expect( apiFetch ).toHaveBeenCalledWith(
				expect.objectContaining( {
					path: '/sahajanand-erp/v1/helpdesk/tickets/3/replies',
					data: expect.objectContaining( {
						attachment_ids: '77',
					} ),
				} )
			);
		} );

		window.wp.media = undefined;
	} );

	it( 'removes a staged attachment without calling the API', async () => {
		mockMediaFrame();

		render(
			<TicketDetail
				ticketId={ 3 }
				onBack={ onBack }
				addSnackbar={ addSnackbar }
			/>
		);
		await waitFor( () => screen.getByText( /Attach Files/i ) );
		fireEvent.click( screen.getByText( /Attach Files/i ) );
		await waitFor( () => screen.getByText( 'shot.png' ) );

		apiFetch.mockClear();
		const stagedRow = screen.getByText( 'shot.png' ).closest( 'div' );
		fireEvent.click(
			[ ...stagedRow.querySelectorAll( 'button' ) ].find(
				( b ) => b.textContent === 'Remove'
			)
		);
		await waitFor( () => {
			expect( screen.queryByText( 'shot.png' ) ).not.toBeInTheDocument();
		} );
		expect( apiFetch ).not.toHaveBeenCalled();

		window.wp.media = undefined;
	} );

	it( 'updates the CRM contact', async () => {
		render(
			<TicketDetail
				ticketId={ 3 }
				onBack={ onBack }
				addSnackbar={ addSnackbar }
			/>
		);
		await waitFor( () => screen.getByText( /Ada/ ) );
		fireEvent.click( screen.getByRole( 'button', { name: /^Edit$/i } ) );
		await waitFor( () => screen.getByText( 'Edit CRM Contact' ) );
		fireEvent.click( screen.getByText( 'Save Modal' ) );

		await waitFor( () => {
			expect( apiFetch ).toHaveBeenCalledWith(
				expect.objectContaining( {
					path: '/sahajanand-erp/v1/crm/contacts/9',
					method: 'POST',
				} )
			);
		} );
	} );
} );
