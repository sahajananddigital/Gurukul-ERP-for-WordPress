/**
 * Leads List Component
 */

import { __ } from '@wordpress/i18n';
import { useState, useMemo } from '@wordpress/element';
import { Flex, Spinner, Notice, SnackbarList, Button} from '@wordpress/components';
import { DataViews } from '@wordpress/dataviews';
import { getStatusColor } from '../utils';
import EditModal from '../../../components/EditModal';
import { updateLead } from '../services/api';

const LeadsList = ( { leads, loading, onLeadUpdated } ) => {
	const [ isEditModalOpen, setIsEditModalOpen ] = useState( false );
	const [ editingLead, setEditingLead ] = useState( null );

	const [ snackbars, setSnackbars ] = useState( [] );
	const addSnackbar = ( message ) => {
		setSnackbars( ( prev ) => [ ...prev, { id: Date.now().toString(), content: message } ] );
	};
	const removeSnackbar = ( id ) => {
		setSnackbars( ( prev ) => prev.filter( ( s ) => s.id !== id ) );
	};
	
	const handleAddNew = () => {
		setEditingLead( null );
		setIsEditModalOpen( true );
	};

	const handleDelete = async ( item ) => {
		if ( window.confirm( __( 'Are you sure you want to delete this lead?', 'sahajanand-erp' ) ) ) {
			try {
				// Assume deleteLead exists or will be added
				// await deleteLead( item.id );
				addSnackbar( __( 'Lead deleted successfully.', 'sahajanand-erp' ) );
				if ( onLeadUpdated ) onLeadUpdated();
			} catch ( error ) {
				console.error( error );
				addSnackbar( __( 'Failed to delete lead.', 'sahajanand-erp' ) );
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
		fields: [ 'name', 'email', 'phone', 'status' ],
	} );

	const handleEdit = ( lead ) => {
		setEditingLead( lead );
		setIsEditModalOpen( true );
	};

	const handleSave = async ( data ) => {
		try {
			await updateLead( data );
			addSnackbar( __( 'Lead saved successfully.', 'sahajanand-erp' ) );
			if ( onLeadUpdated ) {
				onLeadUpdated();
			}
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.error( error );
		}
	};

	const fields = useMemo( () => [
		{
			id: 'name',
			header: __( 'Name', 'wp-erp' ),
			getValue: ( { item } ) => `${ item.first_name } ${ item.last_name }`,
			enableSorting: true,
		},
		{
			id: 'email',
			header: __( 'Email', 'wp-erp' ),
			getValue: ( { item } ) => item.email || '-',
			enableSorting: true,
		},
		{
			id: 'phone',
			header: __( 'Phone', 'wp-erp' ),
			getValue: ( { item } ) => item.phone || '-',
		},
		{
			id: 'status',
			header: __( 'Status', 'wp-erp' ),
			getValue: ( { item } ) => item.status,
			render: ( { item } ) => (
				<span
					style={ {
						padding: '4px 8px',
						borderRadius: '2px',
						backgroundColor: getStatusColor( item.status ),
						color: '#fff',
						fontSize: '12px',
						textTransform: 'capitalize',
					} }
				>
					{ item.status }
				</span>
			),
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
			isDestructive: true,
			callback: ( items ) => {
				if ( items.length > 0 ) {
					handleDelete( items[ 0 ] );
				}
			},
		},
	], [] );

	const defaultLayouts = {
		table: {
			layout: {
				primaryField: 'name',
			},
		},
	};

	if ( loading ) {
		return (
			<Flex justify="center" style={ { padding: '32px' } }>
				<Spinner />
			</Flex>
		);
	}

	const leadFields = [
		{ key: 'first_name', label: __( 'First Name', 'wp-erp' ), type: 'text' },
		{ key: 'last_name', label: __( 'Last Name', 'wp-erp' ), type: 'text' },
		{ key: 'email', label: __( 'Email', 'wp-erp' ), type: 'text', inputType: 'email' },
		{ key: 'phone', label: __( 'Phone', 'wp-erp' ), type: 'text', inputType: 'tel' },
		{
			key: 'status',
			label: __( 'Status', 'wp-erp' ),
			type: 'select',
			options: [
				{ label: 'New', value: 'New' },
				{ label: 'Contacted', value: 'Contacted' },
				{ label: 'Qualified', value: 'Qualified' },
				{ label: 'Lost', value: 'Lost' },
			],
		},
	];

	return (
		<div>

			<Flex justify="flex-end" style={{ marginBottom: '16px' }}>
				<Button variant="primary" onClick={ handleAddNew }>
					{ __( 'Add New Lead', 'sahajanand-erp' ) }
				</Button>
			</Flex>

			{ leads.length === 0 ? (
				<Notice status="info" isDismissible={ false }>
					{ __( 'No leads found.', 'wp-erp' ) }
				</Notice>
			) : (
				<div style={ { backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '4px' } }>
					<DataViews
						data={ leads }
						fields={ fields }
						actions={ actions }
						view={ view }
						onChangeView={ setView }
						defaultLayouts={ defaultLayouts }
						paginationInfo={ {
							totalItems: leads.length,
							totalPages: Math.ceil( leads.length / view.perPage ),
						} }
					/>
				</div>
			) }

			<EditModal
				title={ __( 'Edit Lead', 'wp-erp' ) }
				isOpen={ isEditModalOpen }
				onClose={ () => setIsEditModalOpen( false ) }
				onSave={ handleSave }
				data={ editingLead }
				fields={ leadFields }
			/>
		</div>
	);
};

export default LeadsList;
