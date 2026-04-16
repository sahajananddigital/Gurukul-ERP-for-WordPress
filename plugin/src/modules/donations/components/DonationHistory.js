/**
 * Donation History Component
 */
import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import {
	Card,
	CardBody,
	CardHeader,
	Spinner,
	Flex,
	Button,
} from '@wordpress/components';
import EditModal from '../../../components/EditModal';
import { updateDonation } from '../services/api';

const DonationHistory = ( { donations, loading, onDonationUpdated } ) => {
	const [ isEditModalOpen, setIsEditModalOpen ] = useState( false );
	const [ editingDonation, setEditingDonation ] = useState( null );

	const handleEdit = ( donation ) => {
		setEditingDonation( donation );
		setIsEditModalOpen( true );
	};

	const handleSave = async ( data ) => {
		try {
			await updateDonation( data );
			if ( onDonationUpdated ) {
				onDonationUpdated();
			}
		} catch ( error ) {
			console.error( error );
		}
	};

	if ( loading && donations.length === 0 ) {
		return (
			<Flex justify="center" style={ { padding: '32px' } }>
				<Spinner />
			</Flex>
		);
	}

	const donationFields = [
		{
			key: 'donor_name',
			label: __( 'Donor Name', 'wp-erp' ),
			type: 'text',
		},
		{ key: 'phone', label: __( 'Phone', 'wp-erp' ), type: 'text' },
		{ key: 'ledger', label: __( 'Ledger', 'wp-erp' ), type: 'text' }, // Ideally a select but keeping simple text for now
		{
			key: 'amount',
			label: __( 'Amount', 'wp-erp' ),
			type: 'text',
			inputType: 'number',
		},
		{ key: 'notes', label: __( 'Notes', 'wp-erp' ), type: 'textarea' },
		{
			key: 'issue_date',
			label: __( 'Date', 'wp-erp' ),
			type: 'text',
			inputType: 'date',
		},
	];

	return (
		<Card>
			<CardHeader>
				<h3>{ __( 'Donation History', 'wp-erp' ) }</h3>
			</CardHeader>
			<CardBody>
				{ donations.length === 0 ? (
					<p
						style={ {
							textAlign: 'center',
							color: '#757575',
						} }
					>
						{ __( 'No donations found.', 'wp-erp' ) }
					</p>
				) : (
					<table className="wp-list-table widefat fixed striped">
						<thead>
							<tr>
								<th>{ __( 'ID', 'wp-erp' ) }</th>
								<th>{ __( 'Date', 'wp-erp' ) }</th>
								<th>{ __( 'Donor', 'wp-erp' ) }</th>
								<th>{ __( 'Phone', 'wp-erp' ) }</th>
								<th>{ __( 'Ledger', 'wp-erp' ) }</th>
								<th>{ __( 'Amount', 'wp-erp' ) }</th>
								<th>{ __( 'Actions', 'wp-erp' ) }</th>
							</tr>
						</thead>
						<tbody>
							{ donations.map( ( d ) => (
								<tr key={ d.id }>
									<td>{ d.id }</td>
									<td>{ d.issue_date }</td>
									<td>{ d.donor_name }</td>
									<td>{ d.phone }</td>
									<td>{ d.ledger }</td>
									<td>₹{ d.amount }</td>
									<td>
										<Button
											isSmall
											variant="secondary"
											onClick={ () => handleEdit( d ) }
										>
											{ __( 'Edit', 'wp-erp' ) }
										</Button>
									</td>
								</tr>
							) ) }
						</tbody>
					</table>
				) }

				<EditModal
					title={ __( 'Edit Donation', 'wp-erp' ) }
					isOpen={ isEditModalOpen }
					onClose={ () => setIsEditModalOpen( false ) }
					onSave={ handleSave }
					data={ editingDonation }
					fields={ donationFields }
				/>
			</CardBody>
		</Card>
	);
};

export default DonationHistory;
