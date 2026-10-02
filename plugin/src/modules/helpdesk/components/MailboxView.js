import { useState, useMemo, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	Flex,
	Button,
	Card,
	CardBody,
	CardFooter,
	Spinner,
} from '@wordpress/components';
import { Heading, Text, VStack } from '../../../components/wp-compat';
import { arrowLeft, cog, envelope } from '@wordpress/icons';
import { DataViews } from '@wordpress/dataviews';
import apiFetch from '@wordpress/api-fetch';
import TicketDetail from './TicketDetail';

const MailboxView = ( {
	mailbox,
	tickets,
	pagination,
	loading,
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

	// Server returns the current page, already filtered by mailbox + folder.
	const filteredTickets = tickets;

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

	const [ selection, setSelection ] = useState( [] );

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
			refetchPage();
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

	// Load the first page whenever a mailbox is opened.
	useEffect( () => {
		if ( mailbox ) {
			fetchTickets( {
				mailbox_id: mailbox.id,
				folder: selectedFolder,
				page: 1,
				per_page: view.perPage,
			} );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ mailbox?.id ] );

	const handleViewChange = ( nextView ) => {
		setView( nextView );
		if (
			nextView.page !== view.page ||
			nextView.perPage !== view.perPage
		) {
			fetchTickets( {
				mailbox_id: mailbox.id,
				folder: selectedFolder,
				page: nextView.page,
				per_page: nextView.perPage,
			} );
		}
	};

	// Re-fetch the current page of the current mailbox + folder.
	const refetchPage = () =>
		fetchTickets( {
			mailbox_id: mailbox.id,
			folder: selectedFolder,
			page: view.page,
			per_page: view.perPage,
		} );

	const postBulk = async ( ids, action, value ) => {
		if ( ! ids.length ) {
			return;
		}
		try {
			await apiFetch( {
				path: '/sahajanand-erp/v1/helpdesk/tickets/bulk',
				method: 'POST',
				data: { ids, action, value },
			} );
			addSnackbar( __( 'Bulk action applied.', 'sahajanand-erp' ) );
			setSelection( [] );
			refetchPage();
		} catch {
			addSnackbar( __( 'Bulk action failed.', 'sahajanand-erp' ) );
		}
	};

	const bulkActions = useMemo( () => {
		const wrap = ( id, label, action, value ) => ( {
			id,
			label,
			supportsBulk: true,
			callback: ( items, context ) => {
				postBulk(
					items.map( ( t ) => t.id ),
					action,
					value
				);
				context.onActionPerformed?.( items );
			},
		} );

		if ( selectedFolder === 'trash' ) {
			return [
				wrap(
					'bulk-restore',
					__( 'Restore', 'sahajanand-erp' ),
					'restore'
				),
			];
		}
		if ( selectedFolder === 'spam' ) {
			return [
				wrap(
					'bulk-not-spam',
					__( 'Not Spam', 'sahajanand-erp' ),
					'spam',
					0
				),
			];
		}
		return [
			wrap( 'bulk-star', __( 'Star', 'sahajanand-erp' ), 'star', 1 ),
			wrap(
				'bulk-spam',
				__( 'Mark as Spam', 'sahajanand-erp' ),
				'spam',
				1
			),
			wrap(
				'bulk-trash',
				__( 'Move to Trash', 'sahajanand-erp' ),
				'trash'
			),
		];
	}, [ selectedFolder ] );

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
										fetchTickets( {
											mailbox_id: mailbox.id,
											folder: folder.value,
											page: 1,
											per_page: view.perPage,
										} );
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
									refetchPage();
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
						{ loading && filteredTickets.length === 0 ? (
							<Flex
								justify="center"
								style={ { padding: '32px' } }
							>
								<Spinner />
							</Flex>
						) : (
							<DataViews
								data={ filteredTickets }
								fields={ fields }
								actions={ [ ...actions, ...bulkActions ] }
								view={ view }
								onChangeView={ handleViewChange }
								onChangeSelection={ setSelection }
								selection={ selection }
								getItemId={ ( item ) => String( item.id ) }
								isLoading={ loading }
								defaultLayouts={ defaultLayouts }
								paginationInfo={ {
									totalItems: pagination.total,
									totalPages: pagination.totalPages,
								} }
							/>
						) }
					</VStack>
				) }
			</VStack>
		</Flex>
	);
};

export default MailboxView;
