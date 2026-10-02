/**
 * Jest setup file
 */
require( '@testing-library/jest-dom' );

Object.defineProperty( window, 'matchMedia', {
	writable: true,
	value: jest.fn().mockImplementation( ( query ) => ( {
		matches: false,
		media: query,
		onchange: null,
		addListener: jest.fn(),
		removeListener: jest.fn(),
		addEventListener: jest.fn(),
		removeEventListener: jest.fn(),
		dispatchEvent: jest.fn(),
	} ) ),
} );

global.wp = {
	data: {
		select: jest.fn( () => ( {
			getUser: jest.fn(),
		} ) ),
	},
	media: undefined,
};

window.sahajanandErp = {
	restUrl: '/wp-json/',
	nonce: 'test-nonce',
	apiUrl: '/wp-json/sahajanand-erp/v1/',
	adminUrl: '/wp-admin/',
};

class ResizeObserverMock {
	observe() {}
	unobserve() {}
	disconnect() {}
}
global.ResizeObserver = global.ResizeObserver || ResizeObserverMock;

const originalError = console.error;
beforeAll( () => {
	console.error = ( ...args ) => {
		const message = String( args[ 0 ] || '' );
		if (
			message.includes( 'Warning: An update to' ) ||
			message.includes( 'not wrapped in act' )
		) {
			return;
		}
		originalError( ...args );
	};
} );
afterAll( () => {
	console.error = originalError;
} );
