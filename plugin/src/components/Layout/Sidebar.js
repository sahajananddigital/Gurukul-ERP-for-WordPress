import { Button, Icon, __experimentalNavigatorProvider as NavigatorProvider, __experimentalNavigatorScreen as NavigatorScreen, __experimentalNavigatorButton as NavigatorButton, __experimentalNavigatorBackButton as NavigatorBackButton } from '@wordpress/components';
import { wordpress, home, chartBar, desktop, currencyDollar, institution, update, calendar, plugins, cog, chevronRight, chevronLeft } from '@wordpress/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { applyFilters } from '@wordpress/hooks';

const Sidebar = () => {
	const navigate = useNavigate();
	const location = useLocation();

	const coreMenuItems = [
		{ name: 'Dashboard', path: '/dashboard', icon: home },
		{ name: 'CRM', path: '/crm', icon: desktop },
		{ name: 'Accounting', path: '/accounting', icon: institution },
		{ name: 'HR', path: '/hr', icon: update },
		{ name: 'Helpdesk', path: '/helpdesk', icon: update },
	];

	// Allow Premium Addons to inject their own menu items into the sidebar
	const menuItems = applyFilters( 'wpErp.sidebarMenuItems', coreMenuItems );

	const renderButton = ( item ) => {
		const isActive = location.pathname.startsWith( item.path );
		return (
			<Button
				key={ item.path }
				variant="tertiary"
				style={ { 
					display: 'flex', 
					justifyContent: 'flex-start',
					width: '100%', 
					padding: '8px 16px',
					color: isActive ? '#fff' : '#c3c4c7',
					backgroundColor: isActive ? '#2271b1' : 'transparent',
					borderRadius: '4px',
					marginBottom: '4px'
				} }
				onClick={ () => navigate( item.path ) }
			>
				<Icon icon={ item.icon } style={ { marginRight: '12px' } } />
				{ item.name }
			</Button>
		);
	};

	return (
		<div style={ { 
			backgroundColor: '#1d2327', 
			color: '#fff', 
			height: '100%', 
			display: 'flex', 
			flexDirection: 'column' 
		} }>
			{ /* Header - Back to WP Admin (FIXED) */ }
			<div style={ { padding: '24px 16px', borderBottom: '1px solid #2c3338', flexShrink: 0 } }>
				<a 
					href={ window.wpErp?.adminUrl || '/wp-admin/' } 
					style={ { 
						color: '#fff', 
						textDecoration: 'none', 
						display: 'flex', 
						alignItems: 'center',
						fontSize: '14px'
					} }
				>
					<Icon icon={ wordpress } style={ { marginRight: '8px', fill: '#fff' } } />
					Back to WP Admin
				</a>
			</div>

			{ /* Main Navigation (SCROLLABLE & WRAPPED IN NAVIGATOR) */ }
			<div style={ { flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' } }>
				<NavigatorProvider initialPath="/">
					
					{ /* ROOT SCREEN */ }
					<NavigatorScreen path="/">
						<div style={ { padding: '16px 8px', display: 'flex', flexDirection: 'column', height: '100%' } }>
							<div style={ { padding: '0 8px', marginBottom: '16px', fontSize: '11px', textTransform: 'uppercase', color: '#8c8f94', fontWeight: 600 } }>
								Sahajanand ERP
							</div>
							
							{ menuItems.map( renderButton ) }
							
							<div style={ { marginTop: 'auto', borderTop: '1px solid #2c3338', paddingTop: '16px' } }>
								{ renderButton( { name: 'Add-ons', path: '/addons', icon: plugins } ) }
								
								<NavigatorButton
									path="/settings"
									variant="tertiary"
									style={ { 
										display: 'flex', 
										justifyContent: 'space-between',
										width: '100%', 
										padding: '8px 16px',
										color: '#c3c4c7',
										borderRadius: '4px',
										marginBottom: '4px'
									} }
								>
									<span style={{ display: 'flex', alignItems: 'center' }}>
										<Icon icon={ cog } style={ { marginRight: '12px' } } />
										Settings
									</span>
									<Icon icon={ chevronRight } />
								</NavigatorButton>
							</div>
						</div>
					</NavigatorScreen>

					{ /* SETTINGS SUB-MENU SCREEN */ }
					<NavigatorScreen path="/settings">
						<div style={ { padding: '16px 8px', display: 'flex', flexDirection: 'column', height: '100%' } }>
							<NavigatorBackButton
								variant="tertiary"
								style={ { 
									display: 'flex', 
									justifyContent: 'flex-start',
									width: '100%', 
									padding: '8px 8px',
									color: '#fff',
									marginBottom: '16px'
								} }
							>
								<Icon icon={ chevronLeft } style={ { marginRight: '8px' } } />
								Back
							</NavigatorBackButton>

							<div style={ { padding: '0 8px', marginBottom: '16px', fontSize: '14px', color: '#fff', fontWeight: 600 } }>
								Settings
							</div>

							{ renderButton( { name: 'General', path: '/settings/general', icon: cog } ) }
							{ renderButton( { name: 'User Access', path: '/settings/user-access', icon: update } ) }
						</div>
					</NavigatorScreen>

				</NavigatorProvider>
			</div>
		</div>
	);
};

export default Sidebar;
