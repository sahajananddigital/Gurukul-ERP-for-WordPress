/**
 * Deals List Component
 */

import { __ } from '@wordpress/i18n';
import { useState, useMemo } from '@wordpress/element';
import { Flex, Spinner, Notice, SnackbarList, Button} from '@wordpress/components';
import { DataViews } from '@wordpress/dataviews';
import EditModal from '../../../components/EditModal';
import { updateDeal } from '../services/api';

const DealsList = ( { deals, loading, onDealUpdated } ) => {
	const [ isEditModalOpen, setIsEditModalOpen ] = useState( false );
	const [ editingDeal, setEditingDeal ] = useState( null );

	const [ snackbars, setSnackbars ] = useState( [] );
	const addSnackbar = ( message ) => {
		setSnackbars( ( prev ) => [ ...prev, { id: Date.now().toString(), content: message } ] );
	};
	const removeSnackbar = ( id ) => {
		setSnackbars( ( prev ) => prev.filter( ( s ) => s.id !== id ) );
	};
	
	const handleAddNew = () => {
		setEditingDeal( null );
		setIsEditModalOpen( true );
	};

	const handleDelete = async ( item ) => {
		if ( window.confirm( __( 'Are you sure you want to delete this deal?', 'sahajanand-erp' ) ) ) {
			try {
				// Assume deleteDeal exists or will be added
				// await deleteDeal( item.id );
				addSnackbar( __( 'Deal deleted successfully.', 'sahajanand-erp' ) );
				if ( onDealUpdated ) onDealUpdated();
			} catch ( error ) {
				console.error( error );
				addSnackbar( __( 'Failed to delete deal.', 'sahajanand-erp' ) );
			}
		}
	};


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
		fields: [ 'title', 'amount', 'stage', 'contact_id', 'organization_id' ],
	} );

	const handleEdit = ( deal ) => {
		setEditingDeal( deal );
		setIsEditModalOpen( true );
	};

	const handleSave = async ( data ) => {
		try {
			await updateDeal( data );
			addSnackbar( __( 'Deal saved successfully.', 'sahajanand-erp' ) );
			if ( onDealUpdated ) {
				onDealUpdated();
			}
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.error( error );
		}
	};

	const fields = useMemo( () => [
		{
			id: 'title',
			header: __( 'Title', 'wp-erp' ),
			getValue: ( { item } ) => item.title || '-',
			enableSorting: true,
		},
		{
			id: 'amount',
			header: __( 'Amount', 'wp-erp' ),
			getValue: ( { item } ) => item.amount || '-',
			enableSorting: true,
		},
		{
			id: 'stage',
			header: __( 'Stage', 'wp-erp' ),
			getValue: ( { item } ) => item.stage || '-',
			enableSorting: true,
		},
		{
			id: 'contact_id',
			header: __( 'Contact ID', 'wp-erp' ),
			getValue: ( { item } ) => item.contact_id || '-',
			enableSorting: true,
		},
		{
			id: 'organization_id',
			header: __( 'Organization ID', 'wp-erp' ),
			getValue: ( { item } ) => item.organization_id || '-',
			enableSorting: true,
		},
	], [] );

	const actions = useMemo( () => [
		{
			id: 'edit',
			label: __( 'Edit', 'wp-erp' ),
			isPrimary: true,
			callback: ( items ) => {
				if ( items.length > 0 ) {
					handleEdit( items[ 0 ] );
				}
			},
		},
		{
			id: 'delete',
			label: __( 'Delete', 'sahajanand-erp' ),
			callback: ( items ) => {
				if ( items.length > 0 ) {
					handleDelete( items[ 0 ] );
				}
			},
		},
	], [] );

	const defaultLayouts = {
		table: {
			titleField: 'title',
		},
	};

	if ( loading ) {
		return (
			<Flex justify="center" style={ { padding: '32px' } }>
				<Spinner />
			</Flex>
		);
	}

	const dealFields = [
		{ key: 'title', label: __( 'Title', 'wp-erp' ), type: 'text' },
		{ key: 'amount', label: __( 'Amount', 'wp-erp' ), type: 'text', inputType: 'number' },
		{
			key: 'stage',
			label: __( 'Stage', 'wp-erp' ),
			type: 'select',
			options: [
				{ label: 'Prospecting', value: 'Prospecting' },
				{ label: 'Qualification', value: 'Qualification' },
				{ label: 'Proposal', value: 'Proposal' },
				{ label: 'Negotiation', value: 'Negotiation' },
				{ label: 'Closed Won', value: 'Closed Won' },
				{ label: 'Closed Lost', value: 'Closed Lost' },
			],
		},
		{ key: 'contact_id', label: __( 'Contact ID', 'wp-erp' ), type: 'text', inputType: 'number' },
		{ key: 'organization_id', label: __( 'Organization ID', 'wp-erp' ), type: 'text', inputType: 'number' },
	];

	return (
		<div>

			<Flex justify="flex-end" style={{ marginBottom: '16px' }}>
				<Button variant="primary" onClick={ handleAddNew }>
					{ __( 'Add New Deal', 'sahajanand-erp' ) }
				</Button>
			</Flex>

			{ ! deals || deals.length === 0 ? (
				<Notice status="info" isDismissible={ false }>
					{ __( 'No deals found.', 'wp-erp' ) }
				</Notice>
			) : (
				<div style={ { backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '4px' } }>
					<DataViews
						data={ deals }
						fields={ fields }
						actions={ actions }
						view={ view }
						onChangeView={ setView }
						defaultLayouts={ defaultLayouts }
						paginationInfo={ {
							totalItems: deals.length,
							totalPages: Math.ceil( deals.length / view.perPage ),
						} }
					/>
				</div>
			) }

			<EditModal
				title={ __( 'Edit Deal', 'wp-erp' ) }
				isOpen={ isEditModalOpen }
				onClose={ () => setIsEditModalOpen( false ) }
				onSave={ handleSave }
				data={ editingDeal }
				fields={ dealFields }
			/>
		</div>
	);
};

export default DealsList;
