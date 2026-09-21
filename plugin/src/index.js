/**
 * WordPress ERP Plugin - Main Entry Point (FSE SPA)
 */
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

import './style.scss';

// Import modules
import CRMApp from './modules/crm/App';
import AccountingApp from './modules/accounting/App';
import HRApp from './modules/hr/App';
import HelpdeskApp from './modules/helpdesk/App';
import SettingsApp from './modules/settings/App';
import DashboardApp from './modules/dashboard/App';
import { DashboardWidget } from './modules/dashboard/components/DashboardWidget';

// Expose APIs for 3rd party plugin authors on the global object
if ( typeof window !== 'undefined' ) {
	window.sahajanandErp = window.sahajanandErp || {};
	window.sahajanandErp.components = {
		...(window.sahajanandErp.components || {}),
		DashboardWidget
	};
}

// Addons will inject their own apps here dynamically in the future.

import { applyFilters } from '@wordpress/hooks';
import Layout from './components/Layout';

const App = () => {
	
	const coreRoutes = [
		<Route key="dashboard" path="/dashboard" element={<DashboardApp />} />,
		<Route key="crm" path="/crm" element={<CRMApp />} />,
		<Route key="accounting" path="/accounting" element={<AccountingApp />} />,
		<Route key="hr" path="/hr" element={<HRApp />} />,
		<Route key="helpdesk" path="/helpdesk" element={<HelpdeskApp />} />,
		<Route key="addons" path="/addons" element={<div><h1>Premium Add-ons</h1><p>Manage your modules here.</p></div>} />,
		<Route key="settings" path="/settings/*" element={<SettingsApp />} />,
	];

	// Premium Addons can inject their routes as configuration objects:
	// { path: '/donations', element: <DonationsApp /> }
	const addonRoutesConfig = applyFilters( 'sahajanandErp.routes', [] );

	const addonRoutes = addonRoutesConfig.map( ( routeConfig, index ) => (
		<Route key={`addon-${index}`} path={routeConfig.path} element={routeConfig.element} />
	) );

	return (
		<HashRouter>
			<Layout>
				<Routes>
					<Route path="/" element={<Navigate to="/dashboard" replace />} />
					{ coreRoutes }
					{ addonRoutes }
				</Routes>
			</Layout>
		</HashRouter>
	);
};

// Wait for DOM to be ready
function initERP() {
	const rootElement = document.getElementById( 'sahajanand-erp-root' );
	if ( rootElement ) {
		const root = createRoot( rootElement );
		root.render( <App /> );
	}
}

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', initERP );
} else {
	initERP();
}
