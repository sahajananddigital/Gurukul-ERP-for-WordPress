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
			label: __( 'Donor Name', 'sahajanand-erp' ),
			type: 'text',
		},
		{ key: 'phone', label: __( 'Phone', 'sahajanand-erp' ), type: 'text' },
		{ key: 'ledger', label: __( 'Ledger', 'sahajanand-erp' ), type: 'text' }, // Ideally a select but keeping simple text for now
		{
			key: 'amount',
			label: __( 'Amount', 'sahajanand-erp' ),
			type: 'text',
			inputType: 'number',
		},
		{ key: 'notes', label: __( 'Notes', 'sahajanand-erp' ), type: 'textarea' },
		{
			key: 'issue_date',
			label: __( 'Date', 'sahajanand-erp' ),
			type: 'text',
			inputType: 'date',
		},
	];

	return (
		<Card>
			<CardHeader>
				<h3>{ __( 'Donation History', 'sahajanand-erp' ) }</h3>
			</CardHeader>
			<CardBody>
				{ donations.length === 0 ? (
					<p
						style={ {
							textAlign: 'center',
							color: '#757575',
						} }
					>
						{ __( 'No donations found.', 'sahajanand-erp' ) }
					</p>
				) : (
					<table className="wp-list-table widefat fixed striped">
						<thead>
							<tr>
								<th>{ __( 'ID', 'sahajanand-erp' ) }</th>
								<th>{ __( 'Date', 'sahajanand-erp' ) }</th>
								<th>{ __( 'Donor', 'sahajanand-erp' ) }</th>
								<th>{ __( 'Phone', 'sahajanand-erp' ) }</th>
								<th>{ __( 'Ledger', 'sahajanand-erp' ) }</th>
								<th>{ __( 'Amount', 'sahajanand-erp' ) }</th>
								<th>{ __( 'Actions', 'sahajanand-erp' ) }</th>
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
											{ __( 'Edit', 'sahajanand-erp' ) }
										</Button>
									</td>
								</tr>
							) ) }
						</tbody>
					</table>
				) }

				<EditModal
					title={ __( 'Edit Donation', 'sahajanand-erp' ) }
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
