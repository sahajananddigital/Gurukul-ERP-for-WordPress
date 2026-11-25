const React = require( 'react' );

const DataViews = ( {
	data = [],
	fields = [],
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
			const defaultLabel =
				( item.first_name
					? `${ item.first_name } ${ item.last_name || '' }`.trim()
					: null ) ||
				item.employee_id ||
				item.invoice_no ||
				item.voucher_no ||
				item.expense_no ||
				item.subject ||
				item.name ||
				item.title ||
				id;
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
						if ( onChangeSelection ) {
							onChangeSelection( next );
						}
					},
					'aria-label': `Select ${ id }`,
				} ),
				fields.length > 0
					? fields.map( ( f ) => {
							const text =
								typeof f.getValue === 'function'
									? f.getValue( { item } )
									: item[ f.id ];
							return React.createElement(
								'span',
								{ key: f.id },
								text
							);
					  } )
					: React.createElement( 'span', null, defaultLabel ),
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
									if ( action.callback ) {
										action.callback( items, {
											onActionPerformed: () => {},
										} );
									}
								},
							},
							action.label
						)
					)
			)
	);

module.exports = { DataViews };
