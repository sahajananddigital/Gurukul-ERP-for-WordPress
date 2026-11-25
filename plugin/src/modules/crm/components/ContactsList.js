/**
 * Contacts List Component
 */

/* global sahajanandErp */

import { __ } from '@wordpress/i18n';
import { useState, useRef, useMemo } from '@wordpress/element';
import { Flex, Spinner, Button, Notice, SnackbarList } from '@wordpress/components';
import { DataViews } from '@wordpress/dataviews';
import { getStatusColor } from '../utils';
import EditModal from '../../../components/EditModal';
import { updateContact, deleteContact } from '../services/api';
import apiFetch from '@wordpress/api-fetch';

const ContactsList = ( { contacts, loading, onContactUpdated } ) => {
	const [ isEditModalOpen, setIsEditModalOpen ] = useState( false );
	const [ editingContact, setEditingContact ] = useState( null );
	const [ isImporting, setIsImporting ] = useState( false );
	const [ snackbars, setSnackbars ] = useState( [] );
	const fileInputRef = useRef( null );

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
		fields: [ 'name', 'email', 'phone', 'company', 'status' ],
	} );

	const addSnackbar = ( message ) => {
		const newSnackbar = {
			id: Date.now().toString(),
			content: message,
		};
		setSnackbars( [ ...snackbars, newSnackbar ] );
	};

	const removeSnackbar = ( id ) => {
		setSnackbars( snackbars.filter( ( snackbar ) => snackbar.id !== id ) );
	};

	const handleEdit = ( contact ) => {
		setEditingContact( contact );
		setIsEditModalOpen( true );
	};

	const handleDelete = async ( contact ) => {
		if ( window.confirm( __( 'Are you sure you want to delete this contact?', 'sahajanand-erp' ) ) ) {
			try {
				await deleteContact( contact.id );
				addSnackbar( __( 'Contact deleted successfully.', 'sahajanand-erp' ) );
				if ( onContactUpdated ) {
					onContactUpdated();
				}
			} catch ( error ) {
				// eslint-disable-next-line no-console
				console.error( error );
				alert( __( 'Failed to delete contact.', 'sahajanand-erp' ) );
			}
		}
	};

	const handleSave = async ( data ) => {
		try {
			await updateContact( data );
			addSnackbar( __( 'Contact updated successfully.', 'sahajanand-erp' ) );
			if ( onContactUpdated ) {
				onContactUpdated();
			}
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.error( error );
		}
	};

	const handleExport = ( format ) => {
		const url = `${ sahajanandErp.apiUrl }crm/export?format=${ format }&_wpnonce=${ sahajanandErp.nonce }`;
		window.open( url, '_blank' );
	};

	const handleDownloadSample = () => {
		const url = `${ sahajanandErp.apiUrl }crm/import/sample?_wpnonce=${ sahajanandErp.nonce }`;
		window.open( url, '_blank' );
	};

	const handleImportClick = () => {
		fileInputRef.current.click();
	};

	const handleFileChange = async ( event ) => {
		const file = event.target.files[ 0 ];
		if ( ! file ) {
			return;
		}

		setIsImporting( true );
		const formData = new FormData();
		formData.append( 'file', file );

		try {
			await apiFetch( {
				path: 'sahajanand-erp/v1/crm/import',
				method: 'POST',
				body: formData,
			} );
			if ( onContactUpdated ) {
				onContactUpdated();
			}
			addSnackbar( __( 'Contacts imported successfully!', 'sahajanand-erp' ) );
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.error( error );
			alert( __( 'Failed to import contacts.', 'sahajanand-erp' ) );
		} finally {
			setIsImporting( false );
			event.target.value = null;
		}
	};

	const fields = useMemo( () => [
		{
			id: 'name',
			header: __( 'Name', 'sahajanand-erp' ),
			getValue: ( { item } ) => `${ item.first_name } ${ item.last_name }`,
			enableSorting: true,
		},
		{
			id: 'email',
			header: __( 'Email', 'sahajanand-erp' ),
			getValue: ( { item } ) => item.email || '-',
			enableSorting: true,
		},
		{
			id: 'phone',
			header: __( 'Phone', 'sahajanand-erp' ),
			getValue: ( { item } ) => item.phone || '-',
		},
		{
			id: 'company',
			header: __( 'Company', 'sahajanand-erp' ),
			getValue: ( { item } ) => item.company || '-',
			enableSorting: true,
		},
		{
			id: 'status',
			header: __( 'Status', 'sahajanand-erp' ),
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
			label: __( 'Edit', 'sahajanand-erp' ),
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
			titleField: 'name',
		},
	};

	if ( loading ) {
		return (
			<Flex justify="center" style={ { padding: '32px' } }>
				<Spinner />
			</Flex>
		);
	}

	const contactFields = [
		{ key: 'first_name', label: __( 'First Name', 'sahajanand-erp' ), type: 'text' },
		{ key: 'last_name', label: __( 'Last Name', 'sahajanand-erp' ), type: 'text' },
		{ key: 'email', label: __( 'Email', 'sahajanand-erp' ), type: 'text', inputType: 'email' },
		{ key: 'phone', label: __( 'Phone', 'sahajanand-erp' ), type: 'text', inputType: 'tel' },
		{ key: 'company', label: __( 'Company', 'sahajanand-erp' ), type: 'text' },
		{
			key: 'status',
			label: __( 'Status', 'sahajanand-erp' ),
			type: 'select',
			options: [
				{ label: 'Lead', value: 'lead' },
				{ label: 'Customer', value: 'customer' },
				{ label: 'Opportunity', value: 'opportunity' },
			],
		},
		{ key: 'address_line_1', label: __( 'Address Line 1', 'sahajanand-erp' ), type: 'text' },
		{ key: 'address_line_2', label: __( 'Address Line 2', 'sahajanand-erp' ), type: 'text' },
		{ key: 'city', label: __( 'City', 'sahajanand-erp' ), type: 'text' },
		{ key: 'state', label: __( 'State/Province', 'sahajanand-erp' ), type: 'text' },
		{ key: 'postal_code', label: __( 'Postal Code', 'sahajanand-erp' ), type: 'text' },
		{ key: 'country', label: __( 'Country', 'sahajanand-erp' ), type: 'text' },
		{ key: 'birthday', label: __( 'Birthday', 'sahajanand-erp' ), type: 'text', inputType: 'date' },
		{ key: 'anniversary', label: __( 'Anniversary', 'sahajanand-erp' ), type: 'text', inputType: 'date' },
	];

	return (
		<div>
			<Flex justify="flex-end" style={ { marginBottom: '16px', gap: '8px' } }>
				<input
					type="file"
					ref={ fileInputRef }
					style={ { display: 'none' } }
					accept=".csv"
					onChange={ handleFileChange }
				/>
				<Button variant="link" onClick={ handleDownloadSample } style={ { textDecoration: 'none' } }>
					{ __( 'Download Sample', 'sahajanand-erp' ) }
				</Button>
				<Button variant="secondary" onClick={ handleImportClick } isBusy={ isImporting }>
					{ __( 'Import CSV', 'sahajanand-erp' ) }
				</Button>
				<Button variant="secondary" onClick={ () => handleExport( 'csv' ) }>
					{ __( 'Export CSV', 'sahajanand-erp' ) }
				</Button>
				<Button variant="secondary" onClick={ () => handleExport( 'pdf' ) }>
					{ __( 'Export PDF', 'sahajanand-erp' ) }
				</Button>
			</Flex>

			{ contacts.length === 0 ? (
				<Notice status="info" isDismissible={ false }>
					{ __( 'No contacts found.', 'sahajanand-erp' ) }
				</Notice>
			) : (
				<div style={ { backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '4px' } }>
					<DataViews
						data={ contacts }
						fields={ fields }
						actions={ actions }
						view={ view }
						onChangeView={ setView }
						defaultLayouts={ defaultLayouts }
						paginationInfo={ {
							totalItems: contacts.length,
							totalPages: Math.ceil( contacts.length / view.perPage ),
						} }
					/>
				</div>
			) }

			<EditModal
				title={ __( 'Edit Contact', 'sahajanand-erp' ) }
				isOpen={ isEditModalOpen }
				onClose={ () => setIsEditModalOpen( false ) }
				onSave={ handleSave }
				data={ editingContact }
				fields={ contactFields }
			/>
			
			<SnackbarList 
				notices={ snackbars } 
				onRemove={ removeSnackbar }
				style={{ position: 'fixed', bottom: '20px', left: '20px', zIndex: 100000 }}
			/>
		</div>
	);
};

export default ContactsList;
