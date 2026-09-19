/**
 * Transactions List Component
 */
import { useState, useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Flex, Spinner, Button, Modal } from '@wordpress/components';
import { DataViews } from '@wordpress/dataviews';

const TransactionsList = ( { transactions, loading } ) => {
	const [ selectedTransaction, setSelectedTransaction ] = useState( null );

	const [ view, setView ] = useState( {
		type: 'table',
		perPage: 20,
		page: 1,
		sort: {
			field: 'date',
			direction: 'desc',
		},
		search: '',
		filters: [],
		fields: [ 'date', 'account', 'description', 'debit', 'credit' ],
	} );

	const fields = useMemo(
		() => [
			{
				id: 'date',
				header: __( 'Date', 'wp-erp' ),
				getValue: ( { item } ) => item.date || '-',
				enableSorting: true,
			},
			{
				id: 'account',
				header: __( 'Account', 'wp-erp' ),
				getValue: ( { item } ) =>
					typeof item.account === 'object' && item.account !== null
						? item.account.name || item.account.code || '-'
						: item.account || item.account_name || '-',
				enableSorting: true,
			},
			{
				id: 'description',
				header: __( 'Description', 'wp-erp' ),
				getValue: ( { item } ) =>
					item.description || item.reference || '-',
				enableSorting: true,
			},
			{
				id: 'debit',
				header: __( 'Debit', 'wp-erp' ),
				getValue: ( { item } ) =>
					item.debit !== undefined && item.debit !== null
						? item.debit
						: '-',
				enableSorting: true,
			},
			{
				id: 'credit',
				header: __( 'Credit', 'wp-erp' ),
				getValue: ( { item } ) =>
					item.credit !== undefined && item.credit !== null
						? item.credit
						: '-',
				enableSorting: true,
			},
		],
		[]
	);

	const actions = useMemo(
		() => [
			{
				id: 'view',
				label: __( 'View', 'wp-erp' ),
				isPrimary: true,
				callback: ( items ) => {
					if ( items.length > 0 ) {
						setSelectedTransaction( items[ 0 ] );
					}
				},
			},
		],
		[]
	);

	const defaultLayouts = useMemo(
		() => ( {
			table: {
				layout: {
					primaryField: 'date',
				},
			},
		} ),
		[]
	);

	if ( loading ) {
		return (
			<Flex justify="center" style={ { padding: '32px' } }>
				<Spinner />
			</Flex>
		);
	}

	if ( ! transactions || transactions.length === 0 ) {
		return (
			<p
				style={ {
					padding: '16px',
					textAlign: 'center',
					color: '#757575',
				} }
			>
				{ __( 'No transactions found.', 'wp-erp' ) }
			</p>
		);
	}

	return (
		<>
			<div
				style={ {
					backgroundColor: '#fff',
					border: '1px solid #e0e0e0',
					borderRadius: '4px',
				} }
			>
				<DataViews
					data={ transactions }
					fields={ fields }
					actions={ actions }
					view={ view }
					onChangeView={ setView }
					defaultLayouts={ defaultLayouts }
					paginationInfo={ {
						totalItems: transactions.length,
						totalPages: Math.ceil(
							transactions.length / view.perPage
						),
					} }
				/>
			</div>

			{ selectedTransaction && (
				<Modal
					title={ __( 'Transaction Details', 'wp-erp' ) }
					onRequestClose={ () => setSelectedTransaction( null ) }
				>
					<div style={ { padding: '16px' } }>
						<p>
							<strong>{ __( 'Voucher No:', 'wp-erp' ) }</strong>{ ' ' }
							{ selectedTransaction.voucher_no }
						</p>
						<p>
							<strong>{ __( 'Type:', 'wp-erp' ) }</strong>{ ' ' }
							{ selectedTransaction.type }
						</p>
						<p>
							<strong>{ __( 'Date:', 'wp-erp' ) }</strong>{ ' ' }
							{ selectedTransaction.date }
						</p>
						<p>
							<strong>{ __( 'Reference:', 'wp-erp' ) }</strong>{ ' ' }
							{ selectedTransaction.reference || '-' }
						</p>
						<p>
							<strong>{ __( 'Total:', 'wp-erp' ) }</strong>{ ' ' }
							{ selectedTransaction.total }
						</p>
						<Flex
							justify="flex-end"
							style={ { marginTop: '24px' } }
						>
							<Button
								variant="primary"
								onClick={ () => setSelectedTransaction( null ) }
							>
								{ __( 'Close', 'wp-erp' ) }
							</Button>
						</Flex>
					</div>
				</Modal>
			) }
		</>
	);
};

export default TransactionsList;
