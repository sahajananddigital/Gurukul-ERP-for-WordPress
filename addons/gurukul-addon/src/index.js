import { addFilter } from '@wordpress/hooks';
import { currencyDollar, calendar, update } from '@wordpress/icons';

// Import our isolated modules
import DonationsApp from './modules/donations/App';
import FoodPassApp from './modules/food-pass/App';
import ContentApp from './modules/content/App';

/**
 * 1. Inject Menu Items into the Core Sidebar
 */
addFilter( 'sahajanandErp.sidebarMenuItems', 'gurukul-addon/sidebar', ( items ) => {
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
addFilter( 'sahajanandErp.routes', 'gurukul-addon/routes', ( routes ) => {
	return [
		...routes,
		{ path: "/donations", element: <DonationsApp /> },
		{ path: "/food-pass", element: <FoodPassApp /> },
		{ path: "/content", element: <ContentApp /> },
	];
} );
