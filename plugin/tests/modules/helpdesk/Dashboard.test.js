/**
 * Helpdesk Dashboard tests
 */
import { render, screen, fireEvent } from '@testing-library/react';
import Dashboard from '../../../src/modules/helpdesk/components/Dashboard';

describe( 'Helpdesk Dashboard', () => {
	const mailboxes = [
		{ id: 1, name: 'Support', email_address: 'support@example.com' },
		{ id: 2, name: 'Sales', email_address: 'sales@example.com' },
	];

	const stats = [
		{
			id: 1,
			unassigned: 3,
			mine: 1,
			assigned: 2,
			closed: 4,
			total: 10,
		},
	];

	it( 'shows empty state when no mailboxes', () => {
		render(
			<Dashboard
				mailboxes={ [] }
				stats={ [] }
				onSelectMailbox={ jest.fn() }
			/>
		);
		expect( screen.getByText( /No mailboxes found/i ) ).toBeInTheDocument();
	} );

	it( 'renders mailbox cards with stats', () => {
		render(
			<Dashboard
				mailboxes={ mailboxes }
				stats={ stats }
				onSelectMailbox={ jest.fn() }
			/>
		);
		expect( screen.getByText( 'Support' ) ).toBeInTheDocument();
		expect( screen.getByText( 'support@example.com' ) ).toBeInTheDocument();
		expect( screen.getByText( '3' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Sales' ) ).toBeInTheDocument();
		expect( screen.getAllByText( '0' ).length ).toBeGreaterThan( 0 );
	} );

	it( 'calls onSelectMailbox when card clicked', () => {
		const onSelect = jest.fn();
		render(
			<Dashboard
				mailboxes={ mailboxes }
				stats={ stats }
				onSelectMailbox={ onSelect }
			/>
		);
		fireEvent.click( screen.getByText( 'Support' ).closest( 'div' ) );
		expect( onSelect ).toHaveBeenCalledWith( 1 );
	} );

	it( 'defaults counts to zero without stats', () => {
		render(
			<Dashboard
				mailboxes={ [ mailboxes[ 0 ] ] }
				stats={ null }
				onSelectMailbox={ jest.fn() }
			/>
		);
		expect( screen.getAllByText( '0' ).length ).toBeGreaterThanOrEqual( 4 );
	} );
} );
