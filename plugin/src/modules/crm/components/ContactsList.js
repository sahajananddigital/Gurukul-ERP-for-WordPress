/**
 * Contacts List Component
 */

/* global wpErp */

import { __ } from '@wordpress/i18n';
import { useState, useRef } from '@wordpress/element';
import { Flex, Spinner, Button } from '@wordpress/components';
import { getStatusColor } from '../utils';
import EditModal from '../../../components/EditModal';
import { updateContact } from '../services/api';
import apiFetch from '@wordpress/api-fetch';

const ContactsList = ( { contacts, loading, onContactUpdated } ) => {
	const [ isEditModalOpen, setIsEditModalOpen ] = useState( false );
	const [ editingContact, setEditingContact ] = useState( null );
	const [ isImporting, setIsImporting ] = useState( false );
	const fileInputRef = useRef( null );

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
				// apiFetch handles multipart/form-data correctly when body is FormData
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

	if ( loading ) {
		return (
			<Flex justify="center" style={ { padding: '32px' } }>
				<Spinner />
			</Flex>
		);
	}

	const contactFields = [
		{
			key: 'first_name',
			label: __( 'First Name', 'wp-erp' ),
			type: 'text',
		},
		{ key: 'last_name', label: __( 'Last Name', 'wp-erp' ), type: 'text' },
		{
			key: 'email',
			label: __( 'Email', 'wp-erp' ),
			type: 'text',
			inputType: 'email',
		},
		{
			key: 'phone',
			label: __( 'Phone', 'wp-erp' ),
			type: 'text',
			inputType: 'tel',
		},
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
		{
			key: 'address_line_1',
			label: __( 'Address Line 1', 'wp-erp' ),
			type: 'text',
		},
		{
			key: 'address_line_2',
			label: __( 'Address Line 2', 'wp-erp' ),
			type: 'text',
		},
		{ key: 'city', label: __( 'City', 'wp-erp' ), type: 'text' },
		{ key: 'state', label: __( 'State', 'wp-erp' ), type: 'text' },
		{
			key: 'postal_code',
			label: __( 'Postal Code', 'wp-erp' ),
			type: 'text',
		},
		{ key: 'country', label: __( 'Country', 'wp-erp' ), type: 'text' },
		{
			key: 'birthday',
			label: __( 'Birthday', 'wp-erp' ),
			type: 'text',
			inputType: 'date',
		},
		{
			key: 'anniversary',
			label: __( 'Anniversary', 'wp-erp' ),
			type: 'text',
			inputType: 'date',
		},
	];

	return (
		<div>
			<Flex
				justify="flex-end"
				style={ { marginBottom: '16px', gap: '8px' } }
			>
				<input
					type="file"
					ref={ fileInputRef }
					style={ { display: 'none' } }
					accept=".csv"
					onChange={ handleFileChange }
				/>
				<Button
					variant="link"
					onClick={ handleDownloadSample }
					style={ { textDecoration: 'none' } }
				>
					{ __( 'Download Sample', 'wp-erp' ) }
				</Button>
				<Button
					variant="secondary"
					onClick={ handleImportClick }
					isBusy={ isImporting }
				>
					{ __( 'Import CSV', 'wp-erp' ) }
				</Button>
				<Button
					variant="secondary"
					onClick={ () => handleExport( 'csv' ) }
				>
					{ __( 'Export CSV', 'wp-erp' ) }
				</Button>
				<Button
					variant="secondary"
					onClick={ () => handleExport( 'pdf' ) }
				>
					{ __( 'Export PDF', 'wp-erp' ) }
				</Button>
			</Flex>

			{ contacts.length === 0 ? (
				<p
					style={ {
						padding: '16px',
						textAlign: 'center',
						color: '#757575',
					} }
				>
					{ __( 'No contacts found.', 'wp-erp' ) }
				</p>
			) : (
				<div style={ { overflowX: 'auto' } }>
					<table className="wp-list-table widefat fixed striped">
						<thead>
							<tr>
								<th>{ __( 'ID', 'wp-erp' ) }</th>
								<th>{ __( 'Name', 'wp-erp' ) }</th>
								<th>{ __( 'Email', 'wp-erp' ) }</th>
								<th>{ __( 'Phone', 'wp-erp' ) }</th>
								<th>{ __( 'Company', 'wp-erp' ) }</th>
								<th>{ __( 'Status', 'wp-erp' ) }</th>
								<th>{ __( 'Actions', 'wp-erp' ) }</th>
							</tr>
						</thead>
						<tbody>
							{ contacts.map( ( contact ) => (
								<tr key={ contact.id }>
									<td>{ contact.id }</td>
									<td>
										<strong>
											{ contact.first_name }{ ' ' }
											{ contact.last_name }
										</strong>
									</td>
									<td>{ contact.email || '-' }</td>
									<td>{ contact.phone || '-' }</td>
									<td>{ contact.company || '-' }</td>
									<td>
										<span
											style={ {
												padding: '4px 8px',
												borderRadius: '2px',
												backgroundColor: getStatusColor(
													contact.status
												),
												color: '#fff',
												fontSize: '12px',
												textTransform: 'capitalize',
											} }
										>
											{ contact.status }
										</span>
									</td>
									<td>
										<Button
											isSmall
											variant="secondary"
											onClick={ () =>
												handleEdit( contact )
											}
										>
											{ __( 'Edit', 'wp-erp' ) }
										</Button>
									</td>
								</tr>
							) ) }
						</tbody>
					</table>
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
