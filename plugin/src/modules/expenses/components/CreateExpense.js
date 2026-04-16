/**
 * Create Expense Component
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
import { createExpense } from '../services/api';

const CreateExpense = ( { onExpenseCreated } ) => {
	const [ isCreating, setIsCreating ] = useState( false );
	const [ error, setError ] = useState( null );
	const [ formData, setFormData ] = useState( {
		expense_type: 'general',
		date: new Date().toISOString().split( 'T' )[ 0 ],
		amount: '',
		description: '',
		category: '',
		payment_method: 'cash',
		status: 'pending',
	} );

	const handleSubmit = async ( e ) => {
		e.preventDefault();
		setIsCreating( true );
		setError( null );

		try {
			await createExpense( formData );

			// Reset form
			setFormData( {
				expense_type: 'general',
				date: new Date().toISOString().split( 'T' )[ 0 ],
				amount: '',
				description: '',
				category: '',
				payment_method: 'cash',
				status: 'pending',
			} );

			if ( onExpenseCreated ) {
				onExpenseCreated();
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
						{ __( 'Add Expense', 'wp-erp' ) }
					</h2>
				</CardHeader>
				<CardBody>
					<form onSubmit={ handleSubmit }>
						<Flex direction="column" gap={ 4 }>
							<Flex>
								<FlexBlock>
									<SelectControl
										label={ __( 'Expense Type', 'wp-erp' ) }
										value={ formData.expense_type }
										options={ [
											{
												label: __(
													'General',
													'wp-erp'
												),
												value: 'general',
											},
											{
												label: __( 'Travel', 'wp-erp' ),
												value: 'travel',
											},
											{
												label: __( 'Meals', 'wp-erp' ),
												value: 'meals',
											},
											{
												label: __(
													'Office Supplies',
													'wp-erp'
												),
												value: 'office_supplies',
											},
										] }
										onChange={ ( value ) =>
											setFormData( {
												...formData,
												expense_type: value,
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
										label={ __( 'Amount', 'wp-erp' ) }
										type="number"
										step="0.01"
										value={ formData.amount }
										onChange={ ( value ) =>
											setFormData( {
												...formData,
												amount: value,
											} )
										}
										required
									/>
								</FlexBlock>
								<FlexBlock>
									<TextControl
										label={ __( 'Category', 'wp-erp' ) }
										value={ formData.category }
										onChange={ ( value ) =>
											setFormData( {
												...formData,
												category: value,
											} )
										}
									/>
								</FlexBlock>
							</Flex>
							<Flex>
								<FlexBlock>
									<SelectControl
										label={ __(
											'Payment Method',
											'wp-erp'
										) }
										value={ formData.payment_method }
										options={ [
											{
												label: __( 'Cash', 'wp-erp' ),
												value: 'cash',
											},
											{
												label: __(
													'Bank Transfer',
													'wp-erp'
												),
												value: 'bank_transfer',
											},
											{
												label: __(
													'Credit Card',
													'wp-erp'
												),
												value: 'credit_card',
											},
											{
												label: __( 'Cheque', 'wp-erp' ),
												value: 'cheque',
											},
										] }
										onChange={ ( value ) =>
											setFormData( {
												...formData,
												payment_method: value,
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
												label: __(
													'Pending',
													'wp-erp'
												),
												value: 'pending',
											},
											{
												label: __(
													'Approved',
													'wp-erp'
												),
												value: 'approved',
											},
											{
												label: __(
													'Rejected',
													'wp-erp'
												),
												value: 'rejected',
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
									{ __( 'Add Expense', 'wp-erp' ) }
								</Button>
							</Flex>
						</Flex>
					</form>
				</CardBody>
			</Card>
		</>
	);
};

export default CreateExpense;
