import { addFilter } from '@wordpress/hooks';
import { Route } from 'react-router-dom';
import { currencyDollar, calendar, update } from '@wordpress/icons';

// Import our isolated modules
import DonationsApp from './modules/donations/App';
import FoodPassApp from './modules/food-pass/App';
import ContentApp from './modules/content/App';

/**
 * 1. Inject Menu Items into the Core Sidebar
 */
addFilter( 'wpErp.sidebarMenuItems', 'gurukul-addon/sidebar', ( items ) => {
	return [
		...items,
		{ name: 'Donations', path: '/donations', icon: currencyDollar },
		{ name: 'Food Pass', path: '/food-pass', icon: calendar },
		{ name: 'Content (Darshan)', path: '/content', icon: update },
	];
} );

/**
 * 2. Inject React Router Routes into the Core App
 */
addFilter( 'wpErp.routes', 'gurukul-addon/routes', ( routes ) => {
	return [
		...routes,
		<Route key="donations" path="/donations" element={<DonationsApp />} />,
		<Route key="food-pass" path="/food-pass" element={<FoodPassApp />} />,
		<Route key="content" path="/content" element={<ContentApp />} />,
	];
} );
