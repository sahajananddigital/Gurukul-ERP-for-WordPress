import { useState, useEffect } from '@wordpress/element';
import { Flex, FlexItem } from '@wordpress/components';
import Sidebar from './Sidebar';

const STORAGE_KEY = 'sahajanandErpSidebarCollapsed';

const Layout = ( { children } ) => {
	const [ isCollapsed, setIsCollapsed ] = useState( () => {
		try {
			return window.localStorage.getItem( STORAGE_KEY ) === '1';
		} catch {
			return false;
		}
	} );

	useEffect( () => {
		try {
			window.localStorage.setItem( STORAGE_KEY, isCollapsed ? '1' : '0' );
		} catch {
			// Ignore storage errors (e.g. disabled localStorage).
		}
	}, [ isCollapsed ] );

	return (
		<Flex
			align="flex-start"
			justify="flex-start"
			style={ {
				height: '100vh',
				width: '100%',
				overflow: 'hidden',
				backgroundColor: '#1d2327',
			} }
		>
			<FlexItem
				style={ {
					flexBasis: isCollapsed ? '64px' : '280px',
					flexShrink: 0,
					height: '100vh',
					display: 'flex',
					flexDirection: 'column',
					transition: 'flex-basis 0.15s ease',
				} }
			>
				<Sidebar
					isCollapsed={ isCollapsed }
					onToggleCollapse={ () =>
						setIsCollapsed( ( value ) => ! value )
					}
				/>
			</FlexItem>

			<FlexItem
				style={ {
					flexGrow: 1,
					height: '100vh',
					backgroundColor: '#fff',
					overflowY: 'auto',
					borderTopLeftRadius: '16px',
					borderLeft: '1px solid #333',
					borderTop: '1px solid #333',
				} }
			>
				<div style={ { padding: 0 } }>{ children }</div>
			</FlexItem>
		</Flex>
	);
};

export default Layout;
