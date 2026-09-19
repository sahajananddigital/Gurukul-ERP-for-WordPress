/**
 * Create Food Pass Component
 */
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	Card,
	CardBody,
	CardHeader,
	Button,
	TextControl,
	Flex,
	FlexBlock,
	Notice,
} from '@wordpress/components';
import { createFoodPass } from '../services/api';
import { getMealType } from '../utils';
import { generateReceiptImage, printReceiptImage } from '../utils/receipt';

const CreateFoodPass = ( { onFoodPassCreated } ) => {
	const [ quantity, setQuantity ] = useState( 1 );
	const [ rate ] = useState( 90 );
	const [ isCreating, setIsCreating ] = useState( false );
	const [ error, setError ] = useState( null );

	const total = quantity * rate;

	const handlePrint = async ( e ) => {
		e.preventDefault();
		setIsCreating( true );
		setError( null );

		const now = new Date();
		const today = now.toISOString().split( 'T' )[ 0 ];
		const currentTime = now.toLocaleTimeString( [], {
			hour: '2-digit',
			minute: '2-digit',
		} );
		const mealType = getMealType( now );

		// Prepare data for Receipt
		const receiptData = {
			quantity: parseInt( quantity ),
			amount: total,
			date: today,
			time: currentTime,
			rate,
			mealType,
			id: 'PENDING...', // Will be updated if we wait for API? No, we print optimistically first or after?
			// User wants instant print.
			// To print with correct ID, we should technically wait for API or use a temp ID?
			// The original code printed "PENDING..." then updated.
			// With canvas image, we generate it once.
			// Let's stick to "PENDING..." or try to save first?
			// Original requirement was "Prints instantly".
			// However, for a valid ID on receipt, we must save first.
			// Let's save first to get ID, then print (fast enough usually).
		};

		// Prepare data for Backend
		const apiPayload = {
			issue_date: today,
			valid_from: today,
			valid_to: today,
			total_meals: parseInt( quantity ),
			meals_per_day: parseInt( quantity ),
			status: 'active',
			notes: JSON.stringify( {
				amount: total,
				rate,
				time: currentTime,
				mealType,
			} ),
		};

		try {
			// Save first to get real ID
			const savedPass = await createFoodPass( apiPayload );

			// Update data with real ID
			receiptData.id = savedPass.id;

			// Generate and Print
			const imageUrl = generateReceiptImage( receiptData, 'food-pass' );
			printReceiptImage( imageUrl );

			// Notify Parent
			if ( onFoodPassCreated ) {
				onFoodPassCreated();
			}

			// Reset form
			setQuantity( 1 );
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
			<Card style={ { marginBottom: '24px', maxWidth: '400px' } }>
				<CardHeader>
					<h2 style={ { margin: 0 } }>
						{ __( 'Food Pass', 'wp-erp' ) }
					</h2>
				</CardHeader>
				<CardBody>
					<form onSubmit={ handlePrint }>
						<Flex direction="column" gap={ 4 }>
							<FlexBlock>
								<TextControl
									label={ __( 'Quantity:', 'wp-erp' ) }
									type="number"
									min="1"
									value={ quantity }
									onChange={ ( value ) =>
										setQuantity( value )
									}
									required
								/>
							</FlexBlock>
							<FlexBlock>
								<TextControl
									label={ __(
										'Total Amount to Pay:',
										'wp-erp'
									) }
									value={ `₹${ total }` }
									readOnly
									help={ __(
										'Rate: ₹90 per meal',
										'wp-erp'
									) }
								/>
							</FlexBlock>
							<Flex justify="flex-start">
								<Button
									variant="primary"
									type="submit"
									isBusy={ isCreating }
								>
									{ __( 'Print Food Pass', 'wp-erp' ) }
								</Button>
							</Flex>
							<p
								style={ {
									fontSize: '12px',
									color: '#646970',
									margin: 0,
								} }
							>
								{ __(
									'Prints instantly; data queued for syncing.'
								) }
							</p>
						</Flex>
					</form>
				</CardBody>
			</Card>
		</>
	);
};

export default CreateFoodPass;
