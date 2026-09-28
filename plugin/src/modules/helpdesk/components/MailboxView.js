import { useState, useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	Flex,
	Button,
	Card,
	CardBody,
	CardFooter,
} from '@wordpress/components';
import { Heading, Text, VStack } from '../../../components/wp-compat';
import { arrowLeft, cog, envelope } from '@wordpress/icons';
import { DataViews } from '@wordpress/dataviews';
import apiFetch from '@wordpress/api-fetch';
import TicketDetail from './TicketDetail';

const MailboxView = ( {
	mailbox,
	tickets,
	currentUser,
	onBackToDashboard,
	onSettingsClick,
	handleAddNew,
	handleFetchEmails,
	isFetchingEmails,
	addSnackbar,
	fetchTickets,
	handleDelete,
} ) => {
	const [ selectedFolder, setSelectedFolder ] = useState( 'unassigned' );
	const [ selectedTicketId, setSelectedTicketId ] = useState( null );

	const folders = useMemo(
		() => [
			{
				value: 'unassigned',
				label: __( 'Unassigned', 'sahajanand-erp' ),
			},
			{ value: 'mine', label: __( 'Mine', 'sahajanand-erp' ) },
			{ value: 'starred', label: __( 'Starred', 'sahajanand-erp' ) },
			{ value: 'assigned', label: __( 'Assigned', 'sahajanand-erp' ) },
			{ value: 'closed', label: __( 'Closed', 'sahajanand-erp' ) },
			{ value: 'spam', label: __( 'Spam', 'sahajanand-erp' ) },
			{ value: 'trash', label: __( 'Trash', 'sahajanand-erp' ) },
		],
		[]
	);

	const filteredTickets = useMemo( () => {
		const all = tickets.filter( ( t ) => t.mailbox_id == mailbox.id );
		const active = all.filter(
			( t ) => ! Number( t.is_deleted ) && ! Number( t.is_spam )
		);
		const myId = currentUser ? currentUser.id : null;

		switch ( selectedFolder ) {
			case 'mine':
				return active.filter(
					( t ) => t.assignee_id == myId && t.status !== 'closed'
				);
			case 'starred':
				return all.filter(
					( t ) => Number( t.is_starred ) && ! Number( t.is_deleted )
				);
			case 'assigned':
				return active.filter(
					( t ) => t.assignee_id && t.status !== 'closed'
				);
			case 'closed':
				return active.filter( ( t ) => t.status === 'closed' );
			case 'spam':
				return all.filter(
					( t ) => Number( t.is_spam ) && ! Number( t.is_deleted )
				);
			case 'trash':
				return all.filter( ( t ) => Number( t.is_deleted ) );
			case 'unassigned':
			default:
				return active.filter(
					( t ) => ! t.assignee_id && t.status !== 'closed'
				);
		}
	}, [ tickets, mailbox, selectedFolder, currentUser ] );

	const updateTicket = async ( ticket, data, message ) => {
		if ( ! ticket ) {
			return;
		}
		try {
			await apiFetch( {
				path: `/sahajanand-erp/v1/helpdesk/tickets/${ ticket.id }`,
				method: 'POST',
				data,
			} );
			addSnackbar( message );
			fetchTickets();
		} catch {
			addSnackbar(
				__( 'Failed to update the conversation.', 'sahajanand-erp' )
			);
		}
	};

	const fields = useMemo(
		() => [
			{
				id: 'customer',
				header: __( 'Customer', 'sahajanand-erp' ),
				getValue: ( { item } ) =>
					item.customer_name || item.customer_email || 'Unknown',
				enableSorting: true,
			},
			{
				id: 'conversation',
				header: __( 'Conversation', 'sahajanand-erp' ),
				getValue: ( { item } ) =>
					`${ Number( item.is_starred ) ? '★ ' : '' }${
						item.subject
					}`,
				enableSorting: true,
			},
			{
				id: 'ticket_no',
				header: __( 'Number', 'sahajanand-erp' ),
				getValue: ( { item } ) => item.ticket_no,
				enableSorting: true,
			},
			{
				id: 'status',
				header: __( 'Status', 'sahajanand-erp' ),
				getValue: ( { item } ) => item.status,
				enableSorting: true,
			},
			{
				id: 'created_at',
				header: __( 'Waiting Since', 'sahajanand-erp' ),
				getValue: ( { item } ) => {
					// crude time ago
					const diff = Math.floor(
						( new Date() - new Date( item.created_at ) ) / 3600000
					);
					return diff > 24
						? Math.floor( diff / 24 ) + ' days ago'
						: diff + ' hours ago';
				},
				enableSorting: true,
			},
		],
		[]
	);

	const actions = useMemo( () => {
		const list = [
			{
				id: 'view',
				label: __( 'View Conversation', 'sahajanand-erp' ),
				isPrimary: true,
				callback: ( items ) => {
					if ( items.length > 0 ) {
						setSelectedTicketId( items[ 0 ].id );
					}
				},
			},
			{
				id: 'star',
				label: ( items ) =>
					items[ 0 ] && Number( items[ 0 ].is_starred )
						? __( 'Unstar', 'sahajanand-erp' )
						: __( 'Star', 'sahajanand-erp' ),
				callback: ( items ) => {
					const ticket = items[ 0 ];
					if ( ! ticket ) {
						return;
					}
					updateTicket(
						ticket,
						{ is_starred: Number( ticket.is_starred ) ? 0 : 1 },
						Number( ticket.is_starred )
							? __( 'Conversation unstarred.', 'sahajanand-erp' )
							: __( 'Conversation starred.', 'sahajanand-erp' )
					);
				},
			},
		];

		if ( selectedFolder === 'trash' ) {
			list.push( {
				id: 'restore',
				label: __( 'Restore', 'sahajanand-erp' ),
				callback: ( items ) =>
					updateTicket(
						items[ 0 ],
						{ is_deleted: 0 },
						__( 'Conversation restored.', 'sahajanand-erp' )
					),
			} );
			list.push( {
				id: 'delete',
				label: __( 'Delete Permanently', 'sahajanand-erp' ),
				callback: ( items ) => {
					if ( items.length > 0 ) {
						handleDelete( items[ 0 ] );
					}
				},
			} );
		} else {
			if ( selectedFolder === 'spam' ) {
				list.push( {
					id: 'not-spam',
					label: __( 'Not Spam', 'sahajanand-erp' ),
					callback: ( items ) =>
						updateTicket(
							items[ 0 ],
							{ is_spam: 0 },
							__( 'Marked as not spam.', 'sahajanand-erp' )
						),
				} );
			} else {
				list.push( {
					id: 'spam',
					label: __( 'Move to Spam', 'sahajanand-erp' ),
					callback: ( items ) =>
						updateTicket(
							items[ 0 ],
							{ is_spam: 1 },
							__( 'Moved to spam.', 'sahajanand-erp' )
						),
				} );
			}
			list.push( {
				id: 'trash',
				label: __( 'Move to Trash', 'sahajanand-erp' ),
				callback: ( items ) =>
					updateTicket(
						items[ 0 ],
						{ is_deleted: 1 },
						__( 'Moved to trash.', 'sahajanand-erp' )
					),
			} );
		}

		return list;
	}, [ selectedFolder, handleDelete ] );

	const [ view, setView ] = useState( {
		type: 'table',
		perPage: 20,
		page: 1,
		sort: { field: 'created_at', direction: 'desc' },
		search: '',
		filters: [],
		fields: [
			'customer',
			'conversation',
			'ticket_no',
			'status',
			'created_at',
		],
	} );

	const defaultLayouts = useMemo(
		() => ( {
			table: {
				titleField: 'conversation',
			},
		} ),
		[]
	);

	return (
		<Flex
			align="stretch"
			style={ {
				minHeight: 'calc(100vh - 100px)',
				margin: '-24px -40px',
			} }
		>
			<Card
				style={ {
					width: '250px',
					flexShrink: 0,
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'space-between',
				} }
			>
				<CardBody>
					<VStack spacing={ 4 }>
						<Button
							variant="link"
							icon={ arrowLeft }
							onClick={ onBackToDashboard }
							style={ { alignSelf: 'flex-start' } }
						>
							{ __( 'Dashboard', 'sahajanand-erp' ) }
						</Button>
						<VStack spacing={ 0 }>
							<Heading level={ 2 }>{ mailbox.name }</Heading>
							<Text variant="muted" size="12px">
								{ mailbox.email_address }
							</Text>
						</VStack>
						<VStack spacing={ 0 } alignment="stretch">
							{ folders.map( ( folder ) => (
								<Button
									key={ folder.value }
									variant="tertiary"
									isPressed={
										selectedFolder === folder.value
									}
									onClick={ () => {
										setSelectedFolder( folder.value );
										setSelectedTicketId( null );
									} }
									style={ { justifyContent: 'flex-start' } }
								>
									{ folder.label }
								</Button>
							) ) }
						</VStack>
					</VStack>
				</CardBody>
				<CardFooter>
					<Flex justify="space-between" style={ { width: '100%' } }>
						<Button
							variant="secondary"
							icon={ cog }
							label={ __( 'Settings', 'sahajanand-erp' ) }
							showTooltip
							onClick={ onSettingsClick }
						/>
						<Button
							variant="secondary"
							icon={ envelope }
							label={ __( 'Fetch Emails', 'sahajanand-erp' ) }
							showTooltip
							isBusy={ isFetchingEmails }
							onClick={ handleFetchEmails }
						/>
					</Flex>
				</CardFooter>
			</Card>

			<VStack spacing={ 0 } style={ { flex: 1 } }>
				{ selectedTicketId ? (
					<Card style={ { flex: 1 } }>
						<CardBody>
							<TicketDetail
								ticketId={ selectedTicketId }
								onBack={ () => {
									setSelectedTicketId( null );
									fetchTickets();
								} }
								addSnackbar={ addSnackbar }
							/>
						</CardBody>
					</Card>
				) : (
					<VStack spacing={ 4 } style={ { padding: '24px' } }>
						<Flex justify="flex-end">
							<Button variant="primary" onClick={ handleAddNew }>
								{ __( 'New Conversation', 'sahajanand-erp' ) }
							</Button>
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
								totalPages: Math.ceil(
									filteredTickets.length / view.perPage
								),
							} }
						/>
					</VStack>
				) }
			</VStack>
		</Flex>
	);
};

export default MailboxView;
