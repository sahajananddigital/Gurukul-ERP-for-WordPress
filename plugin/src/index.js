/**
 * WordPress ERP Plugin - Main Entry Point (FSE SPA)
 */
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import modules
import CRMApp from './modules/crm/App';
import AccountingApp from './modules/accounting/App';
import HRApp from './modules/hr/App';
import HelpdeskApp from './modules/helpdesk/App';
import VouchersApp from './modules/vouchers/App';
import InvoicesApp from './modules/invoices/App';
import ExpensesApp from './modules/expenses/App';
// Addons will inject their own apps here dynamically in the future.

import { applyFilters } from '@wordpress/hooks';
import Layout from './components/Layout';

const App = () => {
	
	const coreRoutes = [
		<Route key="dashboard" path="/dashboard" element={<div><h1>Dashboard</h1><p>Welcome to Sahajanand ERP.</p></div>} />,
		<Route key="crm" path="/crm" element={<CRMApp />} />,
		<Route key="accounting" path="/accounting" element={<AccountingApp />} />,
		<Route key="hr" path="/hr" element={<HRApp />} />,
		<Route key="helpdesk" path="/helpdesk" element={<HelpdeskApp />} />,
		<Route key="vouchers" path="/vouchers" element={<VouchersApp />} />,
		<Route key="invoices" path="/invoices" element={<InvoicesApp />} />,
		<Route key="expenses" path="/expenses" element={<ExpensesApp />} />,
		<Route key="addons" path="/addons" element={<div><h1>Premium Add-ons</h1><p>Manage your modules here.</p></div>} />,
		<Route key="settings" path="/settings/*" element={<div><h1>Settings</h1><p>Global configurations.</p></div>} />,
	];

	// Premium Addons can inject their `<Route />` components here
	const addonRoutes = applyFilters( 'wpErp.routes', [] );

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
	const rootElement = document.getElementById( 'wp-erp-root' );
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
