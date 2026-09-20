import { Flex, FlexItem } from '@wordpress/components';
import Sidebar from './Sidebar';

const Layout = ( { children } ) => {
	return (
		<Flex
			align="flex-start"
			justify="flex-start"
			style={ { height: '100vh', width: '100%', overflow: 'hidden', backgroundColor: '#1d2327' } }
		>
			<FlexItem style={ { flexBasis: '280px', flexShrink: 0, height: '100vh', display: 'flex', flexDirection: 'column' } }>
				<Sidebar />
			</FlexItem>
			
			<FlexItem style={ { 
				flexGrow: 1, 
				height: '100vh', 
				backgroundColor: '#fff', 
				overflowY: 'auto',
				borderTopLeftRadius: '16px',
				borderLeft: '1px solid #333',
				borderTop: '1px solid #333'
			} }>
				<div style={ { padding: 0 } }>
					{ children }
				</div>
			</FlexItem>
		</Flex>
	);
};

export default Layout;
