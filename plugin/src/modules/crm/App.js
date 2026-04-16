/**
 * CRM Module App
 */
import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	Card,
	CardBody,
	CardHeader,
	Notice,
	TabPanel,
} from '@wordpress/components';
import { fetchContacts as fetchContactsApi } from './services/api';
import ContactsList from './components/ContactsList';
import ContactForm from './components/ContactForm';
import Reports from './components/Reports';

const CRMApp = () => {
	const [ contacts, setContacts ] = useState( [] );
	const [ loading, setLoading ] = useState( true );
	const [ error, setError ] = useState( null );

	useEffect( () => {
		loadData();
	}, [] );

	const loadData = async () => {
		setLoading( true );
		setError( null );
		try {
			const data = await fetchContactsApi(); // Fetch all initially for Contacts List
			setContacts( data );
		} catch ( err ) {
			setError( err.message );
		} finally {
			setLoading( false );
		}
	};

	const handleContactCreated = () => {
		loadData();
	};

	return (
		<div className="wp-erp-crm" style={ { padding: '16px' } }>
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
					<h2 style={ { margin: 0 } }>
						{ __( 'CRM Management', 'wp-erp' ) }
					</h2>
				</CardHeader>
				<CardBody>
					<TabPanel
						className="wp-erp-crm-tabs"
						activeClass="is-active"
						initialTabName="contacts"
						tabs={ [
							{
								name: 'contacts',
								title: __( 'Contacts', 'wp-erp' ),
								className: 'tab-contacts',
							},
							{
								name: 'reports',
								title: __( 'Reports', 'wp-erp' ),
								className: 'tab-reports',
							},
						] }
					>
						{ ( tab ) => (
							<>
								{ tab.name === 'contacts' && (
									<>
										<ContactForm
											onContactCreated={
												handleContactCreated
											}
										/>
										<Card>
											<CardHeader>
												<h2 style={ { margin: 0 } }>
													{ __(
														'Contacts',
														'wp-erp'
													) }
												</h2>
											</CardHeader>
											<CardBody>
												<ContactsList
													contacts={ contacts }
													loading={ loading }
												/>
											</CardBody>
										</Card>
									</>
								) }
								{ tab.name === 'reports' && <Reports /> }
							</>
						) }
					</TabPanel>
				</CardBody>
			</Card>
		</div>
	);
};

export default CRMApp;
