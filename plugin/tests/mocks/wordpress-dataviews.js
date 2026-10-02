const React = require( 'react' );

const DataViews = ( {
	data = [],
	actions = [],
	onChangeSelection,
	selection = [],
	getItemId = ( item ) => String( item.id ),
} ) =>
	React.createElement(
		'div',
		{ 'data-testid': 'dataviews' },
		data.map( ( item ) => {
			const id = getItemId( item );
			return React.createElement(
				'div',
				{ key: id, 'data-testid': `row-${ id }` },
				React.createElement( 'input', {
					type: 'checkbox',
					checked: selection.includes( id ),
					onChange: () => {
						const next = selection.includes( id )
							? selection.filter( ( s ) => s !== id )
							: [ ...selection, id ];
						onChangeSelection && onChangeSelection( next );
					},
					'aria-label': `Select ${ id }`,
				} ),
				React.createElement(
					'span',
					null,
					item.subject || item.name || item.title || id
				),
				actions
					.filter( ( a ) => ! a.supportsBulk )
					.map( ( action ) =>
						React.createElement(
							'button',
							{
								key: action.id,
								type: 'button',
								onClick: () =>
									action.callback &&
									action.callback( [ item ], {
										onActionPerformed: () => {},
									} ),
							},
							typeof action.label === 'function'
								? action.label( [ item ] )
								: action.label
						)
					)
			);
		} ),
		selection.length > 0 &&
			React.createElement(
				'div',
				{ 'data-testid': 'bulk-footer' },
				actions
					.filter( ( a ) => a.supportsBulk )
					.map( ( action ) =>
						React.createElement(
							'button',
							{
								key: action.id,
								type: 'button',
								onClick: () => {
									const items = data.filter( ( item ) =>
										selection.includes( getItemId( item ) )
									);
									action.callback &&
										action.callback( items, {
											onActionPerformed: () => {},
										} );
								},
							},
							action.label
						)
					)
			)
	);

module.exports = { DataViews };
