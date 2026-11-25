import { useState, useEffect, useMemo } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { Flex, Button, Card, CardBody, Spinner } from '@wordpress/components';
import { ConfirmDialog } from '../../../components/wp-compat';
import { DataViews } from '@wordpress/dataviews';
import apiFetch from '@wordpress/api-fetch';
import EditModal from '../../../components/EditModal';

const MailboxesList = ( { addSnackbar } ) => {
	const [ mailboxes, setMailboxes ] = useState( [] );
	const [ loading, setLoading ] = useState( true );
	const [ isModalOpen, setIsModalOpen ] = useState( false );
	const [ editingItem, setEditingItem ] = useState( null );
	const [ itemToDelete, setItemToDelete ] = useState( null );

	const [ isTesting, setIsTesting ] = useState( false );

	const handleTestConnection = async ( formData ) => {
		setIsTesting( true );
		try {
			const result = await apiFetch( {
				path: '/sahajanand-erp/v1/helpdesk/mailboxes/test-connection',
				method: 'POST',
				data: formData,
			} );
			if ( result.success ) {
				addSnackbar( __( 'Connection successful!', 'sahajanand-erp' ) );
			} else {
				addSnackbar(
					sprintf(
						/* translators: %s: Error message. */
						__( 'Connection failed: %s', 'sahajanand-erp' ),
						result.error
					)
				);
			}
		} catch ( err ) {
			addSnackbar(
				sprintf(
					/* translators: %s: Error message. */
					__( 'Error testing connection: %s', 'sahajanand-erp' ),
					err.message || JSON.stringify( err )
				)
			);
		}
		setIsTesting( false );
	};

	const fetchMailboxes = async () => {
		setLoading( true );
		try {
			const data = await apiFetch( {
				path: '/sahajanand-erp/v1/helpdesk/mailboxes',
			} );
			setMailboxes( data );
		} catch {
			addSnackbar( __( 'Failed to fetch mailboxes.', 'sahajanand-erp' ) );
		} finally {
			setLoading( false );
		}
	};

	useEffect( () => {
		fetchMailboxes();
	}, [] );

	const handleSave = async ( data ) => {
		try {
			if ( editingItem && editingItem.id ) {
				await apiFetch( {
					path: `/sahajanand-erp/v1/helpdesk/mailboxes/${ editingItem.id }`,
					method: 'POST',
					data,
				} );
				addSnackbar( __( 'Mailbox updated.', 'sahajanand-erp' ) );
			} else {
				await apiFetch( {
					path: '/sahajanand-erp/v1/helpdesk/mailboxes',
					method: 'POST',
					data,
				} );
				addSnackbar( __( 'Mailbox created.', 'sahajanand-erp' ) );
			}
			setIsModalOpen( false );
			fetchMailboxes();
		} catch ( err ) {
			addSnackbar(
				sprintf(
					/* translators: %s: Error message. */
					__( 'Error saving mailbox: %s', 'sahajanand-erp' ),
					err.message || JSON.stringify( err )
				)
			);
		}
	};

	const confirmDelete = async () => {
		if ( ! itemToDelete ) {
			return;
		}
		try {
			await apiFetch( {
				path: `/sahajanand-erp/v1/helpdesk/mailboxes/${ itemToDelete }`,
				method: 'DELETE',
			} );
			addSnackbar( __( 'Mailbox deleted.', 'sahajanand-erp' ) );
			fetchMailboxes();
		} catch {
			addSnackbar( __( 'Error deleting mailbox.', 'sahajanand-erp' ) );
		}
		setItemToDelete( null );
	};

	const actions = useMemo(
		() => [
			{
				id: 'edit',
				label: __( 'Edit', 'sahajanand-erp' ),
				isPrimary: true,
				callback: ( items ) => {
					if ( items.length > 0 ) {
						setEditingItem( items[ 0 ] );
						setIsModalOpen( true );
					}
				},
			},
			{
				id: 'delete',
				label: __( 'Delete', 'sahajanand-erp' ),
				callback: ( items ) => {
					if ( items.length > 0 ) {
						setItemToDelete( items[ 0 ].id );
					}
				},
			},
		],
		[]
	);

	if ( loading ) {
		return <Spinner />;
	}

	return (
		<div>
			<Flex justify="flex-end" style={ { marginBottom: '16px' } }>
				<Button
					variant="primary"
					onClick={ () => {
						setEditingItem( null );
						setIsModalOpen( true );
					} }
				>
					{ __( 'Add Mailbox', 'sahajanand-erp' ) }
				</Button>
			</Flex>

			<Card>
				<CardBody>
					<DataViews
						data={ mailboxes }
						fields={ [
							{
								id: 'name',
								header: __( 'Name', 'sahajanand-erp' ),
								getValue: ( { item } ) => item.name,
							},
							{
								id: 'email_address',
								header: __( 'Email', 'sahajanand-erp' ),
								getValue: ( { item } ) => item.email_address,
							},
							{
								id: 'imap_host',
								header: __( 'IMAP Host', 'sahajanand-erp' ),
								getValue: ( { item } ) => item.imap_host,
							},
						] }
						actions={ actions }
						view={ {
							type: 'table',
							perPage: 20,
							page: 1,
							sort: { field: 'id', direction: 'desc' },
							search: '',
							filters: [],
							fields: [ 'name', 'email_address', 'imap_host' ],
						} }
						onChangeView={ () => {} }
						defaultLayouts={ {
							table: { titleField: 'name' },
						} }
						paginationInfo={ {
							totalItems: mailboxes.length,
							totalPages: 1,
						} }
					/>
				</CardBody>
			</Card>

			<EditModal
				title={
					editingItem
						? __( 'Edit Mailbox', 'sahajanand-erp' )
						: __( 'Add Mailbox', 'sahajanand-erp' )
				}
				isOpen={ isModalOpen }
				onClose={ () => setIsModalOpen( false ) }
				onSave={ handleSave }
				data={ editingItem }
				customActions={ ( formData ) => (
					<Button
						variant="secondary"
						isBusy={ isTesting }
						disabled={ isTesting }
						onClick={ () => handleTestConnection( formData ) }
						style={ { marginRight: 'auto' } }
					>
						{ __( 'Test Connection', 'sahajanand-erp' ) }
					</Button>
				) }
				fields={ [
					{
						key: 'name',
						label: __( 'Mailbox Name', 'sahajanand-erp' ),
						type: 'text',
					},
					{
						key: 'email_address',
						label: __( 'Email Address', 'sahajanand-erp' ),
						type: 'text',
					},
					{
						key: 'imap_host',
						label: __( 'IMAP Host', 'sahajanand-erp' ),
						type: 'text',
					},
					{
						key: 'imap_port',
						label: __( 'IMAP Port', 'sahajanand-erp' ),
						type: 'text',
					},
					{
						key: 'imap_user',
						label: __( 'IMAP Username', 'sahajanand-erp' ),
						type: 'text',
					},
					{
						key: 'imap_pass',
						label: __( 'IMAP Password', 'sahajanand-erp' ),
						type: 'text',
					},
					{
						key: 'smtp_host',
						label: __( 'SMTP Host', 'sahajanand-erp' ),
						type: 'text',
					},
					{
						key: 'smtp_port',
						label: __( 'SMTP Port', 'sahajanand-erp' ),
						type: 'text',
					},
					{
						key: 'smtp_user',
						label: __( 'SMTP Username', 'sahajanand-erp' ),
						type: 'text',
					},
					{
						key: 'smtp_pass',
						label: __( 'SMTP Password', 'sahajanand-erp' ),
						type: 'text',
					},
					{
						key: 'signature',
						label: __( 'Signature', 'sahajanand-erp' ),
						type: 'textarea',
					},
				] }
			/>

			<ConfirmDialog
				isOpen={ !! itemToDelete }
				onConfirm={ confirmDelete }
				onCancel={ () => setItemToDelete( null ) }
				confirmButtonText={ __( 'Delete', 'sahajanand-erp' ) }
			>
				{ __(
					'Are you sure you want to delete this mailbox?',
					'sahajanand-erp'
				) }
			</ConfirmDialog>
		</div>
	);
};
export default MailboxesList;
