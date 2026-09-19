import { Flex, FlexItem } from '@wordpress/components';
import Sidebar from './Sidebar';

const Layout = ( { children } ) => {
	return (
		<Flex
			align="flex-start"
			justify="flex-start"
			style={ { height: '100vh', width: '100%', overflow: 'hidden' } }
		>
			<FlexItem style={ { flexBasis: '280px', flexShrink: 0, height: '100vh', display: 'flex', flexDirection: 'column' } }>
				<Sidebar />
			</FlexItem>
			
			<FlexItem style={ { flexGrow: 1, height: '100vh', backgroundColor: '#f0f0f1', overflowY: 'auto' } }>
				<div style={ { padding: '32px', maxWidth: '1200px', margin: '0 auto' } }>
					{ children }
				</div>
			</FlexItem>
		</Flex>
	);
};

export default Layout;
