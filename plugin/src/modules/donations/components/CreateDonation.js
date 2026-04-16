/**
 * Create Donation Component
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
	Notice,
} from '@wordpress/components';
import { createDonation, fetchDonorByPhone } from '../services/api';

import {
	generateReceiptImage,
	printReceiptImage,
} from '../../food-pass/utils/receipt';

const CreateDonation = ( { ledgers, onDonationCreated } ) => {
	const [ isCreating, setIsCreating ] = useState( false );
	const [ error, setError ] = useState( null );

	// Form State
	const [ donorName, setDonorName ] = useState( '' );
	const [ phone, setPhone ] = useState( '' );
	const [ ledger, setLedger ] = useState( ledgers[ 0 ] || '' );
	const [ amount, setAmount ] = useState( '' );
	const [ note, setNote ] = useState( '' );

	const handlePhoneBlur = async () => {
		if ( ! phone ) {
			return;
		}
		const data = await fetchDonorByPhone( phone );
		if ( data && data.found && data.donor_name ) {
			setDonorName( data.donor_name );
		}
	};

	const handleSave = async ( e ) => {
		e.preventDefault();
		setIsCreating( true );
		setError( null );

		const today = new Date().toISOString().split( 'T' )[ 0 ];

		const payload = {
			donor_name: donorName,
			phone,
			ledger: ledger || ledgers[ 0 ],
			amount,
			notes: note,
			issue_date: today,
		};

		try {
			const saved = await createDonation( payload );

			// Generate Receipt Data
			const receiptData = {
				title: 'DONATION RECEIPT',
				id: saved.id,
				donor_id: saved.donor_id, // Passed from API
				date: today,
				donor_name: donorName,
				phone,
				ledger: ledger || ledgers[ 0 ],
				amount,
				note,
			};

			// Print
			const imageUrl = generateReceiptImage( receiptData, 'donation' );
			printReceiptImage( imageUrl );

			// Reset
			setDonorName( '' );
			setPhone( '' );
			setAmount( '' );
			setNote( '' );

			if ( onDonationCreated ) {
				onDonationCreated( saved );
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

			<Card>
				<CardHeader>
					<h3>{ __( 'New Donation', 'wp-erp' ) }</h3>
				</CardHeader>
				<CardBody>
					<form onSubmit={ handleSave }>
						<Flex direction="column" gap={ 4 }>
							<TextControl
								label={ __( 'Date', 'wp-erp' ) }
								value={ new Date().toLocaleDateString() }
								readOnly
							/>
							<TextControl
								label={ __( 'Phone Number', 'wp-erp' ) }
								value={ phone }
								onChange={ setPhone }
								onBlur={ handlePhoneBlur }
								required
							/>
							<TextControl
								label={ __( 'Donor Name', 'wp-erp' ) }
								value={ donorName }
								onChange={ setDonorName }
								required
							/>
							<SelectControl
								label={ __( 'Ledger', 'wp-erp' ) }
								value={ ledger }
								options={ ledgers.map( ( l ) => ( {
									label: l,
									value: l,
								} ) ) }
								onChange={ setLedger }
							/>
							<TextControl
								label={ __( 'Note (Optional)', 'wp-erp' ) }
								value={ note }
								onChange={ setNote }
							/>

							<div>
								<label className="components-base-control__label">
									{ __( 'Amount', 'wp-erp' ) }
								</label>
								<Flex
									gap={ 2 }
									wrap={ true }
									style={ { marginBottom: '10px' } }
								>
									{ [ 100, 200, 250, 500, 1000 ].map(
										( amt ) => (
											<Button
												key={ amt }
												variant={
													parseInt( amount ) === amt
														? 'primary'
														: 'secondary'
												}
												onClick={ () =>
													setAmount( amt )
												}
											>
												₹{ amt }
											</Button>
										)
									) }
								</Flex>
								<TextControl
									placeholder={ __(
										'Custom Amount',
										'wp-erp'
									) }
									type="number"
									value={ amount }
									onChange={ setAmount }
									required
								/>
							</div>

							<div
								style={ {
									fontSize: '18px',
									fontWeight: 'bold',
								} }
							>
								Total: ₹{ amount || 0 }
							</div>

							<Button
								type="submit"
								variant="primary"
								isBusy={ isCreating }
							>
								{ __( 'Print & Save', 'wp-erp' ) }
							</Button>
						</Flex>
					</form>
				</CardBody>
			</Card>
		</>
	);
};

export default CreateDonation;
