/**
 * Contacts List Component
 */

/* global wpErp */

import { __ } from '@wordpress/i18n';
import { useState, useRef, useMemo } from '@wordpress/element';
import { Flex, Spinner, Button, Notice } from '@wordpress/components';
import { DataViews } from '@wordpress/dataviews';
import { getStatusColor } from '../utils';
import EditModal from '../../../components/EditModal';
import { updateContact } from '../services/api';
import apiFetch from '@wordpress/api-fetch';

const ContactsList = ( { contacts, loading, onContactUpdated } ) => {
	const [ isEditModalOpen, setIsEditModalOpen ] = useState( false );
	const [ editingContact, setEditingContact ] = useState( null );
	const [ isImporting, setIsImporting ] = useState( false );
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

	const handleEdit = ( contact ) => {
		setEditingContact( contact );
		setIsEditModalOpen( true );
	};

	const handleSave = async ( data ) => {
		try {
			await updateContact( data );
			if ( onContactUpdated ) {
				onContactUpdated();
			}
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.error( error );
		}
	};

	const handleExport = ( format ) => {
		const url = `${ wpErp.apiUrl }crm/export?format=${ format }&_wpnonce=${ wpErp.nonce }`;
		window.open( url, '_blank' );
	};

	const handleDownloadSample = () => {
		const url = `${ wpErp.apiUrl }crm/import/sample?_wpnonce=${ wpErp.nonce }`;
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
				path: 'wp-erp/v1/crm/import',
				method: 'POST',
				body: formData,
			} );
			if ( onContactUpdated ) {
				onContactUpdated();
			}
			// eslint-disable-next-line no-alert
			alert( __( 'Contacts imported successfully!', 'wp-erp' ) );
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.error( error );
			// eslint-disable-next-line no-alert
			alert( __( 'Failed to import contacts.', 'wp-erp' ) );
		} finally {
			setIsImporting( false );
			event.target.value = null;
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
			id: 'company',
			header: __( 'Company', 'wp-erp' ),
			getValue: ( { item } ) => item.company || '-',
			enableSorting: true,
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

	const contactFields = [
		{ key: 'first_name', label: __( 'First Name', 'wp-erp' ), type: 'text' },
		{ key: 'last_name', label: __( 'Last Name', 'wp-erp' ), type: 'text' },
		{ key: 'email', label: __( 'Email', 'wp-erp' ), type: 'text', inputType: 'email' },
		{ key: 'phone', label: __( 'Phone', 'wp-erp' ), type: 'text', inputType: 'tel' },
		{ key: 'company', label: __( 'Company', 'wp-erp' ), type: 'text' },
		{
			key: 'status',
			label: __( 'Status', 'wp-erp' ),
			type: 'select',
			options: [
				{ label: 'Lead', value: 'lead' },
				{ label: 'Customer', value: 'customer' },
				{ label: 'Opportunity', value: 'opportunity' },
			],
		},
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
					{ __( 'Download Sample', 'wp-erp' ) }
				</Button>
				<Button variant="secondary" onClick={ handleImportClick } isBusy={ isImporting }>
					{ __( 'Import CSV', 'wp-erp' ) }
				</Button>
				<Button variant="secondary" onClick={ () => handleExport( 'csv' ) }>
					{ __( 'Export CSV', 'wp-erp' ) }
				</Button>
				<Button variant="secondary" onClick={ () => handleExport( 'pdf' ) }>
					{ __( 'Export PDF', 'wp-erp' ) }
				</Button>
			</Flex>

			{ contacts.length === 0 ? (
				<Notice status="info" isDismissible={ false }>
					{ __( 'No contacts found.', 'wp-erp' ) }
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
				title={ __( 'Edit Contact', 'wp-erp' ) }
				isOpen={ isEditModalOpen }
				onClose={ () => setIsEditModalOpen( false ) }
				onSave={ handleSave }
				data={ editingContact }
				fields={ contactFields }
			/>
		</div>
	);
};

export default ContactsList;
