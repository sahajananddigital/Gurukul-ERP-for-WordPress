/**
 * HR Module App
 */
import { useState, useEffect, useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	Card,
	CardBody,
	CardHeader,
	Spinner,
	Notice,
	Flex,
	TabPanel,
} from '@wordpress/components';
import { DataViews } from '@wordpress/dataviews';
import apiFetch from '@wordpress/api-fetch';

const HRApp = ( { view: initialTab = 'employees' } ) => {
	const [ employees, setEmployees ] = useState( [] );
	const [ loading, setLoading ] = useState( true );
	const [ error, setError ] = useState( null );
	const [ activeTab, setActiveTab ] = useState( initialTab );

	const [ view, setView ] = useState( {
		type: 'table',
		perPage: 20,
		page: 1,
		sort: {
			field: 'employee_id',
			direction: 'asc',
		},
		search: '',
		filters: [],
		fields: [
			'employee_id',
			'name',
			'designation',
			'department',
			'status',
		],
	} );

	useEffect( () => {
		if ( activeTab === 'employees' ) {
			fetchEmployees();
		}
	}, [ activeTab ] );

	const fetchEmployees = async () => {
		setLoading( true );
		setError( null );
		try {
			const data = await apiFetch( { path: '/wp-erp/v1/hr/employees' } );
			setEmployees( data );
		} catch ( err ) {
			setError(
				err.message || __( 'Failed to fetch employees', 'wp-erp' )
			);
		} finally {
			setLoading( false );
		}
	};

	const getStatusColor = ( status ) => {
		switch ( status ) {
			case 'active':
				return '#00a32a';
			default:
				return '#757575';
		}
	};

	const fields = useMemo(
		() => [
			{
				id: 'employee_id',
				header: __( 'Employee ID', 'wp-erp' ),
				getValue: ( { item } ) => item.employee_id,
				enableSorting: true,
			},
			{
				id: 'name',
				header: __( 'Name', 'wp-erp' ),
				getValue: ( { item } ) =>
					item.user_id ? `User #${ item.user_id }` : '-',
				enableSorting: true,
			},
			{
				id: 'designation',
				header: __( 'Designation', 'wp-erp' ),
				getValue: ( { item } ) => item.designation || '-',
				enableSorting: true,
			},
			{
				id: 'department',
				header: __( 'Department', 'wp-erp' ),
				getValue: ( { item } ) => item.department || '-',
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
					primaryField: 'employee_id',
				},
			},
		} ),
		[]
	);

	const renderEmployeesList = () => {
		if ( loading ) {
			return (
				<Flex justify="center" style={ { padding: '32px' } }>
					<Spinner />
				</Flex>
			);
		}

		if ( employees.length === 0 ) {
			return (
				<p
					style={ {
						padding: '16px',
						textAlign: 'center',
						color: '#757575',
					} }
				>
					{ __( 'No employees found.', 'wp-erp' ) }
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
					data={ employees }
					fields={ fields }
					actions={ [] }
					view={ view }
					onChangeView={ setView }
					defaultLayouts={ defaultLayouts }
					paginationInfo={ {
						totalItems: employees.length,
						totalPages: Math.ceil(
							employees.length / view.perPage
						),
					} }
				/>
			</div>
		);
	};

	const renderLeaveRequests = () => {
		return (
			<div className="wp-erp-hr">
				<Card>
					<CardHeader>
						<h2 style={ { margin: 0 } }>
							{ __( 'Leave Requests', 'wp-erp' ) }
						</h2>
					</CardHeader>
					<CardBody>
						<p
							style={ {
								padding: '16px',
								textAlign: 'center',
								color: '#757575',
							} }
						>
							{ __( 'Leave management coming soon…', 'wp-erp' ) }
						</p>
					</CardBody>
				</Card>
			</div>
		);
	};

	return (
		<div className="wp-erp-hr">
			{ error && (
				<Notice
					status="error"
					isDismissible={ false }
					onRemove={ () => setError( null ) }
				>
					{ error }
				</Notice>
			) }

			<div style={{ padding: '32px 40px', borderBottom: '1px solid #e0e0e0' }}>
				<h1 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>
					{ __( 'HR Management', 'wp-erp' ) }
				</h1>
			</div>
			<div style={{ padding: '0 40px' }}>
				<TabPanel
						className="wp-erp-hr-tabs"
						activeClass="is-active"
						initialTabName={ activeTab }
						onSelect={ ( tabName ) => setActiveTab( tabName ) }
						tabs={ [
							{
								name: 'employees',
								title: __( 'Employees', 'wp-erp' ),
								className: 'tab-employees',
							},
							{
								name: 'leaves',
								title: __( 'Leave Requests', 'wp-erp' ),
								className: 'tab-leaves',
							},
						] }
					>
						{ ( tab ) => {
							if ( tab.name === 'employees' ) {
								return renderEmployeesList();
							}
							return renderLeaveRequests();
						} }
					</TabPanel>
			</div>
		</div>
	);
};

export default HRApp;
