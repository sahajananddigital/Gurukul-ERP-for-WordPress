/**
 * Contact Form Component
 */
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	Button,
	TextControl,
	SelectControl,
	Flex,
	FlexBlock,
	Notice,
	Modal,
} from '@wordpress/components';
import { createContact } from '../services/api';

const ContactForm = ( { onContactCreated } ) => {
	const [ isOpen, setIsOpen ] = useState( false );
	const [ isCreating, setIsCreating ] = useState( false );
	const [ error, setError ] = useState( null );
	const [ formData, setFormData ] = useState( {
		first_name: '',
		last_name: '',
		email: '',
		phone: '',
		company: '',
		status: 'lead',
		type: 'contact',
		address_line_1: '',
		address_line_2: '',
		city: '',
		state: '',
		postal_code: '',
		country: '',
		birthday: '',
		anniversary: '',
	} );

	const openModal = () => setIsOpen( true );
	const closeModal = () => {
		setIsOpen( false );
		setError( null );
	};

	const handleSubmit = async ( e ) => {
		e.preventDefault();
		setIsCreating( true );
		setError( null );

		try {
			await createContact( formData );

			// Reset form
			setFormData( {
				first_name: '',
				last_name: '',
				email: '',
				phone: '',
				company: '',
				status: 'lead',
				type: 'contact',
				address_line_1: '',
				address_line_2: '',
				city: '',
				state: '',
				postal_code: '',
				country: '',
				birthday: '',
				anniversary: '',
			} );

			closeModal();

			if ( onContactCreated ) {
				onContactCreated();
			}
		} catch ( err ) {
			setError( err.message );
		} finally {
			setIsCreating( false );
		}
	};

	return (
		<div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
			<Button variant="primary" onClick={ openModal }>
				{ __( 'Add New Contact', 'sahajanand-erp' ) }
			</Button>

			{ isOpen && (
				<Modal
					title={ __( 'Add New Contact', 'sahajanand-erp' ) }
					onRequestClose={ closeModal }
					style={{ width: '600px' }}
				>
					{ error && (
						<Notice
							status="error"
							isDismissible={ false }
							onRemove={ () => setError( null ) }
						>
							{ error }
						</Notice>
					) }
					
					<form onSubmit={ handleSubmit }>
						<Flex direction="column" gap={ 4 }>
							<Flex>
								<FlexBlock>
									<TextControl
										label={ __( 'First Name', 'sahajanand-erp' ) }
										value={ formData.first_name }
										onChange={ ( value ) =>
											setFormData( {
												...formData,
												first_name: value,
											} )
										}
										required
									/>
								</FlexBlock>
								<FlexBlock>
									<TextControl
										label={ __( 'Last Name', 'sahajanand-erp' ) }
										value={ formData.last_name }
										onChange={ ( value ) =>
											setFormData( {
												...formData,
												last_name: value,
											} )
										}
										required
									/>
								</FlexBlock>
							</Flex>
							<Flex>
								<FlexBlock>
									<TextControl
										label={ __( 'Email', 'sahajanand-erp' ) }
										type="email"
										value={ formData.email }
										onChange={ ( value ) =>
											setFormData( {
												...formData,
												email: value,
											} )
										}
									/>
								</FlexBlock>
								<FlexBlock>
									<TextControl
										label={ __( 'Phone', 'sahajanand-erp' ) }
										value={ formData.phone }
										onChange={ ( value ) =>
											setFormData( {
												...formData,
												phone: value,
											} )
										}
									/>
								</FlexBlock>
							</Flex>
							<Flex>
								<FlexBlock>
									<TextControl
										label={ __( 'Company', 'sahajanand-erp' ) }
										value={ formData.company }
										onChange={ ( value ) =>
											setFormData( {
												...formData,
												company: value,
											} )
										}
									/>
								</FlexBlock>
								<FlexBlock>
									<SelectControl
										label={ __( 'Status', 'sahajanand-erp' ) }
										value={ formData.status }
										options={ [
											{
												label: __( 'Lead', 'sahajanand-erp' ),
												value: 'lead',
											},
											{
												label: __( 'Customer', 'sahajanand-erp' ),
												value: 'customer',
											},
											{
												label: __( 'Opportunity', 'sahajanand-erp' ),
												value: 'opportunity',
											},
										] }
										onChange={ ( value ) =>
											setFormData( {
												...formData,
												status: value,
											} )
										}
									/>
								</FlexBlock>
							</Flex>
							<hr style={{ margin: '10px 0' }} />
							<h3 style={{ margin: 0 }}>{ __( 'Contact Details', 'sahajanand-erp' ) }</h3>
							<Flex>
								<FlexBlock>
									<TextControl
										label={ __( 'Address Line 1', 'sahajanand-erp' ) }
										value={ formData.address_line_1 }
										onChange={ ( value ) =>
											setFormData( {
												...formData,
												address_line_1: value,
											} )
										}
									/>
								</FlexBlock>
								<FlexBlock>
									<TextControl
										label={ __( 'Address Line 2', 'sahajanand-erp' ) }
										value={ formData.address_line_2 }
										onChange={ ( value ) =>
											setFormData( {
												...formData,
												address_line_2: value,
											} )
										}
									/>
								</FlexBlock>
							</Flex>
							<Flex>
								<FlexBlock>
									<TextControl
										label={ __( 'City', 'sahajanand-erp' ) }
										value={ formData.city }
										onChange={ ( value ) =>
											setFormData( {
												...formData,
												city: value,
											} )
										}
									/>
								</FlexBlock>
								<FlexBlock>
									<TextControl
										label={ __( 'State/Province', 'sahajanand-erp' ) }
										value={ formData.state }
										onChange={ ( value ) =>
											setFormData( {
												...formData,
												state: value,
											} )
										}
									/>
								</FlexBlock>
								<FlexBlock>
									<TextControl
										label={ __( 'Postal Code', 'sahajanand-erp' ) }
										value={ formData.postal_code }
										onChange={ ( value ) =>
											setFormData( {
												...formData,
												postal_code: value,
											} )
										}
									/>
								</FlexBlock>
							</Flex>
							<Flex>
								<FlexBlock>
									<TextControl
										label={ __( 'Country', 'sahajanand-erp' ) }
										value={ formData.country }
										onChange={ ( value ) =>
											setFormData( {
												...formData,
												country: value,
											} )
										}
									/>
								</FlexBlock>
							</Flex>
							<hr style={{ margin: '10px 0' }} />
							<h3 style={{ margin: 0 }}>{ __( 'Important Dates', 'sahajanand-erp' ) }</h3>
							<Flex>
								<FlexBlock>
									<TextControl
										label={ __( 'Birthday', 'sahajanand-erp' ) }
										type="date"
										value={ formData.birthday }
										onChange={ ( value ) =>
											setFormData( {
												...formData,
												birthday: value,
											} )
										}
									/>
								</FlexBlock>
								<FlexBlock>
									<TextControl
										label={ __( 'Anniversary', 'sahajanand-erp' ) }
										type="date"
										value={ formData.anniversary }
										onChange={ ( value ) =>
											setFormData( {
												...formData,
												anniversary: value,
											} )
										}
									/>
								</FlexBlock>
							</Flex>
							<Flex justify="flex-end" style={{ marginTop: '10px' }}>
								<Button variant="secondary" onClick={ closeModal } style={{ marginRight: '10px' }}>
									{ __( 'Cancel', 'sahajanand-erp' ) }
								</Button>
								<Button
									variant="primary"
									type="submit"
									isBusy={ isCreating }
								>
									{ __( 'Save Contact', 'sahajanand-erp' ) }
								</Button>
							</Flex>
						</Flex>
					</form>
				</Modal>
			) }
		</div>
	);
};

export default ContactForm;
