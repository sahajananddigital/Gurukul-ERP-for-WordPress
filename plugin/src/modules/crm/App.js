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
import { fetchContacts, fetchLeads, fetchDeals, fetchOrganizations } from './services/api';
import ContactsList from './components/ContactsList';
import ContactForm from './components/ContactForm';
import LeadsList from './components/LeadsList';
import DealsList from './components/DealsList';
import OrganizationsList from './components/OrganizationsList';
import Reports from './components/Reports';

const CRMApp = () => {
	const [ data, setData ] = useState( {
		contacts: [],
		leads: [],
		deals: [],
		organizations: []
	} );
	const [ loading, setLoading ] = useState( true );
	const [ error, setError ] = useState( null );

	useEffect( () => {
		loadData();
	}, [] );

	const loadData = async () => {
		setLoading( true );
		setError( null );
		try {
			const [ contacts, leads, deals, organizations ] = await Promise.all([
				fetchContacts(),
				fetchLeads(),
				fetchDeals(),
				fetchOrganizations()
			]);
			setData( { contacts, leads, deals, organizations } );
		} catch ( err ) {
			setError( err.message );
		} finally {
			setLoading( false );
		}
	};

	const handleDataChanged = () => {
		loadData();
	};

	return (
		<div className="wp-erp-crm">
			{ error && (
				<Notice
					status="error"
					isDismissible={ false }
					onRemove={ () => setError( null ) }
				>
					{ error }
				</Notice>
			) }

			<div style={{ padding: '32px 40px', borderBottom: '1px solid #e0e0e0' }}>
				<h1 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>
					{ __( 'CRM Management', 'wp-erp' ) }
				</h1>
			</div>
			<div style={{ padding: '0 40px' }}>
				<TabPanel
						className="wp-erp-crm-tabs"
						activeClass="is-active"
						initialTabName="leads"
						tabs={ [
							{ name: 'leads', title: __( 'Leads', 'wp-erp' ), className: 'tab-leads' },
							{ name: 'contacts', title: __( 'Contacts', 'wp-erp' ), className: 'tab-contacts' },
							{ name: 'organizations', title: __( 'Organizations', 'wp-erp' ), className: 'tab-organizations' },
							{ name: 'deals', title: __( 'Deals', 'wp-erp' ), className: 'tab-deals' },
							{ name: 'reports', title: __( 'Reports', 'wp-erp' ), className: 'tab-reports' },
						] }
					>
						{ ( tab ) => (
							<div style={{ marginTop: '20px' }}>
								{ tab.name === 'leads' && (
									<Card>
										<CardHeader>
											<h2 style={ { margin: 0 } }>{ __( 'Leads', 'wp-erp' ) }</h2>
										</CardHeader>
										<CardBody>
											<LeadsList leads={ data.leads } loading={ loading } onLeadUpdated={ handleDataChanged } />
										</CardBody>
									</Card>
								) }
								{ tab.name === 'contacts' && (
									<>
										<ContactForm onContactCreated={ handleDataChanged } />
										<Card>
											<CardHeader>
												<h2 style={ { margin: 0 } }>{ __( 'Contacts', 'wp-erp' ) }</h2>
											</CardHeader>
											<CardBody>
												<ContactsList contacts={ data.contacts } loading={ loading } onContactUpdated={ handleDataChanged } />
											</CardBody>
										</Card>
									</>
								) }
								{ tab.name === 'organizations' && (
									<Card>
										<CardHeader>
											<h2 style={ { margin: 0 } }>{ __( 'Organizations', 'wp-erp' ) }</h2>
										</CardHeader>
										<CardBody>
											<OrganizationsList organizations={ data.organizations } loading={ loading } onOrganizationUpdated={ handleDataChanged } />
										</CardBody>
									</Card>
								) }
								{ tab.name === 'deals' && (
									<Card>
										<CardHeader>
											<h2 style={ { margin: 0 } }>{ __( 'Deals', 'wp-erp' ) }</h2>
										</CardHeader>
										<CardBody>
											<DealsList deals={ data.deals } loading={ loading } onDealUpdated={ handleDataChanged } />
										</CardBody>
									</Card>
								) }
								{ tab.name === 'reports' && <Reports /> }
							</div>
						) }
					</TabPanel>
			</div>
		</div>
	);
};

export default CRMApp;
