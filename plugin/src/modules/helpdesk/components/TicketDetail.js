import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { 
	Flex, 
	Spinner, 
	Button, 
	Card, 
	CardBody, 
	SelectControl,
	TextareaControl,
	TabPanel,
	Modal
} from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import EditModal from '../../../components/EditModal';

const TicketDetail = ( { ticketId, onBack, addSnackbar } ) => {
	const [ ticket, setTicket ] = useState( null );
	const [ replies, setReplies ] = useState( [] );
	const [ loading, setLoading ] = useState( true );
	const [ saving, setSaving ] = useState( false );
	const [ replyText, setReplyText ] = useState( '' );
	const [ isNote, setIsNote ] = useState( false );

	const [ status, setStatus ] = useState( 'open' );
	const [ priority, setPriority ] = useState( 'medium' );
	const [ assignee, setAssignee ] = useState( '' );

	const [ users, setUsers ] = useState( [] );
	const [ contact, setContact ] = useState( null );
	const [ savedReplies, setSavedReplies ] = useState( [] );
	const [ isSavedRepliesModalOpen, setIsSavedRepliesModalOpen ] = useState( false );
	const [ isEditContactModalOpen, setIsEditContactModalOpen ] = useState( false );

	useEffect( () => {
		loadTicketAndDeps();
	}, [ ticketId ] );

	const loadTicketAndDeps = async () => {
		setLoading( true );
		try {
			const ticketData = await apiFetch( { path: `/sahajanand-erp/v1/helpdesk/tickets/${ ticketId }` } );
			setTicket( ticketData );
			setStatus( ticketData.status || 'open' );
			setPriority( ticketData.priority || 'medium' );
			setAssignee( ticketData.assignee_id ? String(ticketData.assignee_id) : '' );
			
			const [ repliesData, usersData, savedData ] = await Promise.all([
				apiFetch( { path: `/sahajanand-erp/v1/helpdesk/tickets/${ ticketId }/replies` } ),
				apiFetch( { path: `/wp/v2/users` } ),
				apiFetch( { path: `/sahajanand-erp/v1/helpdesk/saved-replies` } )
			]);
			
			setReplies( repliesData );
			setUsers( usersData.map( u => ({ label: u.name, value: String(u.id) }) ) );
			setSavedReplies( savedData );

			if ( ticketData.contact_id ) {
				const contactData = await apiFetch( { path: `/sahajanand-erp/v1/crm/contacts/${ticketData.contact_id}` } );
				setContact( contactData );
			}
		} catch ( err ) {
			addSnackbar( __( 'Failed to load ticket details.', 'sahajanand-erp' ) );
		} finally {
			setLoading( false );
		}
	};

	
	const handleSaveContact = async ( data ) => {
		try {
			await apiFetch( {
				path: `/sahajanand-erp/v1/crm/contacts/${contact.id}`,
				method: 'POST',
				data
			});
			addSnackbar( __( 'CRM Contact updated.', 'sahajanand-erp' ) );
			setIsEditContactModalOpen(false);
			loadTicketAndDeps(); // reload to get fresh contact data
		} catch (err) {
			addSnackbar( __( 'Failed to update CRM Contact.', 'sahajanand-erp' ) );
		}
	};

	const handleAddReply = async () => {
		if ( ! replyText.trim() ) return;
		setSaving( true );
		try {
			const newReply = await apiFetch( {
				path: `/sahajanand-erp/v1/helpdesk/tickets/${ ticketId }/replies`,
				method: 'POST',
				data: {
					message: replyText,
					is_note: isNote
				}
			} );
			setReplies( [ ...replies, newReply ] );
			setReplyText( '' );
			addSnackbar( isNote ? __( 'Note added.', 'sahajanand-erp' ) : __( 'Reply sent.', 'sahajanand-erp' ) );
			
			if ( !isNote && status !== 'pending' ) {
				setStatus( 'pending' );
				handleFieldChange( 'status', 'pending' );
			}
		} catch ( err ) {
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
				data: { [field]: value }
			} );
			addSnackbar( __( `${field} updated.`, 'sahajanand-erp' ) );
		} catch ( err ) {
			addSnackbar( __( `Failed to update ${field}.`, 'sahajanand-erp' ) );
		}
	};

	if ( loading || !ticket ) {
		return <Flex justify="center" style={{ padding: '32px' }}><Spinner /></Flex>;
	}

	return (
		<div style={{ display: 'flex', gap: '24px', padding: '0 24px' }}>
			{/* Main Chat Column */}
			<div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
				<div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
					<Button isSecondary onClick={ onBack }>
						&larr; { __( 'Back', 'sahajanand-erp' ) }
					</Button>
					<h2 style={{ margin: 0, fontSize: '20px' }}>
						#{ ticket.ticket_no } - { ticket.subject }
					</h2>
				</div>
				
				<Card style={{ backgroundColor: '#f9f9f9', borderColor: '#ddd' }}>
					<CardBody>
						<div dangerouslySetInnerHTML={{ __html: ticket.description }} />
					</CardBody>
				</Card>
				
				<div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
					{ replies.map( ( reply, idx ) => (
						<Card key={ reply.id || idx } style={{ 
							marginLeft: reply.user_id != '0' ? '40px' : '0', 
							marginRight: reply.user_id == '0' ? '40px' : '0',
							backgroundColor: reply.is_note == 1 ? '#fff9c4' : (reply.user_id != '0' ? '#e3f2fd' : '#fff'),
							borderColor: reply.is_note == 1 ? '#fbc02d' : '#e0e0e0'
						}}>
							<CardBody style={{ padding: '16px' }}>
								<div style={{ fontSize: '12px', color: '#666', marginBottom: '8px', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>
									{ reply.is_note == 1 ? 'Internal Note by Agent' : (reply.user_id != '0' ? 'Agent Reply' : 'Customer') } - { new Date(reply.created_at).toLocaleString() }
								</div>
								<div dangerouslySetInnerHTML={{ __html: reply.message }} />
							</CardBody>
						</Card>
					) ) }
				</div>

				<Card style={{ marginTop: '16px', borderTop: '4px solid ' + (isNote ? '#fbc02d' : '#007cba') }}>
					<CardBody>
						<TabPanel
							className="reply-tabs"
							activeClass="is-active"
							onSelect={ ( tabName ) => setIsNote( tabName === 'note' ) }
							tabs={ [
								{ name: 'reply', title: __( 'Reply', 'sahajanand-erp' ) },
								{ name: 'note', title: __( 'Note', 'sahajanand-erp' ) }
							] }
						>
							{ ( tab ) => (
								<div style={{ marginTop: '16px' }}>
									<TextareaControl
										value={ replyText }
										onChange={ setReplyText }
										placeholder={ isNote ? __( 'Type an internal note...', 'sahajanand-erp' ) : __( 'Type your reply...', 'sahajanand-erp' ) }
										style={{ minHeight: '120px', backgroundColor: isNote ? '#fffde7' : '#fff' }}
									/>
									<Flex justify="space-between" style={{ marginTop: '16px' }}>
										<Button 
											isSecondary 
											onClick={ () => setIsSavedRepliesModalOpen(true) }
											style={{ visibility: isNote ? 'hidden' : 'visible' }}
										>
											{ __( 'Insert Saved Reply', 'sahajanand-erp' ) }
										</Button>
										<Button 
											isPrimary 
											onClick={ handleAddReply } 
											isBusy={ saving }
											style={{ backgroundColor: isNote ? '#fbc02d' : '#007cba', borderColor: isNote ? '#fbc02d' : '#007cba' }}
										>
											{ isNote ? __( 'Add Note', 'sahajanand-erp' ) : __( 'Send Reply', 'sahajanand-erp' ) }
										</Button>
									</Flex>
								</div>
							) }
						</TabPanel>
					</CardBody>
				</Card>
			</div>
			
			{/* Right Sidebar */}
			<div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
				<Card>
					<CardBody>
						<h3 style={{ margin: '0 0 16px 0', fontSize: '14px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>Properties</h3>
						<SelectControl
							label={ __( 'Status', 'sahajanand-erp' ) }
							value={ status }
							options={ [
								{ label: __( 'Open', 'sahajanand-erp' ), value: 'open' },
								{ label: __( 'Pending', 'sahajanand-erp' ), value: 'pending' },
								{ label: __( 'Closed', 'sahajanand-erp' ), value: 'closed' },
							] }
							onChange={ (val) => {
								setStatus(val);
								handleFieldChange('status', val);
							} }
						/>
						<SelectControl
							label={ __( 'Priority', 'sahajanand-erp' ) }
							value={ priority }
							options={ [
								{ label: __( 'Low', 'sahajanand-erp' ), value: 'low' },
								{ label: __( 'Medium', 'sahajanand-erp' ), value: 'medium' },
								{ label: __( 'High', 'sahajanand-erp' ), value: 'high' },
							] }
							onChange={ ( val ) => {
								setPriority( val );
								handleFieldChange('priority', val);
							} }
						/>
						<SelectControl
							label={ __( 'Assignee', 'sahajanand-erp' ) }
							value={ assignee }
							options={ [ { label: 'Unassigned', value: '' }, ...users ] }
							onChange={ ( val ) => {
								setAssignee( val );
								handleFieldChange('assignee_id', val);
							} }
						/>
					</CardBody>
				</Card>

				{ contact && (
					<Card style={{ marginTop: '24px' }}>
						<CardBody>
							<Flex justify="space-between" align="center" style={{ marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
								<h3 style={{ margin: '0', fontSize: '14px' }}>CRM Contact Details</h3>
								<Button variant="link" onClick={() => setIsEditContactModalOpen(true)}>Edit</Button>
							</Flex>
							<div style={{ fontSize: '13px', lineHeight: '1.6' }}>
								<strong>{ contact.first_name } { contact.last_name }</strong><br />
								<a href={`mailto:${contact.email}`}>{ contact.email }</a><br />
								{ contact.phone && <span>Phone: { contact.phone }<br /></span> }
								{ contact.company && <span>Company: { contact.company }<br /></span> }
								{ contact.city && <span>Location: { contact.city }{ contact.country ? `, ${contact.country}` : '' }<br /></span> }
							</div>
						</CardBody>
					</Card>
				) }
			</div>

			{ isSavedRepliesModalOpen && (
				<Modal 
					title={ __( 'Insert Saved Reply', 'sahajanand-erp' ) } 
					onRequestClose={ () => setIsSavedRepliesModalOpen(false) }
					style={{ width: '400px' }}
				>
					{ savedReplies.length === 0 ? (
						<p>{ __( 'No saved replies found. Create them in Settings.', 'sahajanand-erp' ) }</p>
					) : (
						<ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
							{ savedReplies.map( sr => (
								<li key={sr.id} style={{ marginBottom: '8px' }}>
									<Button 
										isSecondary 
										style={{ width: '100%', justifyContent: 'flex-start' }}
										onClick={ () => {
											setReplyText( replyText + (replyText ? '\n\n' : '') + sr.content );
											setIsSavedRepliesModalOpen( false );
										} }
									>
										{ sr.title }
									</Button>
								</li>
							) ) }
						</ul>
					) }
				</Modal>
			) }
		
			<EditModal
				title="Edit CRM Contact"
				isOpen={ isEditContactModalOpen }
				onClose={ () => setIsEditContactModalOpen(false) }
				onSave={ handleSaveContact }
				data={ contact }
				fields={[
					{ key: 'first_name', label: 'First Name', type: 'text' },
					{ key: 'last_name', label: 'Last Name', type: 'text' },
					{ key: 'email', label: 'Email', type: 'text' },
					{ key: 'phone', label: 'Phone', type: 'text' },
					{ key: 'company', label: 'Company', type: 'text' },
					{ key: 'city', label: 'City', type: 'text' },
					{ key: 'country', label: 'Country', type: 'text' },
				]}
			/>
		</div>
	);

};

export default TicketDetail;
