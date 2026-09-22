/**
 * Helpdesk Module App
 */
import { useState, useEffect, useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	Spinner,
	Notice,
	Flex,
	TabPanel,
	Button,
	SnackbarList,
} from '@wordpress/components';
import { DataViews } from '@wordpress/dataviews';
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

	// Navigation State
	const [ viewState, setViewState ] = useState( 'dashboard' ); // 'dashboard', 'mailbox', 'settings'
	const [ currentMailboxId, setCurrentMailboxId ] = useState( null );
	const [ settingsTab, setSettingsTab ] = useState( 'mailboxes' );
	const [ currentUser, setCurrentUser ] = useState( null );

	useEffect( () => {
		apiFetch({ path: '/wp/v2/users/me' }).then(u => setCurrentUser(u)).catch(() => {});
	}, [] );


	useEffect( () => {
		fetchTickets();
		fetchMailboxes();
	}, [] );

	const fetchTickets = async () => {
		setLoading( true );
		setError( null );
		try {
			const data = await apiFetch( { path: '/sahajanand-erp/v1/helpdesk/tickets' } );
			setTickets( data );
		} catch ( err ) {
			setError( err.message );
		} finally {
			setLoading( false );
		}
	};

	const fetchMailboxes = async () => {
		try {
			const data = await apiFetch({ path: '/sahajanand-erp/v1/helpdesk/mailboxes' });
			setMailboxes(data);
		} catch (e) {}
	};

	const addSnackbar = ( message ) => {
		setSnackbars( ( prev ) => [ ...prev, { id: Date.now().toString(), content: message } ] );
	};

	const removeSnackbar = ( id ) => {
		setSnackbars( ( prev ) => prev.filter( ( s ) => s.id !== id ) );
	};

	const handleFetchEmails = async () => {
		setIsFetchingEmails(true);
		try {
			await apiFetch({ path: '/sahajanand-erp/v1/helpdesk/fetch-emails', method: 'POST' });
			addSnackbar('Emails fetched successfully from IMAP.');
			fetchTickets();
		} catch (e) {
			addSnackbar('Failed to fetch emails.');
		} finally {
			setIsFetchingEmails(false);
		}
	};

	const handleAddNew = () => {
		setEditingTicket( null );
		setIsEditModalOpen( true );
	};

	const handleDelete = async ( item ) => {
		if ( window.confirm( __( 'Are you sure you want to delete this ticket?', 'sahajanand-erp' ) ) ) {
			try {
				await apiFetch( { path: `/sahajanand-erp/v1/helpdesk/tickets/${ item.id }`, method: 'DELETE' } );
				addSnackbar( __( 'Ticket deleted successfully.', 'sahajanand-erp' ) );
				fetchTickets();
			} catch ( err ) {
				addSnackbar( __( 'Failed to delete ticket.', 'sahajanand-erp' ) );
			}
		}
	};

	const handleSave = async ( data ) => {
		try {
			if ( editingTicket && editingTicket.id ) {
				await apiFetch( { path: `/sahajanand-erp/v1/helpdesk/tickets/${ editingTicket.id }`, method: 'POST', data } );
				addSnackbar( __( 'Ticket updated successfully.', 'sahajanand-erp' ) );
			} else {
				// if we are in a mailbox view, auto-assign mailbox_id if not selected
				if ( !data.mailbox_id && currentMailboxId ) {
					data.mailbox_id = currentMailboxId;
				}
				await apiFetch( { path: '/sahajanand-erp/v1/helpdesk/tickets', method: 'POST', data } );
				addSnackbar( __( 'Ticket created successfully.', 'sahajanand-erp' ) );
			}
			fetchTickets();
			setIsEditModalOpen( false );
		} catch ( err ) {
			addSnackbar( __( 'Failed to save ticket: ' + (err.message || JSON.stringify(err)), 'sahajanand-erp' ) );
		}
	};

	if ( loading && !tickets.length ) {
		return (
			<Flex justify="center" style={ { padding: '32px' } }>
				<Spinner />
			</Flex>
		);
	}

	return (
		<div className="sahajanand-erp-helpdesk">
			{ error && (
				<Notice status="error" isDismissible={ false } onRemove={ () => setError( null ) }>
					{ error }
				</Notice>
			) }

			<div style={ { padding: '16px 40px', backgroundColor: '#007cba', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } }>
				<div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
					<h1 style={ { margin: 0, fontSize: '20px', fontWeight: 500, color: '#fff', cursor: 'pointer' } } onClick={() => setViewState('dashboard')}>
						{ __( 'Sahajanand Digital Dashboard', 'sahajanand-erp' ) }
					</h1>
				</div>
				<div>
					<Button isLink style={{ color: '#fff', textDecoration: 'none' }} onClick={() => setViewState('settings')}>
						Manage Settings
					</Button>
				</div>
			</div>

			<div style={ { padding: '24px 40px' } }>
				{ viewState === 'dashboard' && (
					<Dashboard 
						mailboxes={mailboxes} 
						tickets={tickets}
						currentUser={currentUser} 
						onSelectMailbox={(id) => { setCurrentMailboxId(id); setViewState('mailbox'); }} 
					/>
				)}

								{ viewState === 'mailbox' && currentMailboxId && (
					<MailboxView 
						mailbox={mailboxes.find(m => m.id === currentMailboxId)}
						tickets={tickets}
						currentUser={currentUser}
						currentUser={currentUser}
						onBackToDashboard={() => setViewState('dashboard')}
						onSettingsClick={() => setViewState('settings')}
						handleAddNew={handleAddNew}
						handleFetchEmails={handleFetchEmails}
						addSnackbar={addSnackbar}
						fetchTickets={fetchTickets}
						handleDelete={handleDelete}
						handleSave={handleSave}
					/>
				)}

				{ viewState === 'settings' && (
					<div>
						<Button isLink onClick={() => setViewState('dashboard')} style={{ marginBottom: '16px' }}>&larr; Back to Dashboard</Button>
						<TabPanel
							className="sahajanand-erp-helpdesk-tabs"
							activeClass="is-active"
							initialTabName={ settingsTab }
							onSelect={ setSettingsTab }
							tabs={ [
								{ name: 'mailboxes', title: __( 'Mailboxes', 'sahajanand-erp' ) },
								{ name: 'saved_replies', title: __( 'Saved Replies', 'sahajanand-erp' ) },
							] }
						>
							{ ( tab ) => {
								if ( tab.name === 'mailboxes' ) return <MailboxesList addSnackbar={addSnackbar} />;
								if ( tab.name === 'saved_replies' ) return <SavedRepliesList addSnackbar={addSnackbar} />;
								return null;
							} }
						</TabPanel>
					</div>
				)}
			</div>

			<EditModal
				title={ editingTicket ? __( 'Edit Ticket', 'sahajanand-erp' ) : __( 'Create Ticket', 'sahajanand-erp' ) }
				isOpen={ isEditModalOpen }
				onClose={ () => setIsEditModalOpen( false ) }
				onSave={ handleSave }
				data={ editingTicket }
				fields={[
					{ key: 'customer_email', label: __( 'Customer Email', 'sahajanand-erp' ), type: 'text' },
					{ key: 'subject', label: __( 'Subject', 'sahajanand-erp' ), type: 'text' },
					{ key: 'mailbox_id', label: __( 'Mailbox', 'sahajanand-erp' ), type: 'select', options: [ { label: 'Select...', value: '' }, ...mailboxes.map(m => ({label: m.name, value: m.id})) ] },
					{ key: 'description', label: __( 'Description', 'sahajanand-erp' ), type: 'textarea' },
					{ key: 'priority', label: __( 'Priority', 'sahajanand-erp' ), type: 'select', options: [ { label: 'Low', value: 'low' }, { label: 'Medium', value: 'medium' }, { label: 'High', value: 'high' } ] },
				]}
			/>

			<SnackbarList
				notices={ snackbars }
				onRemove={ removeSnackbar }
				style={ { position: 'fixed', bottom: '20px', left: '20px', zIndex: 100000 } }
			/>
		</div>
	);
};

export default HelpdeskApp;
