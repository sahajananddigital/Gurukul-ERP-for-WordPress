/**
 * Accounts List Component
 */
import { useState, useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Flex, Spinner } from '@wordpress/components';
import { DataViews } from '@wordpress/dataviews';

const AccountsList = ( { accounts, loading } ) => {
	const [ view, setView ] = useState( {
		type: 'table',
		perPage: 20,
		page: 1,
		sort: {
			field: 'code',
			direction: 'asc',
		},
		search: '',
		filters: [],
		fields: [ 'code', 'name', 'type', 'balance' ],
	} );

	const fields = useMemo(
		() => [
			{
				id: 'code',
				header: __( 'Code', 'wp-erp' ),
				getValue: ( { item } ) => item.code || '-',
				enableSorting: true,
			},
			{
				id: 'name',
				header: __( 'Name', 'wp-erp' ),
				getValue: ( { item } ) => item.name || '-',
				enableSorting: true,
			},
			{
				id: 'type',
				header: __( 'Type', 'wp-erp' ),
				getValue: ( { item } ) => item.type || '-',
				enableSorting: true,
			},
			{
				id: 'balance',
				header: __( 'Balance', 'wp-erp' ),
				getValue: ( { item } ) =>
					item.balance !== undefined && item.balance !== null
						? item.balance
						: '-',
				enableSorting: true,
			},
		],
		[]
	);

	const defaultLayouts = useMemo(
		() => ( {
			table: {
				layout: {
					primaryField: 'code',
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

	if ( ! accounts || accounts.length === 0 ) {
		return (
			<p
				style={ {
					padding: '16px',
					textAlign: 'center',
					color: '#757575',
				} }
			>
				{ __( 'No accounts found.', 'wp-erp' ) }
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
				data={ accounts }
				fields={ fields }
				actions={ [] }
				view={ view }
				onChangeView={ setView }
				defaultLayouts={ defaultLayouts }
				paginationInfo={ {
					totalItems: accounts.length,
					totalPages: Math.ceil( accounts.length / view.perPage ),
				} }
			/>
		</div>
	);
};

export default AccountsList;
