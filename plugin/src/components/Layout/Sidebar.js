import { Button, Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import {
	NavigatorProvider,
	NavigatorScreen,
	NavigatorButton,
	NavigatorBackButton,
} from '../wp-compat';
import {
	wordpress,
	home,
	desktop,
	institution,
	people,
	lifesaver,
	update,
	plugins,
	cog,
	chevronRight,
	chevronLeft,
} from '@wordpress/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { applyFilters } from '@wordpress/hooks';

const Sidebar = ( { isCollapsed = false, onToggleCollapse } ) => {
	const navigate = useNavigate();
	const location = useLocation();

	const coreMenuItems = [
		{ name: 'Dashboard', path: '/dashboard', icon: home },
		{ name: 'CRM', path: '/crm', icon: desktop },
		{ name: 'Accounting', path: '/accounting', icon: institution },
		{ name: 'HR', path: '/hr', icon: people },
		{ name: 'Helpdesk', path: '/helpdesk', icon: lifesaver },
	];

	// Allow Premium Addons to inject their own menu items into the sidebar.
	const menuItems = applyFilters(
		'sahajanandErp.sidebarMenuItems',
		coreMenuItems
	);

	const renderButton = ( item ) => {
		const isActive = location.pathname.startsWith( item.path );
		return (
			<Button
				key={ item.path }
				variant="tertiary"
				label={ isCollapsed ? item.name : undefined }
				showTooltip={ isCollapsed }
				style={ {
					display: 'flex',
					justifyContent: isCollapsed ? 'center' : 'flex-start',
					width: '100%',
					padding: isCollapsed ? '8px' : '8px 16px',
					color: isActive ? '#fff' : '#c3c4c7',
					backgroundColor: isActive ? '#2271b1' : 'transparent',
					borderRadius: '4px',
					marginBottom: '4px',
				} }
				onClick={ () => navigate( item.path ) }
			>
				<Icon
					icon={ item.icon }
					style={ isCollapsed ? undefined : { marginRight: '12px' } }
				/>
				{ ! isCollapsed && item.name }
			</Button>
		);
	};

	return (
		<div
			style={ {
				backgroundColor: '#1d2327',
				color: '#fff',
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
			} }
		>
			{ /* Header - Back to WP Admin + collapse toggle */ }
			<div
				style={ {
					padding: isCollapsed ? '16px 8px' : '24px 16px',
					borderBottom: '1px solid #2c3338',
					flexShrink: 0,
					display: 'flex',
					alignItems: 'center',
					justifyContent: isCollapsed ? 'center' : 'space-between',
					gap: '8px',
				} }
			>
				{ ! isCollapsed && (
					<a
						href={ window.sahajanandErp?.adminUrl || '/wp-admin/' }
						style={ {
							color: '#fff',
							textDecoration: 'none',
							display: 'flex',
							alignItems: 'center',
							fontSize: '14px',
						} }
					>
						<Icon
							icon={ wordpress }
							// style={ { marginRight: '8px', fill: '#fff' } }
						/>
						Back to WP Admin
					</a>
				) }

				<Button
					variant="tertiary"
					icon={ isCollapsed ? chevronRight : chevronLeft }
					label={
						isCollapsed
							? __( 'Expand sidebar', 'sahajanand-erp' )
							: __( 'Collapse sidebar', 'sahajanand-erp' )
					}
					showTooltip
					onClick={ onToggleCollapse }
					style={ { color: '#fff', flexShrink: 0 } }
				/>
			</div>

			{ /* Main Navigation (SCROLLABLE & WRAPPED IN NAVIGATOR) */ }
			<div
				style={ {
					flexGrow: 1,
					overflowY: 'auto',
					overflowX: 'hidden',
					display: 'flex',
					flexDirection: 'column',
				} }
			>
				<NavigatorProvider initialPath="/">
					{ /* ROOT SCREEN */ }
					<NavigatorScreen path="/">
						<div
							style={ {
								padding: '16px 8px',
								display: 'flex',
								flexDirection: 'column',
								height: '100%',
							} }
						>
							{ ! isCollapsed && (
								<div
									style={ {
										padding: '0 8px',
										marginBottom: '16px',
										fontSize: '11px',
										textTransform: 'uppercase',
										color: '#8c8f94',
										fontWeight: 600,
									} }
								>
									Sahajanand ERP
								</div>
							) }

							{ menuItems.map( renderButton ) }

							<div
								style={ {
									marginTop: 'auto',
									borderTop: '1px solid #2c3338',
									paddingTop: '16px',
								} }
							>
								{ renderButton( {
									name: 'Add-ons',
									path: '/addons',
									icon: plugins,
								} ) }

								<NavigatorButton
									path="/settings"
									variant="tertiary"
									label={
										isCollapsed
											? __( 'Settings', 'sahajanand-erp' )
											: undefined
									}
									showTooltip={ isCollapsed }
									style={ {
										display: 'flex',
										justifyContent: isCollapsed
											? 'center'
											: 'space-between',
										width: '100%',
										padding: isCollapsed
											? '8px'
											: '8px 16px',
										color: '#c3c4c7',
										borderRadius: '4px',
										marginBottom: '4px',
									} }
								>
									<span
										style={ {
											display: 'flex',
											alignItems: 'center',
										} }
									>
										<Icon
											icon={ cog }
											style={
												isCollapsed
													? undefined
													: { marginRight: '12px' }
											}
										/>
										{ ! isCollapsed &&
											__( 'Settings', 'sahajanand-erp' ) }
									</span>
									{ ! isCollapsed && (
										<Icon icon={ chevronRight } />
									) }
								</NavigatorButton>
							</div>
						</div>
					</NavigatorScreen>

					{ /* SETTINGS SUB-MENU SCREEN */ }
					<NavigatorScreen path="/settings">
						<div
							style={ {
								padding: '16px 8px',
								display: 'flex',
								flexDirection: 'column',
								height: '100%',
							} }
						>
							<NavigatorBackButton
								variant="tertiary"
								label={
									isCollapsed
										? __( 'Back', 'sahajanand-erp' )
										: undefined
								}
								showTooltip={ isCollapsed }
								style={ {
									display: 'flex',
									justifyContent: isCollapsed
										? 'center'
										: 'flex-start',
									width: '100%',
									padding: isCollapsed ? '8px' : '8px',
									color: '#fff',
									marginBottom: '16px',
								} }
							>
								<Icon
									icon={ chevronLeft }
									style={
										isCollapsed
											? undefined
											: { marginRight: '8px' }
									}
								/>
								{ ! isCollapsed &&
									__( 'Back', 'sahajanand-erp' ) }
							</NavigatorBackButton>

							{ ! isCollapsed && (
								<div
									style={ {
										padding: '0 8px',
										marginBottom: '16px',
										fontSize: '14px',
										color: '#fff',
										fontWeight: 600,
									} }
								>
									{ __( 'Settings', 'sahajanand-erp' ) }
								</div>
							) }

							{ renderButton( {
								name: __( 'General', 'sahajanand-erp' ),
								path: '/settings/general',
								icon: cog,
							} ) }
							{ renderButton( {
								name: __( 'User Access', 'sahajanand-erp' ),
								path: '/settings/user-access',
								icon: update,
							} ) }
						</div>
					</NavigatorScreen>
				</NavigatorProvider>
			</div>
		</div>
	);
};

export default Sidebar;
