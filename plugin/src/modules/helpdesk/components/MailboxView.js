import { useState, useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Flex, Button, Card, CardBody } from '@wordpress/components';
import { DataViews } from '@wordpress/dataviews';
import TicketDetail from './TicketDetail';

const MailboxView = ({ mailbox, tickets, currentUser, onBackToDashboard, onSettingsClick, handleAddNew, handleFetchEmails, addSnackbar, fetchTickets, handleDelete, handleSave }) => {
	const [ selectedFolder, setSelectedFolder ] = useState( 'unassigned' );
	const [ selectedTicketId, setSelectedTicketId ] = useState( null );

	const filteredTickets = useMemo(() => {
		let current = tickets.filter(t => t.mailbox_id == mailbox.id);
		
		if ( selectedFolder === 'unassigned' ) {
			current = current.filter(t => !t.assignee_id && t.status !== 'closed');
		} else if ( selectedFolder === 'mine' ) {
			const myId = currentUser ? currentUser.id : null;
			current = current.filter(t => t.assignee_id == myId && t.status !== 'closed');
		} else if ( selectedFolder === 'closed' ) {
			current = current.filter(t => t.status === 'closed');
		} else if ( selectedFolder === 'assigned' ) {
			current = current.filter(t => t.assignee_id && t.status !== 'closed');
		}
		return current;
	}, [ tickets, mailbox, selectedFolder ]);

	const fields = useMemo(
		() => [
			{
				id: 'customer',
				header: __( 'Customer', 'sahajanand-erp' ),
				getValue: ( { item } ) => item.customer_name || item.customer_email || 'Unknown',
				enableSorting: true,
			},
			{
				id: 'conversation',
				header: __( 'Conversation', 'sahajanand-erp' ),
				getValue: ( { item } ) => item.subject,
				enableSorting: true,
			},
			{
				id: 'ticket_no',
				header: __( 'Number', 'sahajanand-erp' ),
				getValue: ( { item } ) => item.ticket_no,
				enableSorting: true,
			},
			{
				id: 'created_at',
				header: __( 'Waiting Since', 'sahajanand-erp' ),
				getValue: ( { item } ) => {
					// crude time ago
					const diff = Math.floor((new Date() - new Date(item.created_at)) / 3600000);
					return diff > 24 ? Math.floor(diff/24) + ' days ago' : diff + ' hours ago';
				},
				enableSorting: true,
			},
		],
		[]
	);

	const actions = useMemo(
		() => [
			{
				id: 'view',
				label: __( 'View Conversation', 'sahajanand-erp' ),
				isPrimary: true,
				callback: ( items ) => {
					if ( items.length > 0 ) setSelectedTicketId( items[ 0 ].id );
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

	const [ view, setView ] = useState( {
		type: 'table',
		perPage: 20,
		page: 1,
		sort: { field: 'created_at', direction: 'desc' },
		search: '',
		filters: [],
		fields: [ 'customer', 'conversation', 'ticket_no', 'created_at' ],
	} );

	const defaultLayouts = useMemo(
		() => ( {
			table: {
				layout: {
					primaryField: 'conversation',
				},
			},
		} ),
		[]
	);

	const folderStyle = (folder) => ({
		padding: '12px 16px',
		cursor: 'pointer',
		fontWeight: selectedFolder === folder ? 'bold' : 'normal',
		backgroundColor: selectedFolder === folder ? '#e3f2fd' : 'transparent',
		color: selectedFolder === folder ? '#007cba' : '#666',
		borderLeft: selectedFolder === folder ? '3px solid #007cba' : '3px solid transparent'
	});

	return (
		<div style={{ display: 'flex', minHeight: 'calc(100vh - 100px)', margin: '-24px -40px' }}>
			{/* Left Sidebar */}
			<div style={{ width: '250px', backgroundColor: '#f9f9f9', borderRight: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column' }}>
				<div style={{ padding: '24px 16px', borderBottom: '1px solid #e0e0e0' }}>
					<Button isLink onClick={onBackToDashboard} style={{ marginBottom: '12px' }}>&larr; Dashboard</Button>
					<h2 style={{ margin: 0, fontSize: '20px' }}>{mailbox.name}</h2>
					<p style={{ margin: '4px 0 0 0', color: '#757575', fontSize: '13px' }}>{mailbox.email_address}</p>
				</div>
				<ul style={{ listStyle: 'none', margin: 0, padding: 0, flex: 1 }}>
					<li style={folderStyle('unassigned')} onClick={() => { setSelectedFolder('unassigned'); setSelectedTicketId(null); }}>
						Unassigned
					</li>
					<li style={folderStyle('mine')} onClick={() => { setSelectedFolder('mine'); setSelectedTicketId(null); }}>
						Mine
					</li>
					<li style={folderStyle('starred')} onClick={() => { setSelectedFolder('starred'); setSelectedTicketId(null); }}>
						Starred
					</li>
					<li style={folderStyle('assigned')} onClick={() => { setSelectedFolder('assigned'); setSelectedTicketId(null); }}>
						Assigned
					</li>
					<li style={folderStyle('closed')} onClick={() => { setSelectedFolder('closed'); setSelectedTicketId(null); }}>
						Closed
					</li>
				</ul>
				<div style={{ padding: '16px', borderTop: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between' }}>
					<Button icon="admin-generic" onClick={onSettingsClick} title="Settings" />
					<Button icon="email" isSecondary onClick={handleFetchEmails} title="Fetch Emails" />
				</div>
			</div>

			{/* Main Content Area */}
			<div style={{ flex: 1, backgroundColor: '#fff', display: 'flex', flexDirection: 'column' }}>
				{ selectedTicketId ? (
					<div style={{ padding: '24px', overflowY: 'auto' }}>
						<TicketDetail 
							ticketId={selectedTicketId} 
							onBack={() => { setSelectedTicketId(null); fetchTickets(); }}
							addSnackbar={addSnackbar} 
						/>
					</div>
				) : (
					<div style={{ padding: '24px', overflowY: 'auto' }}>
						<Flex justify="flex-end" style={{ marginBottom: '16px' }}>
							<Button variant="primary" onClick={handleAddNew}>New Conversation</Button>
						</Flex>
						<DataViews
							data={ filteredTickets }
							fields={ fields }
							actions={ actions }
							view={ view }
							onChangeView={ setView }
							defaultLayouts={ defaultLayouts }
							paginationInfo={ {
								totalItems: filteredTickets.length,
								totalPages: Math.ceil( filteredTickets.length / view.perPage ),
							} }
						/>
					</div>
				) }
			</div>
		</div>
	);
};

export default MailboxView;
