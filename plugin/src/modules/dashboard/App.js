import {
	__experimentalGrid as Grid,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	__experimentalHeading as Heading,
	SlotFillProvider
} from '@wordpress/components';
import { DashboardWidgetSlot, DashboardWidget } from './components/DashboardWidget';

import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { Spinner } from '@wordpress/components';

const DefaultQuickStatsWidget = () => {
	const [ stats, setStats ] = useState( null );
	const [ isLoading, setIsLoading ] = useState( true );

	useEffect( () => {
		// Fetch actual counts from the ERP REST API
		const fetchStats = async () => {
			try {
				const [ contacts, invoices, employees, tickets ] = await Promise.all([
					apiFetch( { path: '/sahajanand-erp/v1/crm/contacts' } ).catch( () => [] ),
					apiFetch( { path: '/sahajanand-erp/v1/invoices' } ).catch( () => [] ),
					apiFetch( { path: '/sahajanand-erp/v1/hr/employees' } ).catch( () => [] ),
					apiFetch( { path: '/sahajanand-erp/v1/helpdesk/tickets' } ).catch( () => [] )
				]);

				setStats({
					contacts: contacts.length || 0,
					invoices: invoices.length || 0,
					employees: employees.length || 0,
					tickets: tickets.length || 0,
				});
			} catch ( error ) {
				console.error( 'Error fetching stats:', error );
			}
			setIsLoading( false );
		};

		fetchStats();
	}, [] );

	return (
		<DashboardWidget title="Quick Stats">
			{ isLoading ? (
				<div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
					<Spinner />
				</div>
			) : (
				<Grid columns={ 2 } gap={ 4 }>
					<VStack spacing={ 1 }>
						<Text variant="muted">Total Contacts</Text>
						<Heading level={ 3 }>{ stats?.contacts || 0 }</Heading>
					</VStack>
					<VStack spacing={ 1 }>
						<Text variant="muted">Total Invoices</Text>
						<Heading level={ 3 }>{ stats?.invoices || 0 }</Heading>
					</VStack>
					<VStack spacing={ 1 }>
						<Text variant="muted">Active Employees</Text>
						<Heading level={ 3 }>{ stats?.employees || 0 }</Heading>
					</VStack>
					<VStack spacing={ 1 }>
						<Text variant="muted">Tickets</Text>
						<Heading level={ 3 }>{ stats?.tickets || 0 }</Heading>
					</VStack>
				</Grid>
			) }
		</DashboardWidget>
	);
};

const DefaultActivityWidget = () => (
	<DashboardWidget title="Recent Activity">
		<VStack spacing={ 3 }>
			<Text>📝 <strong>John Doe</strong> updated an invoice.</Text>
			<Text>👤 <strong>Jane Smith</strong> was added to CRM.</Text>
			<Text>🎫 <strong>Ticket #402</strong> was closed by Support.</Text>
		</VStack>
	</DashboardWidget>
);

const DashboardApp = () => {
	return (
		<SlotFillProvider>
			<div className="sahajanand-erp-dashboard" style={ { padding: '24px' } }>
				<div style={{ marginBottom: '24px' }}>
					<Heading level={ 1 }>Dashboard</Heading>
					<Text>Welcome back to Sahajanand ERP.</Text>
				</div>
				
				<Grid columns={ 3 } gap={ 6 }>
					{/* Render Default Core Widgets */}
					<DefaultQuickStatsWidget />
					<DefaultActivityWidget />
					
					{/* This Slot will render any widgets injected by third-party plugins or addons */}
					<DashboardWidgetSlot>
						{ ( fills ) => {
							// You can inspect fills here if needed, or just return them.
							return fills;
						} }
					</DashboardWidgetSlot>
				</Grid>
			</div>
		</SlotFillProvider>
	);
};

export default DashboardApp;
