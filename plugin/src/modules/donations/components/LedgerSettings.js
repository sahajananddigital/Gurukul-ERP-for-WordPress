/**
 * Ledger Settings Component
 */
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	Card,
	CardBody,
	CardHeader,
	Flex,
	TextControl,
	Button,
	Notice,
} from '@wordpress/components';
import { createLedger } from '../services/api';

const LedgerSettings = ( { ledgers, onLedgersUpdated } ) => {
	const [ newLedger, setNewLedger ] = useState( '' );
	const [ error, setError ] = useState( null );
	const [ isSaving, setIsSaving ] = useState( false );

	const addLedger = async () => {
		if ( ! newLedger ) {
			return;
		}
		setIsSaving( true );
		setError( null );

		const updated = [ ...ledgers, newLedger ];

		try {
			await createLedger( updated );
			onLedgersUpdated( updated );
			setNewLedger( '' );
		} catch ( err ) {
			setError( err.message );
		} finally {
			setIsSaving( false );
		}
	};

	return (
		<Card>
			<CardHeader>
				<h3>{ __( 'Manage Ledgers', 'wp-erp' ) }</h3>
			</CardHeader>
			<CardBody>
				{ error && (
					<Notice status="error" onRemove={ () => setError( null ) }>
						{ error }
					</Notice>
				) }
				<ul>
					{ ledgers.map( ( l, i ) => (
						<li key={ i }>{ l }</li>
					) ) }
				</ul>
				<Flex>
					<TextControl
						value={ newLedger }
						onChange={ setNewLedger }
						placeholder={ __( 'New Ledger Name', 'wp-erp' ) }
					/>
					<Button
						variant="secondary"
						onClick={ addLedger }
						isBusy={ isSaving }
					>
						{ __( 'Add', 'wp-erp' ) }
					</Button>
				</Flex>
			</CardBody>
		</Card>
	);
};

export default LedgerSettings;
