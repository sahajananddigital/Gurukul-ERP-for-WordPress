import { useState, useEffect } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import {
	Flex,
	Spinner,
	Button,
	Card,
	CardBody,
	SelectControl,
	TabPanel,
	Modal,
	MenuItem,
	Notice,
	ExternalLink,
} from '@wordpress/components';
import { Heading, Text, VStack } from '../../../components/wp-compat';
import { arrowLeft } from '@wordpress/icons';
import apiFetch from '@wordpress/api-fetch';
import EditModal from '../../../components/EditModal';
import WPEditor from '../../../components/WPEditor';

const TicketDetail = ( { ticketId, onBack, addSnackbar } ) => {
	const [ ticket, setTicket ] = useState( null );
	const [ replies, setReplies ] = useState( [] );
	const [ loading, setLoading ] = useState( true );
	const [ saving, setSaving ] = useState( false );
	const [ replyText, setReplyText ] = useState( '' );
	const [ isNote, setIsNote ] = useState( false );
	const [ attachments, setAttachments ] = useState( [] );

	const [ status, setStatus ] = useState( 'open' );
	const [ priority, setPriority ] = useState( 'medium' );
	const [ assignee, setAssignee ] = useState( '' );

	const [ users, setUsers ] = useState( [] );
	const [ contact, setContact ] = useState( null );
	const [ savedReplies, setSavedReplies ] = useState( [] );
	const [ isSavedRepliesModalOpen, setIsSavedRepliesModalOpen ] =
		useState( false );
	const [ isEditContactModalOpen, setIsEditContactModalOpen ] =
		useState( false );

	useEffect( () => {
		loadTicketAndDeps();
	}, [ ticketId ] );

	const loadTicketAndDeps = async () => {
		setLoading( true );
		try {
			const ticketData = await apiFetch( {
				path: `/sahajanand-erp/v1/helpdesk/tickets/${ ticketId }`,
			} );
			setTicket( ticketData );
			setStatus( ticketData.status || 'open' );
			setPriority( ticketData.priority || 'medium' );
			setAssignee(
				ticketData.assignee_id ? String( ticketData.assignee_id ) : ''
			);

			const [ repliesData, usersData, savedData ] = await Promise.all( [
				apiFetch( {
					path: `/sahajanand-erp/v1/helpdesk/tickets/${ ticketId }/replies`,
				} ),
				apiFetch( { path: `/wp/v2/users` } ),
				apiFetch( {
					path: `/sahajanand-erp/v1/helpdesk/saved-replies`,
				} ),
			] );

			setReplies( repliesData );
			setUsers(
				usersData.map( ( u ) => ( {
					label: u.name,
					value: String( u.id ),
				} ) )
			);
			setSavedReplies( savedData );

			if ( ticketData.contact_id ) {
				const contactData = await apiFetch( {
					path: `/sahajanand-erp/v1/crm/contacts/${ ticketData.contact_id }`,
				} );
				setContact( contactData );
			}
		} catch {
			addSnackbar(
				__( 'Failed to load ticket details.', 'sahajanand-erp' )
			);
		} finally {
			setLoading( false );
		}
	};

	const handleSaveContact = async ( data ) => {
		try {
			await apiFetch( {
				path: `/sahajanand-erp/v1/crm/contacts/${ contact.id }`,
				method: 'POST',
				data,
			} );
			addSnackbar( __( 'CRM Contact updated.', 'sahajanand-erp' ) );
			setIsEditContactModalOpen( false );
			loadTicketAndDeps(); // reload to get fresh contact data
		} catch {
			addSnackbar(
				__( 'Failed to update CRM Contact.', 'sahajanand-erp' )
			);
		}
	};

	const openMediaFrame = () => {
		if ( ! window.wp || ! window.wp.media ) {
			addSnackbar(
				__( 'Media library is not available.', 'sahajanand-erp' )
			);
			return;
		}

		const frame = window.wp.media( {
			title: __( 'Attach files', 'sahajanand-erp' ),
			multiple: true,
			library: { type: null },
			button: { text: __( 'Attach', 'sahajanand-erp' ) },
		} );

		frame.on( 'select', () => {
			const picked = frame
				.state()
				.get( 'selection' )
				.map( ( item ) => {
					const data = item.toJSON();
					return {
						id: data.id,
						filename: data.filename || data.title,
						url: data.url,
					};
				} );

			setAttachments( ( prev ) => [
				...prev,
				...picked.filter(
					( file ) => ! prev.some( ( e ) => e.id === file.id )
				),
			] );
		} );

		frame.open();
	};

	const removeAttachment = ( id ) =>
		setAttachments( ( prev ) => prev.filter( ( file ) => file.id !== id ) );

	const detachAttachment = async ( id ) => {
		const remaining = ( ticket.attachments || [] )
			.filter( ( f ) => f.id !== id )
			.map( ( f ) => f.id );
		try {
			await apiFetch( {
				path: `/sahajanand-erp/v1/helpdesk/tickets/${ ticketId }`,
				method: 'POST',
				data: { attachment_ids: remaining },
			} );
			setTicket( ( t ) => ( {
				...t,
				attachments: t.attachments.filter( ( f ) => f.id !== id ),
			} ) );
			addSnackbar( __( 'Attachment removed.', 'sahajanand-erp' ) );
		} catch {
			addSnackbar(
				__( 'Failed to remove attachment.', 'sahajanand-erp' )
			);
		}
	};

	const handleAddReply = async () => {
		if ( ! replyText.trim() && attachments.length === 0 ) {
			return;
		}
		setSaving( true );
		try {
			const newReply = await apiFetch( {
				path: `/sahajanand-erp/v1/helpdesk/tickets/${ ticketId }/replies`,
				method: 'POST',
				data: {
					message: replyText,
					is_note: isNote,
					attachment_ids: attachments
						.map( ( file ) => file.id )
						.join( ',' ),
				},
			} );
			setReplies( [ ...replies, newReply ] );
			setReplyText( '' );
			setAttachments( [] );
			addSnackbar(
				isNote
					? __( 'Note added.', 'sahajanand-erp' )
					: __( 'Reply sent.', 'sahajanand-erp' )
			);

			if ( ! isNote && status !== 'pending' ) {
				setStatus( 'pending' );
				handleFieldChange( 'status', 'pending' );
			}
		} catch {
			addSnackbar( __( 'Failed to send reply.', 'sahajanand-erp' ) );
		} finally {
			setSaving( false );
		}
	};

	const handleFieldChange = async ( field, value ) => {
		try {
			await apiFetch( {
				path: `/sahajanand-erp/v1/helpdesk/tickets/${ ticketId }`,
				method: 'POST',
				data: { [ field ]: value },
			} );
			addSnackbar(
				/* translators: %s: Ticket field name. */
				sprintf( __( '%s updated.', 'sahajanand-erp' ), field )
			);
		} catch {
			addSnackbar(
				/* translators: %s: Ticket field name. */
				sprintf( __( 'Failed to update %s.', 'sahajanand-erp' ), field )
			);
		}
	};

	if ( loading || ! ticket ) {
		return (
			<Flex justify="center" style={ { padding: '32px' } }>
				<Spinner />
			</Flex>
		);
	}

	return (
		<Flex gap={ 6 } align="flex-start">
			{ /* Main Chat Column */ }
			<VStack spacing={ 5 } style={ { flex: 1 } }>
				<Flex align="center" gap={ 4 }>
					<Button
						variant="secondary"
						icon={ arrowLeft }
						onClick={ onBack }
					>
						{ __( 'Back', 'sahajanand-erp' ) }
					</Button>
					<Heading level={ 2 }>
						#{ ticket.ticket_no } - { ticket.subject }
					</Heading>
				</Flex>

				<Card>
					<CardBody>
						<VStack spacing={ 2 }>
							<div
								dangerouslySetInnerHTML={ {
									__html: ticket.description,
								} }
							/>
							{ ticket.attachments &&
								ticket.attachments.length > 0 && (
									<VStack spacing={ 1 }>
										{ ticket.attachments.map( ( file ) => (
											<ExternalLink
												key={ file.id }
												href={ file.url }
											>
												{ file.filename }
											</ExternalLink>
										) ) }
									</VStack>
								) }
						</VStack>
					</CardBody>
				</Card>

				<VStack spacing={ 4 }>
					{ replies.map( ( reply, idx ) => {
						const isInternalNote = reply.is_note === 1;
						const isAgent = reply.user_id !== '0';
						let authorLabel = __( 'Customer', 'sahajanand-erp' );
						if ( isInternalNote ) {
							authorLabel = __(
								'Internal Note by Agent',
								'sahajanand-erp'
							);
						} else if ( isAgent ) {
							authorLabel = __( 'Agent Reply', 'sahajanand-erp' );
						}
						const createdAt = new Date(
							reply.created_at
						).toLocaleString();
						const meta = `${ authorLabel } - ${ createdAt }`;
						const body = (
							<div
								dangerouslySetInnerHTML={ {
									__html: reply.message,
								} }
							/>
						);
						const attachmentList =
							reply.attachments &&
							reply.attachments.length > 0 ? (
								<VStack spacing={ 1 }>
									{ reply.attachments.map( ( file ) => (
										<ExternalLink
											key={ file.id }
											href={ file.url }
										>
											{ file.filename }
										</ExternalLink>
									) ) }
								</VStack>
							) : null;

						if ( isInternalNote ) {
							return (
								<Notice
									key={ reply.id || idx }
									status="warning"
									isDismissible={ false }
								>
									<VStack spacing={ 2 }>
										<Text variant="muted" size="12px">
											{ meta }
										</Text>
										{ body }
										{ attachmentList }
									</VStack>
								</Notice>
							);
						}

						return (
							<Card key={ reply.id || idx }>
								<CardBody>
									<VStack spacing={ 2 }>
										<Text variant="muted" size="12px">
											{ meta }
										</Text>
										{ body }
										{ attachmentList }
									</VStack>
								</CardBody>
							</Card>
						);
					} ) }
				</VStack>

				<Card>
					<CardBody>
						<TabPanel
							className="reply-tabs"
							activeClass="is-active"
							onSelect={ ( tabName ) =>
								setIsNote( tabName === 'note' )
							}
							tabs={ [
								{
									name: 'reply',
									title: __( 'Reply', 'sahajanand-erp' ),
								},
								{
									name: 'note',
									title: __( 'Note', 'sahajanand-erp' ),
								},
							] }
						>
							{ () => (
								<VStack spacing={ 4 }>
									<WPEditor
										id="ticket-reply-editor"
										value={ replyText }
										onChange={ setReplyText }
										placeholder={
											isNote
												? __(
														'Type an internal note…',
														'sahajanand-erp'
													)
												: __(
														'Type your reply…',
														'sahajanand-erp'
													)
										}
										style={ { minHeight: '120px' } }
									/>
									{ attachments.length > 0 && (
										<VStack spacing={ 1 }>
											{ attachments.map( ( file ) => (
												<Flex
													key={ file.id }
													justify="space-between"
													align="center"
												>
													<Text size="12px">
														{ file.filename }
													</Text>
													<Button
														variant="tertiary"
														isDestructive
														onClick={ () =>
															removeAttachment(
																file.id
															)
														}
													>
														{ __(
															'Remove',
															'sahajanand-erp'
														) }
													</Button>
												</Flex>
											) ) }
										</VStack>
									) }
									<Flex justify="space-between">
										<Flex gap={ 2 }>
											<Button
												variant="secondary"
												disabled={ isNote }
												onClick={ () =>
													setIsSavedRepliesModalOpen(
														true
													)
												}
											>
												{ __(
													'Insert Saved Reply',
													'sahajanand-erp'
												) }
											</Button>
											<Button
												variant="secondary"
												onClick={ openMediaFrame }
											>
												{ __(
													'Attach Files',
													'sahajanand-erp'
												) }
											</Button>
										</Flex>
										<Button
											variant={
												isNote ? 'secondary' : 'primary'
											}
											onClick={ handleAddReply }
											isBusy={ saving }
										>
											{ isNote
												? __(
														'Add Note',
														'sahajanand-erp'
													)
												: __(
														'Send Reply',
														'sahajanand-erp'
													) }
										</Button>
									</Flex>
								</VStack>
							) }
						</TabPanel>
					</CardBody>
				</Card>
			</VStack>

			{ /* Right Sidebar */ }
			<VStack spacing={ 4 } style={ { width: '280px', flexShrink: 0 } }>
				<Card>
					<CardBody>
						<VStack spacing={ 4 }>
							<Heading level={ 4 }>
								{ __( 'Properties', 'sahajanand-erp' ) }
							</Heading>
							<SelectControl
								label={ __( 'Status', 'sahajanand-erp' ) }
								value={ status }
								options={ [
									{
										label: __( 'Open', 'sahajanand-erp' ),
										value: 'open',
									},
									{
										label: __(
											'Pending',
											'sahajanand-erp'
										),
										value: 'pending',
									},
									{
										label: __( 'Closed', 'sahajanand-erp' ),
										value: 'closed',
									},
								] }
								onChange={ ( val ) => {
									setStatus( val );
									handleFieldChange( 'status', val );
								} }
							/>
							<SelectControl
								label={ __( 'Priority', 'sahajanand-erp' ) }
								value={ priority }
								options={ [
									{
										label: __( 'Low', 'sahajanand-erp' ),
										value: 'low',
									},
									{
										label: __( 'Medium', 'sahajanand-erp' ),
										value: 'medium',
									},
									{
										label: __( 'High', 'sahajanand-erp' ),
										value: 'high',
									},
								] }
								onChange={ ( val ) => {
									setPriority( val );
									handleFieldChange( 'priority', val );
								} }
							/>
							<SelectControl
								label={ __( 'Assignee', 'sahajanand-erp' ) }
								value={ assignee }
								options={ [
									{
										label: __(
											'Unassigned',
											'sahajanand-erp'
										),
										value: '',
									},
									...users,
								] }
								onChange={ ( val ) => {
									setAssignee( val );
									handleFieldChange( 'assignee_id', val );
								} }
							/>
						</VStack>
					</CardBody>
				</Card>

				{ contact && (
					<Card>
						<CardBody>
							<VStack spacing={ 3 }>
								<Flex justify="space-between" align="center">
									<Heading level={ 4 }>
										{ __(
											'CRM Contact Details',
											'sahajanand-erp'
										) }
									</Heading>
									<Button
										variant="link"
										onClick={ () =>
											setIsEditContactModalOpen( true )
										}
									>
										{ __( 'Edit', 'sahajanand-erp' ) }
									</Button>
								</Flex>
								<VStack spacing={ 0 }>
									<Text weight={ 600 }>
										{ contact.first_name }{ ' ' }
										{ contact.last_name }
									</Text>
									<ExternalLink
										href={ `mailto:${ contact.email }` }
									>
										{ contact.email }
									</ExternalLink>
									{ contact.phone && (
										<Text>
											{ __( 'Phone', 'sahajanand-erp' ) }:{ ' ' }
											{ contact.phone }
										</Text>
									) }
									{ contact.company && (
										<Text>
											{ __(
												'Company',
												'sahajanand-erp'
											) }
											: { contact.company }
										</Text>
									) }
									{ contact.city && (
										<Text>
											{ __(
												'Location',
												'sahajanand-erp'
											) }
											: { contact.city }
											{ contact.country
												? `, ${ contact.country }`
												: '' }
										</Text>
									) }
								</VStack>
							</VStack>
						</CardBody>
					</Card>
				) }

				{ ticket.attachments && ticket.attachments.length > 0 && (
					<Card>
						<CardBody>
							<VStack spacing={ 3 }>
								<Heading level={ 4 }>
									{ __( 'Attachments', 'sahajanand-erp' ) }
								</Heading>
								<VStack spacing={ 1 } alignment="stretch">
									{ ticket.attachments.map( ( file ) => (
										<Flex
											key={ file.id }
											justify="space-between"
											align="center"
										>
											<ExternalLink href={ file.url }>
												{ file.filename }
											</ExternalLink>
											<Button
												variant="tertiary"
												isDestructive
												size="small"
												onClick={ () =>
													detachAttachment( file.id )
												}
											>
												{ __(
													'Remove',
													'sahajanand-erp'
												) }
											</Button>
										</Flex>
									) ) }
								</VStack>
							</VStack>
						</CardBody>
					</Card>
				) }
			</VStack>

			{ isSavedRepliesModalOpen && (
				<Modal
					title={ __( 'Insert Saved Reply', 'sahajanand-erp' ) }
					onRequestClose={ () => setIsSavedRepliesModalOpen( false ) }
				>
					{ savedReplies.length === 0 ? (
						<Text>
							{ __(
								'No saved replies found. Create them in Settings.',
								'sahajanand-erp'
							) }
						</Text>
					) : (
						<VStack spacing={ 1 }>
							{ savedReplies.map( ( sr ) => (
								<MenuItem
									key={ sr.id }
									onClick={ () => {
										setReplyText(
											replyText +
												( replyText ? '\n\n' : '' ) +
												sr.content
										);
										setIsSavedRepliesModalOpen( false );
									} }
								>
									{ sr.title }
								</MenuItem>
							) ) }
						</VStack>
					) }
				</Modal>
			) }

			<EditModal
				title={ __( 'Edit CRM Contact', 'sahajanand-erp' ) }
				isOpen={ isEditContactModalOpen }
				onClose={ () => setIsEditContactModalOpen( false ) }
				onSave={ handleSaveContact }
				data={ contact }
				fields={ [
					{
						key: 'first_name',
						label: __( 'First Name', 'sahajanand-erp' ),
						type: 'text',
					},
					{
						key: 'last_name',
						label: __( 'Last Name', 'sahajanand-erp' ),
						type: 'text',
					},
					{
						key: 'email',
						label: __( 'Email', 'sahajanand-erp' ),
						type: 'text',
					},
					{
						key: 'phone',
						label: __( 'Phone', 'sahajanand-erp' ),
						type: 'text',
					},
					{
						key: 'company',
						label: __( 'Company', 'sahajanand-erp' ),
						type: 'text',
					},
					{
						key: 'city',
						label: __( 'City', 'sahajanand-erp' ),
						type: 'text',
					},
					{
						key: 'country',
						label: __( 'Country', 'sahajanand-erp' ),
						type: 'text',
					},
				] }
			/>
		</Flex>
	);
};

export default TicketDetail;
