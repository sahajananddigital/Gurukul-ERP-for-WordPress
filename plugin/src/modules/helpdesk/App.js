/**
 * Helpdesk Module App
 */
import { useState, useEffect, useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	Card,
	CardBody,
	CardHeader,
	Button,
	TextControl,
	TextareaControl,
	SelectControl,
	Spinner,
	Notice,
	Flex,
	FlexBlock,
	TabPanel,
} from '@wordpress/components';
import { DataViews } from '@wordpress/dataviews';
import apiFetch from '@wordpress/api-fetch';

const HelpdeskApp = () => {
	const [ tickets, setTickets ] = useState( [] );
	const [ loading, setLoading ] = useState( true );
	const [ error, setError ] = useState( null );
	const [ isCreating, setIsCreating ] = useState( false );
	const [ formData, setFormData ] = useState( {
		subject: '',
		description: '',
		priority: 'medium',
		status: 'open',
	} );
	const [ activeTab, setActiveTab ] = useState( 'tickets' );

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
		fetchTickets();
	}, [] );

	const fetchTickets = async () => {
		setLoading( true );
		setError( null );
		try {
			const data = await apiFetch( {
				path: '/wp-erp/v1/helpdesk/tickets',
			} );
			setTickets( data );
		} catch ( err ) {
			setError(
				err.message || __( 'Failed to fetch tickets', 'wp-erp' )
			);
		} finally {
			setLoading( false );
		}
	};

	const handleSubmit = async ( e ) => {
		e.preventDefault();
		setIsCreating( true );
		setError( null );

		try {
			await apiFetch( {
				path: '/wp-erp/v1/helpdesk/tickets',
				method: 'POST',
				data: formData,
			} );
			setFormData( {
				subject: '',
				description: '',
				priority: 'medium',
				status: 'open',
			} );
			fetchTickets();
			setActiveTab( 'tickets' );
		} catch ( err ) {
			setError(
				err.message || __( 'Failed to create ticket', 'wp-erp' )
			);
		} finally {
			setIsCreating( false );
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
				header: __( 'Ticket ID', 'wp-erp' ),
				getValue: ( { item } ) =>
					item.ticket_id ||
					item.ticket_no ||
					( item.id ? String( item.id ) : '-' ),
				enableSorting: true,
			},
			{
				id: 'subject',
				header: __( 'Subject', 'wp-erp' ),
				getValue: ( { item } ) => item.subject || '-',
				enableSorting: true,
			},
			{
				id: 'priority',
				header: __( 'Priority', 'wp-erp' ),
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
			{
				id: 'created_at',
				header: __( 'Created', 'wp-erp' ),
				getValue: ( { item } ) => item.created_at || '-',
				enableSorting: true,
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

		if ( tickets.length === 0 ) {
			return (
				<p
					style={ {
						padding: '16px',
						textAlign: 'center',
						color: '#757575',
					} }
				>
					{ __( 'No tickets found.', 'wp-erp' ) }
				</p>
			);
		}

		return (
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
					actions={ [] }
					view={ view }
					onChangeView={ setView }
					defaultLayouts={ defaultLayouts }
					paginationInfo={ {
						totalItems: tickets.length,
						totalPages: Math.ceil( tickets.length / view.perPage ),
					} }
				/>
			</div>
		);
	};

	const renderCreateTicket = () => {
		return (
			<Card style={ { marginBottom: '24px' } }>
				<CardHeader>
					<h2 style={ { margin: 0 } }>
						{ __( 'Create New Ticket', 'wp-erp' ) }
					</h2>
				</CardHeader>
				<CardBody>
					<form onSubmit={ handleSubmit }>
						<Flex direction="column" gap={ 4 }>
							<FlexBlock>
								<TextControl
									label={ __( 'Subject', 'wp-erp' ) }
									value={ formData.subject }
									onChange={ ( value ) =>
										setFormData( {
											...formData,
											subject: value,
										} )
									}
									required
								/>
							</FlexBlock>
							<FlexBlock>
								<TextareaControl
									label={ __( 'Description', 'wp-erp' ) }
									value={ formData.description }
									onChange={ ( value ) =>
										setFormData( {
											...formData,
											description: value,
										} )
									}
									required
									rows={ 6 }
								/>
							</FlexBlock>
							<FlexBlock>
								<SelectControl
									label={ __( 'Priority', 'wp-erp' ) }
									value={ formData.priority }
									options={ [
										{
											label: __( 'Low', 'wp-erp' ),
											value: 'low',
										},
										{
											label: __( 'Medium', 'wp-erp' ),
											value: 'medium',
										},
										{
											label: __( 'High', 'wp-erp' ),
											value: 'high',
										},
										{
											label: __( 'Urgent', 'wp-erp' ),
											value: 'urgent',
										},
									] }
									onChange={ ( value ) =>
										setFormData( {
											...formData,
											priority: value,
										} )
									}
								/>
							</FlexBlock>
							<Flex justify="flex-start">
								<Button
									variant="primary"
									type="submit"
									isBusy={ isCreating }
								>
									{ __( 'Create Ticket', 'wp-erp' ) }
								</Button>
							</Flex>
						</Flex>
					</form>
				</CardBody>
			</Card>
		);
	};

	return (
		<div className="wp-erp-helpdesk">
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
					{ __( 'Helpdesk Management', 'wp-erp' ) }
				</h1>
			</div>
			<div style={{ padding: '0 40px' }}>
				<TabPanel
						className="wp-erp-helpdesk-tabs"
						activeClass="is-active"
						initialTabName={ activeTab }
						onSelect={ ( tabName ) => setActiveTab( tabName ) }
						tabs={ [
							{
								name: 'tickets',
								title: __( 'Tickets', 'wp-erp' ),
								className: 'tab-tickets',
							},
							{
								name: 'create',
								title: __( 'Create Ticket', 'wp-erp' ),
								className: 'tab-create',
							},
						] }
					>
						{ ( tab ) => {
							if ( tab.name === 'tickets' ) {
								return renderTicketsList();
							}
							return renderCreateTicket();
						} }
					</TabPanel>
			</div>
		</div>
	);
};

export default HelpdeskApp;
