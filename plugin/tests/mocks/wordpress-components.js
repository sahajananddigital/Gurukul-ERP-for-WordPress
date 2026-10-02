const React = require( 'react' );

const passthrough =
	( tag = 'div' ) =>
	( { children, ...props } ) =>
		React.createElement( tag, props, children );

module.exports = {
	Button: ( { children, onClick, disabled, label, ...props } ) =>
		React.createElement(
			'button',
			{
				type: 'button',
				onClick,
				disabled,
				'aria-label': label || props[ 'aria-label' ],
				title: label,
				...props,
			},
			children || label
		),
	Spinner: () =>
		React.createElement( 'div', { 'data-testid': 'spinner' }, 'Loading' ),
	Notice: ( { children, status } ) =>
		React.createElement(
			'div',
			{ role: 'alert', 'data-status': status },
			children
		),
	Flex: passthrough( 'div' ),
	Card: passthrough( 'div' ),
	CardBody: passthrough( 'div' ),
	CardHeader: passthrough( 'div' ),
	CardFooter: passthrough( 'div' ),
	TabPanel: ( { tabs = [], children, onSelect } ) =>
		React.createElement(
			'div',
			null,
			tabs.map( ( tab ) =>
				React.createElement(
					'button',
					{
						key: tab.name,
						type: 'button',
						onClick: () => onSelect && onSelect( tab.name ),
					},
					tab.title
				)
			),
			typeof children === 'function'
				? children( tabs[ 0 ] || {} )
				: children
		),
	SelectControl: ( { label, value, options = [], onChange } ) =>
		React.createElement(
			'label',
			null,
			label,
			React.createElement(
				'select',
				{
					'aria-label': label,
					value,
					onChange: ( e ) => onChange && onChange( e.target.value ),
				},
				options.map( ( opt ) =>
					React.createElement(
						'option',
						{ key: String( opt.value ), value: opt.value },
						opt.label
					)
				)
			)
		),
	Modal: ( { title, children, onRequestClose } ) =>
		React.createElement(
			'div',
			{ role: 'dialog', 'aria-label': title },
			React.createElement( 'h2', null, title ),
			children,
			React.createElement(
				'button',
				{ type: 'button', onClick: onRequestClose },
				'Close'
			)
		),
	MenuItem: ( { children, onClick } ) =>
		React.createElement( 'button', { type: 'button', onClick }, children ),
	ExternalLink: ( { children, href } ) =>
		React.createElement( 'a', { href }, children ),
	SnackbarList: () => null,
	Text: passthrough( 'span' ),
	Heading: ( { children, level = 2 } ) =>
		React.createElement( `h${ level }`, null, children ),
	VStack: passthrough( 'div' ),
	Grid: passthrough( 'div' ),
	ConfirmDialog: ( {
		children,
		onConfirm,
		onCancel,
		isOpen,
		confirmButtonText,
		cancelButtonText,
	} ) =>
		isOpen
			? React.createElement(
					'div',
					{ role: 'alertdialog' },
					children,
					React.createElement(
						'button',
						{ type: 'button', onClick: onConfirm },
						confirmButtonText || 'Confirm'
					),
					React.createElement(
						'button',
						{ type: 'button', onClick: onCancel },
						cancelButtonText || 'Cancel'
					)
				)
			: null,
	__experimentalText: passthrough( 'span' ),
	__experimentalHeading: ( { children, level = 2 } ) =>
		React.createElement( `h${ level }`, null, children ),
	__experimentalVStack: passthrough( 'div' ),
	__experimentalGrid: passthrough( 'div' ),
	__experimentalConfirmDialog: ( props ) =>
		module.exports.ConfirmDialog( props ),
};
