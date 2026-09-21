import { useState, useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Flex, Spinner, Button, SnackbarList, Notice } from '@wordpress/components';
import { DataViews } from '@wordpress/dataviews';
import apiFetch from '@wordpress/api-fetch';
import EditModal from '../../../components/EditModal';

const TransactionsList = ( { transactions, loading, onTransactionUpdated } ) => {
	const [ isEditModalOpen, setIsEditModalOpen ] = useState( false );
	const [ editingItem, setEditingItem ] = useState( null );
	const [ snackbars, setSnackbars ] = useState( [] );

	const [ view, setView ] = useState( {
		type: 'table',
		perPage: 20,
		page: 1,
		sort: {
			field: 'id',
			direction: 'desc',
		},
		search: '',
		filters: [],
		fields: ["date","account_id","description","debit","credit"],
	} );

	const addSnackbar = ( message ) => {
		setSnackbars( ( prev ) => [ ...prev, { id: Date.now().toString(), content: message } ] );
	};

	const removeSnackbar = ( id ) => {
		setSnackbars( ( prev ) => prev.filter( ( s ) => s.id !== id ) );
	};

	const handleAddNew = () => {
		setEditingItem( null );
		setIsEditModalOpen( true );
	};

	const handleEdit = ( item ) => {
		setEditingItem( item );
		setIsEditModalOpen( true );
	};

	const handleDelete = async ( item ) => {
		if ( window.confirm( __( 'Are you sure you want to delete this transaction?', 'sahajanand-erp' ) ) ) {
			try {
				await apiFetch( {
					path: `/sahajanand-erp/v1/accounting/transactions/${ item.id }`,
					method: 'DELETE',
				} );
				addSnackbar( __( 'Transaction deleted successfully.', 'sahajanand-erp' ) );
				if ( onTransactionUpdated ) onTransactionUpdated();
			} catch ( err ) {
				addSnackbar( __( 'Failed to delete transaction.', 'sahajanand-erp' ) );
			}
		}
	};

	const handleSave = async ( data ) => {
		try {
			if ( editingItem && editingItem.id ) {
				await apiFetch( {
					path: `/sahajanand-erp/v1/accounting/transactions/${ editingItem.id }`,
					method: 'POST',
					data,
				} );
				addSnackbar( __( 'Transaction updated successfully.', 'sahajanand-erp' ) );
			} else {
				await apiFetch( {
					path: '/sahajanand-erp/v1/accounting/transactions',
					method: 'POST',
					data,
				} );
				addSnackbar( __( 'Transaction created successfully.', 'sahajanand-erp' ) );
			}
			if ( onTransactionUpdated ) onTransactionUpdated();
		} catch ( err ) {
			addSnackbar( __( 'Failed to save transaction.', 'sahajanand-erp' ) );
		}
	};

	const fields = useMemo(
		() => [
			{
				id: 'date',
				header: __( 'Date', 'sahajanand-erp' ),
				getValue: ( { item } ) => item.date || '-',
				enableSorting: true,
			},
			{
				id: 'account_id',
				header: __( 'Account ID', 'sahajanand-erp' ),
				getValue: ( { item } ) => item.account_id || '-',
				enableSorting: true,
			},
			{
				id: 'description',
				header: __( 'Description', 'sahajanand-erp' ),
				getValue: ( { item } ) => item.description || '-',
				enableSorting: true,
			},
			{
				id: 'debit',
				header: __( 'Debit', 'sahajanand-erp' ),
				getValue: ( { item } ) => item.debit || '-',
				enableSorting: true,
			},
			{
				id: 'credit',
				header: __( 'Credit', 'sahajanand-erp' ),
				getValue: ( { item } ) => item.credit || '-',
				enableSorting: true,
			}
		],
		[]
	);

	const actions = useMemo(
		() => [
			{
				id: 'edit',
				label: __( 'Edit', 'sahajanand-erp' ),
				isPrimary: true,
				callback: ( items ) => {
					if ( items.length > 0 ) handleEdit( items[ 0 ] );
				},
			},
			{
				id: 'delete',
				label: __( 'Delete', 'sahajanand-erp' ),
				isDestructive: true,
				callback: ( items ) => {
					if ( items.length > 0 ) handleDelete( items[ 0 ] );
				},
			},
		],
		[]
	);

	const defaultLayouts = useMemo( () => ( { table: { layout: { primaryField: 'date' } } } ), [] );

	if ( loading ) {
		return <Flex justify="center" style={{ padding: '32px' }}><Spinner /></Flex>;
	}

	return (
		<div>
			<Flex justify="flex-end" style={{ marginBottom: '16px' }}>
				<Button variant="primary" onClick={ handleAddNew }>
					{ __( 'Add New Transaction', 'sahajanand-erp' ) }
				</Button>
			</Flex>

			{ transactions.length === 0 ? (
				<Notice status="info" isDismissible={ false }>
					{ __( 'No transactions found.', 'sahajanand-erp' ) }
				</Notice>
			) : (
				<div style={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '4px' }}>
					<DataViews
						data={ transactions }
						fields={ fields }
						actions={ actions }
						view={ view }
						onChangeView={ setView }
						defaultLayouts={ defaultLayouts }
						paginationInfo={{
							totalItems: transactions.length,
							totalPages: Math.ceil( transactions.length / view.perPage ),
						}}
					/>
				</div>
			) }

			<EditModal
				title={ editingItem ? __( 'Edit Transaction', 'sahajanand-erp' ) : __( 'Add New Transaction', 'sahajanand-erp' ) }
				isOpen={ isEditModalOpen }
				onClose={ () => setIsEditModalOpen( false ) }
				onSave={ handleSave }
				data={ editingItem }
				fields={ [{"key":"date","label":"Date","type":"date"},{"key":"account_id","label":"Account ID","type":"text"},{"key":"description","label":"Description","type":"text"},{"key":"debit","label":"Debit","type":"number"},{"key":"credit","label":"Credit","type":"number"}] }
			/>

			<SnackbarList 
				notices={ snackbars } 
				onRemove={ removeSnackbar }
				style={{ position: 'fixed', bottom: '20px', left: '20px', zIndex: 100000 }}
			/>
		</div>
	);
};

export default TransactionsList;
