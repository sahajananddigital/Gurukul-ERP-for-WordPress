/**
 * Vouchers List Tests
 */
import { render, screen, waitFor } from '@testing-library/react';
import VouchersList from '../../../src/modules/accounting/components/VouchersList';
import apiFetch from '@wordpress/api-fetch';

jest.mock( '@wordpress/api-fetch' );

describe( 'VouchersList', () => {
	beforeEach( () => {
		apiFetch.mockClear();
	} );

	it( 'renders Vouchers component', () => {
		apiFetch.mockResolvedValue( [] );
		render( <VouchersList /> );
		expect( screen.getByText( /Vouchers/i ) ).toBeInTheDocument();
	} );

	it( 'fetches and displays vouchers', async () => {
		const mockVouchers = [
			{
				id: 1,
				voucher_no: 'VCH-001',
				voucher_type: 'payment',
				date: '2024-01-01',
				party_name: 'Test Party',
				amount: 1000.0,
				status: 'draft',
			},
		];

		apiFetch.mockResolvedValue( mockVouchers );
		render( <VouchersList /> );

		await waitFor( () => {
			expect( screen.getByText( 'VCH-001' ) ).toBeInTheDocument();
		} );
	} );

	it( 'renders create voucher form', () => {
		render( <VouchersList view="create" /> );
		expect( screen.getByLabelText( /Voucher Type/i ) ).toBeInTheDocument();
	} );
} );
