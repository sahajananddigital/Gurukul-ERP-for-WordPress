import { useState, useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Flex, Spinner, Button, SnackbarList, Notice } from '@wordpress/components';
import { DataViews } from '@wordpress/dataviews';
import apiFetch from '@wordpress/api-fetch';
import EditModal from '../../../components/EditModal';

const ExpensesList = ( { expenses, loading, onExpenseUpdated } ) => {
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
		fields: ["date","category","amount","description","status"],
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
		if ( window.confirm( __( 'Are you sure you want to delete this expense?', 'sahajanand-erp' ) ) ) {
			try {
				await apiFetch( {
					path: `/sahajanand-erp/v1/expenses/${ item.id }`,
					method: 'DELETE',
				} );
				addSnackbar( __( 'Expense deleted successfully.', 'sahajanand-erp' ) );
				if ( onExpenseUpdated ) onExpenseUpdated();
			} catch ( err ) {
				addSnackbar( __( 'Failed to delete expense.', 'sahajanand-erp' ) );
			}
		}
	};

	const handleSave = async ( data ) => {
		try {
			if ( editingItem && editingItem.id ) {
				await apiFetch( {
					path: `/sahajanand-erp/v1/expenses/${ editingItem.id }`,
					method: 'POST',
					data,
				} );
				addSnackbar( __( 'Expense updated successfully.', 'sahajanand-erp' ) );
			} else {
				await apiFetch( {
					path: '/sahajanand-erp/v1/expenses',
					method: 'POST',
					data,
				} );
				addSnackbar( __( 'Expense created successfully.', 'sahajanand-erp' ) );
			}
			if ( onExpenseUpdated ) onExpenseUpdated();
		} catch ( err ) {
			addSnackbar( __( 'Failed to save expense.', 'sahajanand-erp' ) );
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
				id: 'category',
				header: __( 'Category', 'sahajanand-erp' ),
				getValue: ( { item } ) => item.category || '-',
				enableSorting: true,
			},
			{
				id: 'amount',
				header: __( 'Amount', 'sahajanand-erp' ),
				getValue: ( { item } ) => item.amount || '-',
				enableSorting: true,
			},
			{
				id: 'description',
				header: __( 'Description', 'sahajanand-erp' ),
				getValue: ( { item } ) => item.description || '-',
				enableSorting: true,
			},
			{
				id: 'status',
				header: __( 'Status', 'sahajanand-erp' ),
				getValue: ( { item } ) => item.status || '-',
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
					{ __( 'Add New Expense', 'sahajanand-erp' ) }
				</Button>
			</Flex>

			{ expenses.length === 0 ? (
				<Notice status="info" isDismissible={ false }>
					{ __( 'No expenses found.', 'sahajanand-erp' ) }
				</Notice>
			) : (
				<div style={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '4px' }}>
					<DataViews
						data={ expenses }
						fields={ fields }
						actions={ actions }
						view={ view }
						onChangeView={ setView }
						defaultLayouts={ defaultLayouts }
						paginationInfo={{
							totalItems: expenses.length,
							totalPages: Math.ceil( expenses.length / view.perPage ),
						}}
					/>
				</div>
			) }

			<EditModal
				title={ editingItem ? __( 'Edit Expense', 'sahajanand-erp' ) : __( 'Add New Expense', 'sahajanand-erp' ) }
				isOpen={ isEditModalOpen }
				onClose={ () => setIsEditModalOpen( false ) }
				onSave={ handleSave }
				data={ editingItem }
				fields={ [{"key":"date","label":"Date","type":"date"},{"key":"category","label":"Category","type":"text"},{"key":"amount","label":"Amount","type":"number"},{"key":"description","label":"Description","type":"textarea"},{"key":"status","label":"Status","type":"select","options":[{"label":"Pending","value":"pending"},{"label":"Approved","value":"approved"},{"label":"Rejected","value":"rejected"}]}] }
			/>

			<SnackbarList 
				notices={ snackbars } 
				onRemove={ removeSnackbar }
				style={{ position: 'fixed', bottom: '20px', left: '20px', zIndex: 100000 }}
			/>
		</div>
	);
};

export default ExpensesList;
