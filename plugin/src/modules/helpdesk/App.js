/**
 * Helpdesk Module App
 */
import { useState, useEffect } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import {
	Spinner,
	Notice,
	Flex,
	Card,
	CardBody,
	TabPanel,
	Button,
	SnackbarList,
} from '@wordpress/components';
import { Heading, VStack, ConfirmDialog } from '../../components/wp-compat';
import { arrowLeft } from '@wordpress/icons';
import apiFetch from '@wordpress/api-fetch';
import EditModal from '../../components/EditModal';
import MailboxesList from './components/MailboxesList';
import SavedRepliesList from './components/SavedRepliesList';
import Dashboard from './components/Dashboard';
import MailboxView from './components/MailboxView';

const HelpdeskApp = () => {
	const [ tickets, setTickets ] = useState( [] );
	const [ mailboxes, setMailboxes ] = useState( [] );
	const [ loading, setLoading ] = useState( true );
	const [ error, setError ] = useState( null );
	const [ snackbars, setSnackbars ] = useState( [] );
	const [ isFetchingEmails, setIsFetchingEmails ] = useState( false );

	const [ editingTicket, setEditingTicket ] = useState( null );
	const [ isEditModalOpen, setIsEditModalOpen ] = useState( false );
	const [ ticketToDelete, setTicketToDelete ] = useState( null );

	// Navigation State
	const [ viewState, setViewState ] = useState( 'dashboard' ); // 'dashboard', 'mailbox', 'settings'
	const [ currentMailboxId, setCurrentMailboxId ] = useState( null );
	const [ settingsTab, setSettingsTab ] = useState( 'mailboxes' );
	const [ currentUser, setCurrentUser ] = useState( null );

	useEffect( () => {
		apiFetch( { path: '/wp/v2/users/me' } )
			.then( ( u ) => setCurrentUser( u ) )
			.catch( () => {} );
	}, [] );

	useEffect( () => {
		fetchTickets();
		fetchMailboxes();
	}, [] );

	const fetchTickets = async () => {
		setLoading( true );
		setError( null );
		try {
			const data = await apiFetch( {
				path: '/sahajanand-erp/v1/helpdesk/tickets',
			} );
			setTickets( data );
		} catch ( err ) {
			setError( err.message );
		} finally {
			setLoading( false );
		}
	};

	const fetchMailboxes = async () => {
		try {
			const data = await apiFetch( {
				path: '/sahajanand-erp/v1/helpdesk/mailboxes',
			} );
			setMailboxes( data );
		} catch ( e ) {}
	};

	const addSnackbar = ( message ) => {
		setSnackbars( ( prev ) => [
			...prev,
			{ id: Date.now().toString(), content: message },
		] );
	};

	const removeSnackbar = ( id ) => {
		setSnackbars( ( prev ) => prev.filter( ( s ) => s.id !== id ) );
	};

	const handleFetchEmails = async () => {
		setIsFetchingEmails( true );
		try {
			await apiFetch( {
				path: '/sahajanand-erp/v1/helpdesk/fetch-emails',
				method: 'POST',
			} );
			addSnackbar(
				__( 'Emails fetched successfully from IMAP.', 'sahajanand-erp' )
			);
			fetchTickets();
		} catch ( e ) {
			addSnackbar( __( 'Failed to fetch emails.', 'sahajanand-erp' ) );
		} finally {
			setIsFetchingEmails( false );
		}
	};

	const handleAddNew = () => {
		setEditingTicket( null );
		setIsEditModalOpen( true );
	};

	const handleDelete = ( item ) => {
		setTicketToDelete( item );
	};

	const confirmDelete = async () => {
		if ( ! ticketToDelete ) {
			return;
		}
		try {
			await apiFetch( {
				path: `/sahajanand-erp/v1/helpdesk/tickets/${ ticketToDelete.id }`,
				method: 'DELETE',
			} );
			addSnackbar(
				__( 'Ticket deleted successfully.', 'sahajanand-erp' )
			);
			fetchTickets();
		} catch ( err ) {
			addSnackbar( __( 'Failed to delete ticket.', 'sahajanand-erp' ) );
		}
		setTicketToDelete( null );
	};

	const handleSave = async ( data ) => {
		try {
			if ( editingTicket && editingTicket.id ) {
				await apiFetch( {
					path: `/sahajanand-erp/v1/helpdesk/tickets/${ editingTicket.id }`,
					method: 'POST',
					data,
				} );
				addSnackbar(
					__( 'Ticket updated successfully.', 'sahajanand-erp' )
				);
			} else {
				// if we are in a mailbox view, auto-assign mailbox_id if not selected
				if ( ! data.mailbox_id && currentMailboxId ) {
					data.mailbox_id = currentMailboxId;
				}
				await apiFetch( {
					path: '/sahajanand-erp/v1/helpdesk/tickets',
					method: 'POST',
					data,
				} );
				addSnackbar(
					__( 'Ticket created successfully.', 'sahajanand-erp' )
				);
			}
			fetchTickets();
			setIsEditModalOpen( false );
		} catch ( err ) {
			addSnackbar(
				sprintf(
					/* translators: %s: Error message. */
					__( 'Failed to save ticket: %s', 'sahajanand-erp' ),
					err.message || JSON.stringify( err )
				)
			);
		}
	};

	if ( loading && ! tickets.length ) {
		return (
			<Flex justify="center" style={ { padding: '32px' } }>
				<Spinner />
			</Flex>
		);
	}

	return (
		<div className="sahajanand-erp-helpdesk">
			{ error && (
				<Notice
					status="error"
					isDismissible={ false }
					onRemove={ () => setError( null ) }
				>
					{ error }
				</Notice>
			) }

			<Card>
				<CardBody>
					<Flex justify="space-between" align="center">
						<Heading
							level={ 1 }
							style={ { margin: 0, cursor: 'pointer' } }
							onClick={ () => setViewState( 'dashboard' ) }
						>
							{ __(
								'Sahajanand Digital Dashboard',
								'sahajanand-erp'
							) }
						</Heading>
						<Button
							variant="secondary"
							onClick={ () => setViewState( 'settings' ) }
						>
							{ __( 'Manage Settings', 'sahajanand-erp' ) }
						</Button>
					</Flex>
				</CardBody>
			</Card>

			<VStack spacing={ 5 } style={ { padding: '24px 40px' } }>
				{ viewState === 'dashboard' && (
					<Dashboard
						mailboxes={ mailboxes }
						tickets={ tickets }
						currentUser={ currentUser }
						onSelectMailbox={ ( id ) => {
							setCurrentMailboxId( id );
							setViewState( 'mailbox' );
						} }
					/>
				) }

				{ viewState === 'mailbox' && currentMailboxId && (
					<MailboxView
						mailbox={ mailboxes.find(
							( m ) => m.id === currentMailboxId
						) }
						tickets={ tickets }
						currentUser={ currentUser }
						onBackToDashboard={ () => setViewState( 'dashboard' ) }
						onSettingsClick={ () => setViewState( 'settings' ) }
						handleAddNew={ handleAddNew }
						handleFetchEmails={ handleFetchEmails }
						isFetchingEmails={ isFetchingEmails }
						addSnackbar={ addSnackbar }
						fetchTickets={ fetchTickets }
						handleDelete={ handleDelete }
					/>
				) }

				{ viewState === 'settings' && (
					<VStack spacing={ 4 }>
						<Flex>
							<Button
								variant="link"
								icon={ arrowLeft }
								onClick={ () => setViewState( 'dashboard' ) }
							>
								{ __( 'Back to Dashboard', 'sahajanand-erp' ) }
							</Button>
						</Flex>
						<TabPanel
							className="sahajanand-erp-helpdesk-tabs"
							activeClass="is-active"
							initialTabName={ settingsTab }
							onSelect={ setSettingsTab }
							tabs={ [
								{
									name: 'mailboxes',
									title: __( 'Mailboxes', 'sahajanand-erp' ),
								},
								{
									name: 'saved_replies',
									title: __(
										'Saved Replies',
										'sahajanand-erp'
									),
								},
							] }
						>
							{ ( tab ) => {
								if ( tab.name === 'mailboxes' ) {
									return (
										<MailboxesList
											addSnackbar={ addSnackbar }
										/>
									);
								}
								if ( tab.name === 'saved_replies' ) {
									return (
										<SavedRepliesList
											addSnackbar={ addSnackbar }
										/>
									);
								}
								return null;
							} }
						</TabPanel>
					</VStack>
				) }
			</VStack>

			<EditModal
				title={
					editingTicket
						? __( 'Edit Ticket', 'sahajanand-erp' )
						: __( 'Create Ticket', 'sahajanand-erp' )
				}
				isOpen={ isEditModalOpen }
				onClose={ () => setIsEditModalOpen( false ) }
				onSave={ handleSave }
				data={ editingTicket }
				fields={ [
					{
						key: 'customer_email',
						label: __( 'Customer Email', 'sahajanand-erp' ),
						type: 'text',
					},
					{
						key: 'subject',
						label: __( 'Subject', 'sahajanand-erp' ),
						type: 'text',
					},
					{
						key: 'mailbox_id',
						label: __( 'Mailbox', 'sahajanand-erp' ),
						type: 'select',
						options: [
							{ label: 'Select...', value: '' },
							...mailboxes.map( ( m ) => ( {
								label: m.name,
								value: m.id,
							} ) ),
						],
					},
					{
						key: 'description',
						label: __( 'Description', 'sahajanand-erp' ),
						type: 'textarea',
					},
					{
						key: 'priority',
						label: __( 'Priority', 'sahajanand-erp' ),
						type: 'select',
						options: [
							{ label: 'Low', value: 'low' },
							{ label: 'Medium', value: 'medium' },
							{ label: 'High', value: 'high' },
						],
					},
				] }
			/>

			<SnackbarList
				notices={ snackbars }
				onRemove={ removeSnackbar }
				style={ {
					position: 'fixed',
					bottom: '20px',
					left: '20px',
					zIndex: 100000,
				} }
			/>

			<ConfirmDialog
				isOpen={ !! ticketToDelete }
				onConfirm={ confirmDelete }
				onCancel={ () => setTicketToDelete( null ) }
				confirmButtonText={ __( 'Delete', 'sahajanand-erp' ) }
			>
				{ __(
					'Are you sure you want to delete this ticket?',
					'sahajanand-erp'
				) }
			</ConfirmDialog>
		</div>
	);
};

export default HelpdeskApp;
