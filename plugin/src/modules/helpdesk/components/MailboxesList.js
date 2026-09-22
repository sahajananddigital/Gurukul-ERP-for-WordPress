import { useState, useEffect, useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Flex, Button, Spinner } from '@wordpress/components';
import { DataViews } from '@wordpress/dataviews';
import apiFetch from '@wordpress/api-fetch';
import EditModal from '../../../components/EditModal';

const MailboxesList = ({ addSnackbar }) => {
	const [ mailboxes, setMailboxes ] = useState( [] );
	const [ loading, setLoading ] = useState( true );
	const [ isModalOpen, setIsModalOpen ] = useState( false );
	const [ editingItem, setEditingItem ] = useState( null );

	const [ isTesting, setIsTesting ] = useState( false );

	const handleTestConnection = async ( formData ) => {
		setIsTesting( true );
		try {
			const result = await apiFetch({
				path: '/sahajanand-erp/v1/helpdesk/mailboxes/test-connection',
				method: 'POST',
				data: formData
			});
			if ( result.success ) {
				addSnackbar( __('Connection successful!', 'sahajanand-erp') );
			} else {
				addSnackbar( __('Connection failed: ' + result.error, 'sahajanand-erp') );
			}
		} catch ( err ) {
			addSnackbar( __('Error testing connection: ' + (err.message || JSON.stringify(err)), 'sahajanand-erp') );
		}
		setIsTesting( false );
	};

	const fetchMailboxes = async () => {
		setLoading( true );
		try {
			const data = await apiFetch({ path: '/sahajanand-erp/v1/helpdesk/mailboxes' });
			setMailboxes( data );
		} catch (err) {
			addSnackbar( __( 'Failed to fetch mailboxes.', 'sahajanand-erp' ) );
		} finally {
			setLoading( false );
		}
	};

	useEffect(() => { fetchMailboxes(); }, []);

	const handleSave = async ( data ) => {
		try {
			if ( editingItem && editingItem.id ) {
				await apiFetch({
					path: `/sahajanand-erp/v1/helpdesk/mailboxes/${editingItem.id}`,
					method: 'POST',
					data
				});
				addSnackbar( __('Mailbox updated.', 'sahajanand-erp') );
			} else {
				await apiFetch({
					path: '/sahajanand-erp/v1/helpdesk/mailboxes',
					method: 'POST',
					data
				});
				addSnackbar( __('Mailbox created.', 'sahajanand-erp') );
			}
			setIsModalOpen(false);
			fetchMailboxes();
		} catch (err) {
			addSnackbar( __('Error saving mailbox: ' + (err.message || JSON.stringify(err)), 'sahajanand-erp') );
		}
	};

	const handleDelete = async ( id ) => {
		if ( window.confirm( __('Are you sure you want to delete this mailbox?', 'sahajanand-erp') ) ) {
			try {
				await apiFetch({ path: `/sahajanand-erp/v1/helpdesk/mailboxes/${id}`, method: 'DELETE' });
				addSnackbar( __('Mailbox deleted.', 'sahajanand-erp') );
				fetchMailboxes();
			} catch (err) {
				addSnackbar( __('Error deleting mailbox.', 'sahajanand-erp') );
			}
		}
	};

	const actions = useMemo(
		() => [
			{
				id: 'edit',
				label: __( 'Edit', 'sahajanand-erp' ),
				isPrimary: true,
				callback: ( items ) => {
					if ( items.length > 0 ) {
						setEditingItem( items[0] );
						setIsModalOpen( true );
					}
				},
			},
			{
				id: 'delete',
				label: __( 'Delete', 'sahajanand-erp' ),
				isDestructive: true,
				callback: ( items ) => {
					if ( items.length > 0 ) handleDelete( items[0].id );
				},
			},
		],
		[]
	);

	if (loading) return <Spinner />;

	return (
		<div>
			<Flex justify="flex-end" style={{ marginBottom: '16px' }}>
				<Button variant="primary" onClick={() => { setEditingItem(null); setIsModalOpen(true); }}>
					{ __('Add Mailbox', 'sahajanand-erp') }
				</Button>
			</Flex>
			
			<div style={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '4px' }}>
				<DataViews
					data={ mailboxes }
					customActions={ ( formData ) => (
					<Button
						variant="secondary"
						isBusy={ isTesting }
						disabled={ isTesting }
						onClick={ () => handleTestConnection( formData ) }
						style={ { marginRight: 'auto' } }
					>
						{ __('Test Connection', 'sahajanand-erp') }
					</Button>
				) }
				fields={[
						{ id: 'name', header: 'Name', getValue: ({item}) => item.name },
						{ id: 'email_address', header: 'Email', getValue: ({item}) => item.email_address },
						{ id: 'imap_host', header: 'IMAP Host', getValue: ({item}) => item.imap_host },
					]}
					actions={ actions }
					view={{ type: 'table', perPage: 20, page: 1, sort: { field: 'id', direction: 'desc' }, search: '', filters: [], fields: ['name', 'email_address', 'imap_host'] }}
					onChangeView={() => {}}
					defaultLayouts={{ table: { layout: { primaryField: 'name' } } }}
					paginationInfo={{ totalItems: mailboxes.length, totalPages: 1 }}
				/>
			</div>

			<EditModal
				title={ editingItem ? 'Edit Mailbox' : 'Add Mailbox' }
				isOpen={ isModalOpen }
				onClose={ () => setIsModalOpen(false) }
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
						{ __('Test Connection', 'sahajanand-erp') }
					</Button>
				) }
				fields={[
					{ key: 'name', label: 'Mailbox Name', type: 'text' },
					{ key: 'email_address', label: 'Email Address', type: 'text' },
					{ key: 'imap_host', label: 'IMAP Host', type: 'text' },
					{ key: 'imap_port', label: 'IMAP Port', type: 'text' },
					{ key: 'imap_user', label: 'IMAP Username', type: 'text' },
					{ key: 'imap_pass', label: 'IMAP Password', type: 'text' },
					{ key: 'smtp_host', label: 'SMTP Host', type: 'text' },
					{ key: 'smtp_port', label: 'SMTP Port', type: 'text' },
					{ key: 'smtp_user', label: 'SMTP Username', type: 'text' },
					{ key: 'smtp_pass', label: 'SMTP Password', type: 'text' },
					{ key: 'signature', label: 'Signature', type: 'textarea' },
				]}
			/>
		</div>
	);
};
export default MailboxesList;
