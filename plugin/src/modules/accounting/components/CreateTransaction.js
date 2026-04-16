/**
 * Create Transaction Component
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
	TextareaControl,
	Flex,
	FlexBlock,
	Notice,
} from '@wordpress/components';
import { createTransaction } from '../services/api';

const CreateTransaction = ( { onTransactionCreated } ) => {
	const [ isCreating, setIsCreating ] = useState( false );
	const [ error, setError ] = useState( null );
	const [ formData, setFormData ] = useState( {
		voucher_no: '',
		type: 'payment',
		date: new Date().toISOString().split( 'T' )[ 0 ],
		reference: '',
		total: '',
		description: '',
	} );

	const handleSubmit = async ( e ) => {
		e.preventDefault();
		setIsCreating( true );
		setError( null );

		try {
			await createTransaction( formData );

			// Reset form
			setFormData( {
				voucher_no: '',
				type: 'payment',
				date: new Date().toISOString().split( 'T' )[ 0 ],
				reference: '',
				total: '',
				description: '',
			} );

			if ( onTransactionCreated ) {
				onTransactionCreated();
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
						{ __( 'Create Transaction', 'wp-erp' ) }
					</h2>
				</CardHeader>
				<CardBody>
					<form onSubmit={ handleSubmit }>
						<Flex direction="column" gap={ 4 }>
							<Flex>
								<FlexBlock>
									<TextControl
										label={ __( 'Voucher No', 'wp-erp' ) }
										value={ formData.voucher_no }
										onChange={ ( value ) =>
											setFormData( {
												...formData,
												voucher_no: value,
											} )
										}
										required
									/>
								</FlexBlock>
								<FlexBlock>
									<SelectControl
										label={ __( 'Type', 'wp-erp' ) }
										value={ formData.type }
										options={ [
											{
												label: __(
													'Payment',
													'wp-erp'
												),
												value: 'payment',
											},
											{
												label: __(
													'Receipt',
													'wp-erp'
												),
												value: 'receipt',
											},
											{
												label: __(
													'Journal',
													'wp-erp'
												),
												value: 'journal',
											},
										] }
										onChange={ ( value ) =>
											setFormData( {
												...formData,
												type: value,
											} )
										}
									/>
								</FlexBlock>
								<FlexBlock>
									<TextControl
										label={ __( 'Date', 'wp-erp' ) }
										type="date"
										value={ formData.date }
										onChange={ ( value ) =>
											setFormData( {
												...formData,
												date: value,
											} )
										}
										required
									/>
								</FlexBlock>
							</Flex>
							<Flex>
								<FlexBlock>
									<TextControl
										label={ __( 'Reference', 'wp-erp' ) }
										value={ formData.reference }
										onChange={ ( value ) =>
											setFormData( {
												...formData,
												reference: value,
											} )
										}
									/>
								</FlexBlock>
								<FlexBlock>
									<TextControl
										label={ __( 'Total', 'wp-erp' ) }
										type="number"
										step="0.01"
										value={ formData.total }
										onChange={ ( value ) =>
											setFormData( {
												...formData,
												total: value,
											} )
										}
										required
									/>
								</FlexBlock>
							</Flex>
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
									rows={ 4 }
								/>
							</FlexBlock>
							<Flex justify="flex-start">
								<Button
									variant="primary"
									type="submit"
									isBusy={ isCreating }
								>
									{ __( 'Create Transaction', 'wp-erp' ) }
								</Button>
							</Flex>
						</Flex>
					</form>
				</CardBody>
			</Card>
		</>
	);
};

export default CreateTransaction;
