/**
 * MailboxesList tests
 */
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import apiFetch from '@wordpress/api-fetch';
import MailboxesList from '../../../src/modules/helpdesk/components/MailboxesList';

jest.mock( '@wordpress/api-fetch' );
jest.mock( '../../../src/components/EditModal', () => {
	const React = require( 'react' );
	return ( { isOpen, onSave, title, customActions } ) =>
		isOpen
			? React.createElement(
					'div',
					{ role: 'dialog' },
					title,
					customActions
						? customActions( { imap_host: 'imap.example.com' } )
						: null,
					React.createElement(
						'button',
						{
							type: 'button',
							onClick: () =>
								onSave( {
									name: 'New Box',
									email_address: 'n@example.com',
								} ),
						},
						'Save Modal'
					)
				)
			: null;
} );

describe( 'MailboxesList', () => {
	const addSnackbar = jest.fn();

	beforeEach( () => {
		apiFetch.mockReset();
		addSnackbar.mockReset();
		apiFetch.mockImplementation( ( args ) => {
			if ( ! args.method ) {
				return Promise.resolve( [
					{
						id: 1,
						name: 'Support',
						email_address: 'support@example.com',
					},
				] );
			}
			if ( args.path.includes( 'test-connection' ) ) {
				return Promise.resolve( { success: true } );
			}
			return Promise.resolve( { id: 2, message: 'ok' } );
		} );
	} );

	it( 'loads and lists mailboxes', async () => {
		render( <MailboxesList addSnackbar={ addSnackbar } /> );
		await waitFor( () => {
			expect( screen.getByText( 'Support' ) ).toBeInTheDocument();
		} );
	} );

	it( 'shows snackbar on fetch failure', async () => {
		apiFetch.mockRejectedValueOnce( new Error( 'fail' ) );
		render( <MailboxesList addSnackbar={ addSnackbar } /> );
		await waitFor( () => {
			expect( addSnackbar ).toHaveBeenCalledWith(
				expect.stringMatching( /Failed to fetch mailboxes/i )
			);
		} );
	} );

	it( 'opens create modal and saves mailbox', async () => {
		render( <MailboxesList addSnackbar={ addSnackbar } /> );
		await waitFor( () => screen.getByText( 'Support' ) );
		const addButton = screen.getByRole( 'button', {
			name: /add|new|create/i,
		} );
		fireEvent.click( addButton );
		await waitFor( () => screen.getByText( 'Save Modal' ) );
		fireEvent.click( screen.getByText( 'Save Modal' ) );
		await waitFor( () => {
			expect( apiFetch ).toHaveBeenCalledWith(
				expect.objectContaining( {
					path: '/sahajanand-erp/v1/helpdesk/mailboxes',
					method: 'POST',
				} )
			);
		} );
	} );

	it( 'updates an existing mailbox through the edit action', async () => {
		render( <MailboxesList addSnackbar={ addSnackbar } /> );
		await waitFor( () => screen.getByText( 'Support' ) );
		fireEvent.click(
			[
				...screen
					.getByTestId( 'dataviews' )
					.querySelectorAll( 'button' ),
			].find( ( b ) => b.textContent === 'Edit' )
		);
		await waitFor( () =>
			expect( screen.getByRole( 'dialog' ) ).toHaveTextContent(
				'Edit Mailbox'
			)
		);
		fireEvent.click( screen.getByText( 'Save Modal' ) );
		await waitFor( () => {
			expect( apiFetch ).toHaveBeenCalledWith(
				expect.objectContaining( {
					path: '/sahajanand-erp/v1/helpdesk/mailboxes/1',
					method: 'POST',
				} )
			);
		} );
	} );

	it( 'confirms before deleting a mailbox', async () => {
		apiFetch.mockImplementation( ( args ) => {
			if ( args.method === 'DELETE' ) {
				return Promise.resolve( { message: 'Mailbox deleted.' } );
			}
			if ( args.method ) {
				return Promise.resolve( { id: 2, message: 'ok' } );
			}
			return Promise.resolve( [
				{
					id: 1,
					name: 'Support',
					email_address: 'support@example.com',
				},
			] );
		} );

		render( <MailboxesList addSnackbar={ addSnackbar } /> );
		await waitFor( () => screen.getByText( 'Support' ) );
		fireEvent.click(
			[
				...screen
					.getByTestId( 'dataviews' )
					.querySelectorAll( 'button' ),
			].find( ( b ) => b.textContent === 'Delete' )
		);

		await waitFor( () =>
			expect( screen.getByRole( 'alertdialog' ) ).toHaveTextContent(
				/Are you sure you want to delete this mailbox/i
			)
		);
		const dialog = screen.getByRole( 'alertdialog' );
		fireEvent.click(
			[ ...dialog.querySelectorAll( 'button' ) ].find(
				( b ) => b.textContent === 'Delete'
			)
		);
		await waitFor( () => {
			expect( apiFetch ).toHaveBeenCalledWith(
				expect.objectContaining( {
					path: '/sahajanand-erp/v1/helpdesk/mailboxes/1',
					method: 'DELETE',
				} )
			);
		} );
	} );

	it( 'reports a successful connection test', async () => {
		render( <MailboxesList addSnackbar={ addSnackbar } /> );
		await waitFor( () => screen.getByText( 'Support' ) );
		fireEvent.click(
			screen.getByRole( 'button', { name: /add|new|create/i } )
		);
		await waitFor( () => screen.getByText( 'Test Connection' ) );
		fireEvent.click( screen.getByText( 'Test Connection' ) );

		await waitFor( () => {
			expect( apiFetch ).toHaveBeenCalledWith(
				expect.objectContaining( {
					path: '/sahajanand-erp/v1/helpdesk/mailboxes/test-connection',
					method: 'POST',
					data: expect.objectContaining( {
						imap_host: 'imap.example.com',
					} ),
				} )
			);
		} );
		expect( addSnackbar ).toHaveBeenCalledWith(
			expect.stringMatching( /Connection successful/i )
		);
	} );

	it( 'reports a failed connection test', async () => {
		apiFetch.mockImplementation( ( args ) => {
			if ( args.path.includes( 'test-connection' ) ) {
				return Promise.resolve( {
					success: false,
					error: 'IMAP: connection refused | SMTP: timeout',
				} );
			}
			if ( ! args.method ) {
				return Promise.resolve( [
					{
						id: 1,
						name: 'Support',
						email_address: 'support@example.com',
					},
				] );
			}
			return Promise.resolve( { id: 2 } );
		} );

		render( <MailboxesList addSnackbar={ addSnackbar } /> );
		await waitFor( () => screen.getByText( 'Support' ) );
		fireEvent.click(
			screen.getByRole( 'button', { name: /add|new|create/i } )
		);
		await waitFor( () => screen.getByText( 'Test Connection' ) );
		fireEvent.click( screen.getByText( 'Test Connection' ) );

		await waitFor( () => {
			expect( addSnackbar ).toHaveBeenCalledWith(
				expect.stringMatching(
					/Connection failed: IMAP: connection refused/i
				)
			);
		} );
	} );

	it( 'reports a thrown connection test error', async () => {
		apiFetch.mockImplementation( ( args ) => {
			if ( args.path.includes( 'test-connection' ) ) {
				return Promise.reject( new Error( 'Socket hangup' ) );
			}
			if ( ! args.method ) {
				return Promise.resolve( [
					{
						id: 1,
						name: 'Support',
						email_address: 'support@example.com',
					},
				] );
			}
			return Promise.resolve( { id: 2 } );
		} );

		render( <MailboxesList addSnackbar={ addSnackbar } /> );
		await waitFor( () => screen.getByText( 'Support' ) );
		fireEvent.click(
			screen.getByRole( 'button', { name: /add|new|create/i } )
		);
		await waitFor( () => screen.getByText( 'Test Connection' ) );
		fireEvent.click( screen.getByText( 'Test Connection' ) );

		await waitFor( () => {
			expect( addSnackbar ).toHaveBeenCalledWith(
				expect.stringMatching(
					/Error testing connection: Socket hangup/i
				)
			);
		} );
	} );

	it( 'reports a save failure', async () => {
		apiFetch.mockImplementation( ( args ) => {
			if ( args.method ) {
				return Promise.reject( new Error( 'Save rejected' ) );
			}
			return Promise.resolve( [
				{
					id: 1,
					name: 'Support',
					email_address: 'support@example.com',
				},
			] );
		} );

		render( <MailboxesList addSnackbar={ addSnackbar } /> );
		await waitFor( () => screen.getByText( 'Support' ) );
		fireEvent.click(
			screen.getByRole( 'button', { name: /add|new|create/i } )
		);
		await waitFor( () => screen.getByText( 'Save Modal' ) );
		fireEvent.click( screen.getByText( 'Save Modal' ) );

		await waitFor( () => {
			expect( addSnackbar ).toHaveBeenCalledWith(
				expect.stringMatching( /Error saving mailbox: Save rejected/i )
			);
		} );
	} );
} );
