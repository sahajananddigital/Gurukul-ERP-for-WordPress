/**
 * SavedRepliesList tests
 */
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import apiFetch from '@wordpress/api-fetch';
import SavedRepliesList from '../../../src/modules/helpdesk/components/SavedRepliesList';

jest.mock( '@wordpress/api-fetch' );
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
								onSave( {
									title: 'Greeting',
									content: 'Hello',
								} ),
						},
						'Save Modal'
					)
				)
			: null;
} );

describe( 'SavedRepliesList', () => {
	const addSnackbar = jest.fn();

	const replies = [
		{ id: 1, title: 'Greeting', content: 'Hello' },
		{
			id: 2,
			title: 'Long note',
			content: 'x'.repeat( 80 ),
		},
	];

	const listApi = ( args ) => {
		if ( ! args.method ) {
			return Promise.resolve( replies );
		}
		return Promise.resolve( { id: 3, message: 'ok' } );
	};

	beforeEach( () => {
		apiFetch.mockReset();
		addSnackbar.mockReset();
		apiFetch.mockImplementation( listApi );
	} );

	it( 'lists saved replies', async () => {
		render( <SavedRepliesList addSnackbar={ addSnackbar } /> );
		await waitFor( () => {
			expect( screen.getByText( 'Greeting' ) ).toBeInTheDocument();
		} );
	} );

	it( 'shows a spinner while loading', () => {
		apiFetch.mockImplementation( () => new Promise( () => {} ) );
		render( <SavedRepliesList addSnackbar={ addSnackbar } /> );
		expect( screen.getByTestId( 'spinner' ) ).toBeInTheDocument();
	} );

	it( 'handles fetch errors', async () => {
		apiFetch.mockRejectedValue( new Error( 'nope' ) );
		render( <SavedRepliesList addSnackbar={ addSnackbar } /> );
		await waitFor( () => {
			expect( addSnackbar ).toHaveBeenCalledWith(
				expect.stringMatching( /Failed to fetch saved replies/i )
			);
		} );
	} );

	it( 'creates a saved reply', async () => {
		render( <SavedRepliesList addSnackbar={ addSnackbar } /> );
		await waitFor( () => screen.getByText( 'Greeting' ) );
		fireEvent.click(
			screen.getByRole( 'button', { name: /add saved reply/i } )
		);
		await waitFor( () => screen.getByText( 'Save Modal' ) );
		fireEvent.click( screen.getByText( 'Save Modal' ) );

		await waitFor( () => {
			expect( apiFetch ).toHaveBeenCalledWith(
				expect.objectContaining( {
					path: '/sahajanand-erp/v1/helpdesk/saved-replies',
					method: 'POST',
				} )
			);
		} );
	} );

	it( 'updates a saved reply through the edit action', async () => {
		render( <SavedRepliesList addSnackbar={ addSnackbar } /> );
		await waitFor( () => screen.getByText( 'Greeting' ) );
		fireEvent.click(
			[
				...screen
					.getByTestId( 'dataviews' )
					.querySelectorAll( 'button' ),
			].find( ( b ) => b.textContent === 'Edit' )
		);
		await waitFor( () =>
			expect( screen.getByRole( 'dialog' ) ).toHaveTextContent(
				'Edit Saved Reply'
			)
		);
		fireEvent.click( screen.getByText( 'Save Modal' ) );

		await waitFor( () => {
			expect( apiFetch ).toHaveBeenCalledWith(
				expect.objectContaining( {
					path: '/sahajanand-erp/v1/helpdesk/saved-replies/1',
					method: 'POST',
				} )
			);
		} );
	} );

	it( 'confirms before deleting a saved reply', async () => {
		apiFetch.mockImplementation( ( args ) => {
			if ( args.method === 'DELETE' ) {
				return Promise.resolve( { message: 'Saved Reply deleted.' } );
			}
			return listApi( args );
		} );

		render( <SavedRepliesList addSnackbar={ addSnackbar } /> );
		await waitFor( () => screen.getByText( 'Greeting' ) );
		fireEvent.click(
			[
				...screen
					.getByTestId( 'dataviews' )
					.querySelectorAll( 'button' ),
			].find( ( b ) => b.textContent === 'Delete' )
		);

		await waitFor( () =>
			expect( screen.getByRole( 'alertdialog' ) ).toHaveTextContent(
				/Are you sure you want to delete this saved reply/i
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
					path: '/sahajanand-erp/v1/helpdesk/saved-replies/1',
					method: 'DELETE',
				} )
			);
		} );
	} );

	it( 'reports a delete failure', async () => {
		apiFetch.mockImplementation( ( args ) => {
			if ( args.method === 'DELETE' ) {
				return Promise.reject( new Error( 'locked' ) );
			}
			return listApi( args );
		} );

		render( <SavedRepliesList addSnackbar={ addSnackbar } /> );
		await waitFor( () => screen.getByText( 'Greeting' ) );
		fireEvent.click(
			[
				...screen
					.getByTestId( 'dataviews' )
					.querySelectorAll( 'button' ),
			].find( ( b ) => b.textContent === 'Delete' )
		);
		await waitFor( () => screen.getByRole( 'alertdialog' ) );
		const dialog = screen.getByRole( 'alertdialog' );
		fireEvent.click(
			[ ...dialog.querySelectorAll( 'button' ) ].find(
				( b ) => b.textContent === 'Delete'
			)
		);

		await waitFor( () => {
			expect( addSnackbar ).toHaveBeenCalledWith(
				expect.stringMatching( /Error deleting reply/i )
			);
		} );
	} );

	it( 'reports a save failure', async () => {
		apiFetch.mockImplementation( ( args ) => {
			if ( args.method === 'POST' ) {
				return Promise.reject( new Error( 'rejected' ) );
			}
			return listApi( args );
		} );

		render( <SavedRepliesList addSnackbar={ addSnackbar } /> );
		await waitFor( () => screen.getByText( 'Greeting' ) );
		fireEvent.click(
			screen.getByRole( 'button', { name: /add saved reply/i } )
		);
		await waitFor( () => screen.getByText( 'Save Modal' ) );
		fireEvent.click( screen.getByText( 'Save Modal' ) );

		await waitFor( () => {
			expect( addSnackbar ).toHaveBeenCalledWith(
				expect.stringMatching( /Error saving reply/i )
			);
		} );
	} );
} );
