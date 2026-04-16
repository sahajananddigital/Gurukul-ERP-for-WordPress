/**
 * WordPress ERP Plugin - Main Entry Point
 */
import { createRoot } from 'react-dom/client';

// Import modules
import CRMApp from './modules/crm/App';
import AccountingApp from './modules/accounting/App';
import HRApp from './modules/hr/App';
import HelpdeskApp from './modules/helpdesk/App';
import VouchersApp from './modules/vouchers/App';
import InvoicesApp from './modules/invoices/App';
import ExpensesApp from './modules/expenses/App';
import FoodPassApp from './modules/food-pass/App';
import DonationsApp from './modules/donations/App';
import ContentApp from './modules/content/App';
import QuotesApp from './modules/quotes/App';
import UpdatesApp from './modules/updates/App';
import SatsangApp from './modules/satsang/App';
import ProgramsApp from './modules/programs/App';
import CalendarApp from './modules/calendar/App';

// Initialize modules based on page
function initERP() {
	// CRM
	const crmRoot = document.getElementById( 'wp-erp-crm-root' );
	if ( crmRoot ) {
		const root = createRoot( crmRoot );
		root.render( <CRMApp /> );
	}

	// Accounting
	const accountingRoot = document.getElementById( 'wp-erp-accounting-root' );
	if ( accountingRoot ) {
		const root = createRoot( accountingRoot );
		root.render( <AccountingApp /> );
	}

	// HR
	const hrRoot = document.getElementById( 'wp-erp-hr-root' );
	if ( hrRoot ) {
		const root = createRoot( hrRoot );
		root.render( <HRApp /> );
	}

	// Helpdesk
	const helpdeskRoot = document.getElementById( 'wp-erp-helpdesk-root' );
	if ( helpdeskRoot ) {
		const root = createRoot( helpdeskRoot );
		root.render( <HelpdeskApp /> );
	}

	// Vouchers
	const vouchersRoot = document.getElementById( 'wp-erp-vouchers-root' );
	if ( vouchersRoot ) {
		const root = createRoot( vouchersRoot );
		root.render( <VouchersApp /> );
	}

	// Invoices
	const invoicesRoot = document.getElementById( 'wp-erp-invoices-root' );
	if ( invoicesRoot ) {
		const root = createRoot( invoicesRoot );
		root.render( <InvoicesApp /> );
	}

	// Expenses
	const expensesRoot = document.getElementById( 'wp-erp-expenses-root' );
	if ( expensesRoot ) {
		const root = createRoot( expensesRoot );
		root.render( <ExpensesApp /> );
	}

	// Food Pass
	const foodPassRoot = document.getElementById( 'wp-erp-food-pass-root' );
	if ( foodPassRoot ) {
		const root = createRoot( foodPassRoot );
		root.render( <FoodPassApp /> );
	}

	// Donations
	const donationsRoot = document.getElementById( 'wp-erp-donations-root' );
	if ( donationsRoot ) {
		const root = createRoot( donationsRoot );
		root.render( <DonationsApp /> );
	}

	// Content (Daily Darshan)
	const contentRoot = document.getElementById( 'wp-erp-content-root' );
	if ( contentRoot ) {
		const root = createRoot( contentRoot );
		root.render( <ContentApp /> );
	}

	// Quotes (Daily Quotes)
	const quotesRoot = document.getElementById( 'wp-erp-quotes-root' );
	if ( quotesRoot ) {
		const root = createRoot( quotesRoot );
		root.render( <QuotesApp /> );
	}

	// Updates (Daily Updates)
	const updatesRoot = document.getElementById( 'wp-erp-updates-root' );
	if ( updatesRoot ) {
		const root = createRoot( updatesRoot );
		root.render( <UpdatesApp /> );
	}

	// Satsang (Daily Satsang)
	const satsangRoot = document.getElementById( 'wp-erp-satsang-root' );
	if ( satsangRoot ) {
		const root = createRoot( satsangRoot );
		root.render( <SatsangApp /> );
	}

	// Programs (Daily Programs)
	const programsRoot = document.getElementById( 'wp-erp-programs-root' );
	if ( programsRoot ) {
		const root = createRoot( programsRoot );
		root.render( <ProgramsApp /> );
	}

	// Calendar
	const calendarRoot = document.getElementById( 'wp-erp-calendar-root' );
	if ( calendarRoot ) {
		const root = createRoot( calendarRoot );
		root.render( <CalendarApp /> );
	}
}

// Wait for DOM to be ready
if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', initERP );
} else {
	// DOM is already ready
	initERP();
}
