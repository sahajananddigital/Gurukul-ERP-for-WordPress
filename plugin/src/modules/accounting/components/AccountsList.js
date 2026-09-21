import { useState, useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Flex, Spinner, Button, SnackbarList, Notice } from '@wordpress/components';
import { DataViews } from '@wordpress/dataviews';
import apiFetch from '@wordpress/api-fetch';
import EditModal from '../../../components/EditModal';

const AccountsList = ( { accounts, loading, onAccountUpdated } ) => {
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
		fields: ["code","name","type"],
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
		if ( window.confirm( __( 'Are you sure you want to delete this account?', 'sahajanand-erp' ) ) ) {
			try {
				await apiFetch( {
					path: `/sahajanand-erp/v1/accounting/accounts/${ item.id }`,
					method: 'DELETE',
				} );
				addSnackbar( __( 'Account deleted successfully.', 'sahajanand-erp' ) );
				if ( onAccountUpdated ) onAccountUpdated();
			} catch ( err ) {
				addSnackbar( __( 'Failed to delete account.', 'sahajanand-erp' ) );
			}
		}
	};

	const handleSave = async ( data ) => {
		try {
			if ( editingItem && editingItem.id ) {
				await apiFetch( {
					path: `/sahajanand-erp/v1/accounting/accounts/${ editingItem.id }`,
					method: 'POST',
					data,
				} );
				addSnackbar( __( 'Account updated successfully.', 'sahajanand-erp' ) );
			} else {
				await apiFetch( {
					path: '/sahajanand-erp/v1/accounting/accounts',
					method: 'POST',
					data,
				} );
				addSnackbar( __( 'Account created successfully.', 'sahajanand-erp' ) );
			}
			if ( onAccountUpdated ) onAccountUpdated();
		} catch ( err ) {
			addSnackbar( __( 'Failed to save account.', 'sahajanand-erp' ) );
		}
	};

	const fields = useMemo(
		() => [
			{
				id: 'code',
				header: __( 'Code', 'sahajanand-erp' ),
				getValue: ( { item } ) => item.code || '-',
				enableSorting: true,
			},
			{
				id: 'name',
				header: __( 'Name', 'sahajanand-erp' ),
				getValue: ( { item } ) => item.name || '-',
				enableSorting: true,
			},
			{
				id: 'type',
				header: __( 'Type', 'sahajanand-erp' ),
				getValue: ( { item } ) => item.type || '-',
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

	const defaultLayouts = useMemo( () => ( { table: { layout: { primaryField: 'code' } } } ), [] );

	if ( loading ) {
		return <Flex justify="center" style={{ padding: '32px' }}><Spinner /></Flex>;
	}

	return (
		<div>
			<Flex justify="flex-end" style={{ marginBottom: '16px' }}>
				<Button variant="primary" onClick={ handleAddNew }>
					{ __( 'Add New Account', 'sahajanand-erp' ) }
				</Button>
			</Flex>

			{ accounts.length === 0 ? (
				<Notice status="info" isDismissible={ false }>
					{ __( 'No accounts found.', 'sahajanand-erp' ) }
				</Notice>
			) : (
				<div style={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '4px' }}>
					<DataViews
						data={ accounts }
						fields={ fields }
						actions={ actions }
						view={ view }
						onChangeView={ setView }
						defaultLayouts={ defaultLayouts }
						paginationInfo={{
							totalItems: accounts.length,
							totalPages: Math.ceil( accounts.length / view.perPage ),
						}}
					/>
				</div>
			) }

			<EditModal
				title={ editingItem ? __( 'Edit Account', 'sahajanand-erp' ) : __( 'Add New Account', 'sahajanand-erp' ) }
				isOpen={ isEditModalOpen }
				onClose={ () => setIsEditModalOpen( false ) }
				onSave={ handleSave }
				data={ editingItem }
				fields={ [{"key":"code","label":"Code","type":"text"},{"key":"name","label":"Name","type":"text"},{"key":"type","label":"Type","type":"select","options":[{"label":"Asset","value":"asset"},{"label":"Liability","value":"liability"},{"label":"Equity","value":"equity"},{"label":"Revenue","value":"revenue"},{"label":"Expense","value":"expense"}]}] }
			/>

			<SnackbarList 
				notices={ snackbars } 
				onRemove={ removeSnackbar }
				style={{ position: 'fixed', bottom: '20px', left: '20px', zIndex: 100000 }}
			/>
		</div>
	);
};

export default AccountsList;
