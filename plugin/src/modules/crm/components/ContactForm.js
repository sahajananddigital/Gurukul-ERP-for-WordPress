/**
 * Contact Form Component
 */
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	Card,
	CardBody,
	CardHeader,
	Button,
	TextControl,
	SelectControl,
	Flex,
	FlexBlock,
	Notice,
} from '@wordpress/components';
import { createContact } from '../services/api';

const ContactForm = ( { onContactCreated } ) => {
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
		<>
			{ error && (
				<Notice
					status="error"
					isDismissible={ false }
					onRemove={ () => setError( null ) }
				>
					{ error }
				</Notice>
			) }
			<Card style={ { marginBottom: '24px' } }>
				<CardHeader>
					<h2 style={ { margin: 0 } }>
						{ __( 'Add New Contact', 'wp-erp' ) }
					</h2>
				</CardHeader>
				<CardBody>
					<form onSubmit={ handleSubmit }>
						<Flex direction="column" gap={ 4 }>
							<Flex>
								<FlexBlock>
									<TextControl
										label={ __( 'First Name', 'wp-erp' ) }
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
										label={ __( 'Last Name', 'wp-erp' ) }
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
										label={ __( 'Email', 'wp-erp' ) }
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
										label={ __( 'Phone', 'wp-erp' ) }
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
										label={ __( 'Company', 'wp-erp' ) }
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
										label={ __( 'Status', 'wp-erp' ) }
										value={ formData.status }
										options={ [
											{
												label: __( 'Lead', 'wp-erp' ),
												value: 'lead',
											},
											{
												label: __(
													'Customer',
													'wp-erp'
												),
												value: 'customer',
											},
											{
												label: __(
													'Opportunity',
													'wp-erp'
												),
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
							<hr />
							<h3>{ __( 'Contact Details', 'wp-erp' ) }</h3>
							<Flex>
								<FlexBlock>
									<TextControl
										label={ __(
											'Address Line 1',
											'wp-erp'
										) }
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
										label={ __(
											'Address Line 2',
											'wp-erp'
										) }
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
										label={ __( 'City', 'wp-erp' ) }
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
										label={ __(
											'State/Province',
											'wp-erp'
										) }
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
										label={ __( 'Postal Code', 'wp-erp' ) }
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
										label={ __( 'Country', 'wp-erp' ) }
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
							<hr />
							<h3>{ __( 'Important Dates', 'wp-erp' ) }</h3>
							<Flex>
								<FlexBlock>
									<TextControl
										label={ __( 'Birthday', 'wp-erp' ) }
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
										label={ __( 'Anniversary', 'wp-erp' ) }
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
							<Flex justify="flex-start">
								<Button
									variant="primary"
									type="submit"
									isBusy={ isCreating }
								>
									{ __( 'Add Contact', 'wp-erp' ) }
								</Button>
							</Flex>
						</Flex>
					</form>
				</CardBody>
			</Card>
		</>
	);
};

export default ContactForm;
