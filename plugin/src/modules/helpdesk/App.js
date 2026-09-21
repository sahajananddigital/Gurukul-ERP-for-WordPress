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

const HelpdeskApp = () => {
	const [ tickets, setTickets ] = useState( [] );
	const [ loading, setLoading ] = useState( true );
	const [ error, setError ] = useState( null );
	const [ activeTab, setActiveTab ] = useState( 'tickets' );

	// Edit Modal & Snackbar State
	const [ isEditModalOpen, setIsEditModalOpen ] = useState( false );
	const [ editingTicket, setEditingTicket ] = useState( null );
	const [ snackbars, setSnackbars ] = useState( [] );

	const [ view, setView ] = useState( {
		type: 'table',
		perPage: 20,
		page: 1,
		sort: {
			field: 'ticket_id',
			direction: 'desc',
		},
		search: '',
		filters: [],
		fields: [ 'ticket_id', 'subject', 'priority', 'status', 'created_at' ],
	} );

	useEffect( () => {
		if ( activeTab === 'tickets' ) {
			fetchTickets();
		}
	}, [ activeTab ] );

	const addSnackbar = ( message ) => {
		setSnackbars( ( prev ) => [
			...prev,
			{ id: Date.now().toString(), content: message },
		] );
	};

	const removeSnackbar = ( id ) => {
		setSnackbars( ( prev ) => prev.filter( ( s ) => s.id !== id ) );
	};

	const fetchTickets = async () => {
		setLoading( true );
		setError( null );
		try {
			const data = await apiFetch( {
				path: '/sahajanand-erp/v1/helpdesk/tickets',
			} );
			setTickets( data );
		} catch ( err ) {
			setError(
				err.message || __( 'Failed to fetch tickets', 'sahajanand-erp' )
			);
		} finally {
			setLoading( false );
		}
	};

	const handleAddNew = () => {
		setEditingTicket( { priority: 'medium', status: 'open' } ); // defaults
		setIsEditModalOpen( true );
	};

	const handleEdit = ( item ) => {
		setEditingTicket( item );
		setIsEditModalOpen( true );
	};

	const handleDelete = async ( item ) => {
		if (
			window.confirm(
				__( 'Are you sure you want to delete this ticket?', 'sahajanand-erp' )
			)
		) {
			try {
				await apiFetch( {
					path: `/sahajanand-erp/v1/helpdesk/tickets/${ item.id }`,
					method: 'DELETE',
				} );
				addSnackbar( __( 'Ticket deleted successfully.', 'sahajanand-erp' ) );
				fetchTickets();
			} catch ( err ) {
				// eslint-disable-next-line no-console
				console.error( err );
				addSnackbar( __( 'Failed to delete ticket.', 'sahajanand-erp' ) );
			}
		}
	};

	const handleSave = async ( data ) => {
		try {
			if ( editingTicket && editingTicket.id ) {
				await apiFetch( {
					path: `/sahajanand-erp/v1/helpdesk/tickets/${ editingTicket.id }`,
					method: 'POST',
					data,
				} );
				addSnackbar( __( 'Ticket updated successfully.', 'sahajanand-erp' ) );
			} else {
				await apiFetch( {
					path: '/sahajanand-erp/v1/helpdesk/tickets',
					method: 'POST',
					data,
				} );
				addSnackbar( __( 'Ticket created successfully.', 'sahajanand-erp' ) );
			}
			fetchTickets();
		} catch ( err ) {
			// eslint-disable-next-line no-console
			console.error( err );
			addSnackbar( __( 'Failed to save ticket.', 'sahajanand-erp' ) );
		}
	};

	const getPriorityColor = ( priority ) => {
		switch ( priority ) {
			case 'urgent':
				return '#d63638';
			case 'high':
				return '#dba617';
			case 'medium':
				return '#2271b1';
			default:
				return '#00a32a';
		}
	};

	const getStatusColor = ( status ) => {
		switch ( status ) {
			case 'open':
				return '#d63638';
			case 'closed':
				return '#757575';
			default:
				return '#00a32a';
		}
	};

	const fields = useMemo(
		() => [
			{
				id: 'ticket_id',
				header: __( 'Ticket ID', 'sahajanand-erp' ),
				getValue: ( { item } ) =>
					item.ticket_id ||
					item.ticket_no ||
					( item.id ? String( item.id ) : '-' ),
				enableSorting: true,
			},
			{
				id: 'subject',
				header: __( 'Subject', 'sahajanand-erp' ),
				getValue: ( { item } ) => item.subject || '-',
				enableSorting: true,
			},
			{
				id: 'priority',
				header: __( 'Priority', 'sahajanand-erp' ),
				getValue: ( { item } ) => item.priority,
				render: ( { item } ) => (
					<span
						style={ {
							padding: '4px 8px',
							borderRadius: '2px',
							backgroundColor: getPriorityColor( item.priority ),
							color: '#fff',
							fontSize: '12px',
							textTransform: 'capitalize',
						} }
					>
						{ item.priority }
					</span>
				),
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
			{
				id: 'created_at',
				header: __( 'Created', 'sahajanand-erp' ),
				getValue: ( { item } ) => item.created_at || '-',
				enableSorting: true,
			},
		],
		[]
	);

	const actions = useMemo(
		() => [
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
				isDestructive: true,
				callback: ( items ) => {
					if ( items.length > 0 ) {
						handleDelete( items[ 0 ] );
					}
				},
			},
		],
		[]
	);

	const defaultLayouts = useMemo(
		() => ( {
			table: {
				layout: {
					primaryField: 'ticket_id',
				},
			},
		} ),
		[]
	);

	const renderTicketsList = () => {
		if ( loading ) {
			return (
				<Flex justify="center" style={ { padding: '32px' } }>
					<Spinner />
				</Flex>
			);
		}

		return (
			<div>
				<Flex justify="flex-end" style={ { marginBottom: '16px' } }>
					<Button variant="primary" onClick={ handleAddNew }>
						{ __( 'Add New Ticket', 'sahajanand-erp' ) }
					</Button>
				</Flex>

				{ tickets.length === 0 ? (
					<Notice status="info" isDismissible={ false }>
						{ __( 'No tickets found.', 'sahajanand-erp' ) }
					</Notice>
				) : (
					<div
						style={ {
							backgroundColor: '#fff',
							border: '1px solid #e0e0e0',
							borderRadius: '4px',
						} }
					>
						<DataViews
							data={ tickets }
							fields={ fields }
							actions={ actions }
							view={ view }
							onChangeView={ setView }
							defaultLayouts={ defaultLayouts }
							paginationInfo={ {
								totalItems: tickets.length,
								totalPages: Math.ceil( tickets.length / view.perPage ),
							} }
						/>
					</div>
				) }
			</div>
		);
	};

	const ticketFields = [
		{ key: 'subject', label: __( 'Subject', 'sahajanand-erp' ), type: 'text' },
		{ key: 'description', label: __( 'Description', 'sahajanand-erp' ), type: 'textarea' },
		{
			key: 'priority',
			label: __( 'Priority', 'sahajanand-erp' ),
			type: 'select',
			options: [
				{ label: 'Low', value: 'low' },
				{ label: 'Medium', value: 'medium' },
				{ label: 'High', value: 'high' },
				{ label: 'Urgent', value: 'urgent' },
			],
		},
		{
			key: 'status',
			label: __( 'Status', 'sahajanand-erp' ),
			type: 'select',
			options: [
				{ label: 'Open', value: 'open' },
				{ label: 'Closed', value: 'closed' },
			],
		},
	];

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

			<div style={{ padding: '32px 40px', borderBottom: '1px solid #e0e0e0' }}>
				<h1 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>
					{ __( 'Helpdesk Management', 'sahajanand-erp' ) }
				</h1>
			</div>
			<div style={{ padding: '0 40px' }}>
				<TabPanel
					className="sahajanand-erp-helpdesk-tabs"
					activeClass="is-active"
					initialTabName={ activeTab }
					onSelect={ ( tabName ) => setActiveTab( tabName ) }
					tabs={ [
						{
							name: 'tickets',
							title: __( 'Tickets', 'sahajanand-erp' ),
							className: 'tab-tickets',
						}
					] }
				>
					{ ( tab ) => {
						if ( tab.name === 'tickets' ) {
							return renderTicketsList();
						}
						return null;
					} }
				</TabPanel>
			</div>

			<EditModal
				title={ editingTicket && editingTicket.id ? __( 'Edit Ticket', 'sahajanand-erp' ) : __( 'Create New Ticket', 'sahajanand-erp' ) }
				isOpen={ isEditModalOpen }
				onClose={ () => setIsEditModalOpen( false ) }
				onSave={ handleSave }
				data={ editingTicket }
				fields={ ticketFields }
			/>

			<SnackbarList
				notices={ snackbars }
				onRemove={ removeSnackbar }
				style={{ position: 'fixed', bottom: '20px', left: '20px', zIndex: 100000 }}
			/>
		</div>
	);
};

export default HelpdeskApp;
