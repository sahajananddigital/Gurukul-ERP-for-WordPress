/**
 * Expenses List Component
 */
import { useState, useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Flex, Spinner } from '@wordpress/components';
import { DataViews } from '@wordpress/dataviews';
import { getStatusColor } from '../utils';

const ExpensesList = ( { expenses, loading } ) => {
	const [ view, setView ] = useState( {
		type: 'table',
		perPage: 20,
		page: 1,
		sort: {
			field: 'date',
			direction: 'desc',
		},
		search: '',
		filters: [],
		fields: [ 'date', 'category', 'amount', 'description', 'status' ],
	} );

	const fields = useMemo(
		() => [
			{
				id: 'date',
				header: __( 'Date', 'wp-erp' ),
				getValue: ( { item } ) => item.date || '-',
				enableSorting: true,
			},
			{
				id: 'category',
				header: __( 'Category', 'wp-erp' ),
				getValue: ( { item } ) => item.category || '-',
				enableSorting: true,
			},
			{
				id: 'amount',
				header: __( 'Amount', 'wp-erp' ),
				getValue: ( { item } ) =>
					item.amount !== undefined && item.amount !== null
						? item.amount
						: '-',
				enableSorting: true,
			},
			{
				id: 'description',
				header: __( 'Description', 'wp-erp' ),
				getValue: ( { item } ) =>
					item.description || item.expense_no || '-',
				enableSorting: true,
			},
			{
				id: 'status',
				header: __( 'Status', 'wp-erp' ),
				getValue: ( { item } ) => item.status,
				render: ( { item } ) => (
					<span
						style={ {
							padding: '4px 8px',
							borderRadius: '2px',
							backgroundColor: getStatusColor( item.status ),
							color: '#fff',
							fontSize: '12px',
							textTransform: 'capitalize',
						} }
					>
						{ item.status }
					</span>
				),
				enableSorting: true,
			},
		],
		[]
	);

	const defaultLayouts = useMemo(
		() => ( {
			table: {
				layout: {
					primaryField: 'date',
				},
			},
		} ),
		[]
	);

	if ( loading ) {
		return (
			<Flex justify="center" style={ { padding: '32px' } }>
				<Spinner />
			</Flex>
		);
	}

	if ( ! expenses || expenses.length === 0 ) {
		return (
			<p
				style={ {
					padding: '16px',
					textAlign: 'center',
					color: '#757575',
				} }
			>
				{ __( 'No expenses found.', 'wp-erp' ) }
			</p>
		);
	}

	return (
		<div
			style={ {
				backgroundColor: '#fff',
				border: '1px solid #e0e0e0',
				borderRadius: '4px',
			} }
		>
			<DataViews
				data={ expenses }
				fields={ fields }
				actions={ [] }
				view={ view }
				onChangeView={ setView }
				defaultLayouts={ defaultLayouts }
				paginationInfo={ {
					totalItems: expenses.length,
					totalPages: Math.ceil( expenses.length / view.perPage ),
				} }
			/>
		</div>
	);
};

export default ExpensesList;
