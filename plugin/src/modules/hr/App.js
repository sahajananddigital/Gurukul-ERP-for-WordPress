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
	Button,
	SnackbarList,
} from '@wordpress/components';
import { DataViews } from '@wordpress/dataviews';
import apiFetch from '@wordpress/api-fetch';
import EditModal from '../../components/EditModal';

const HRApp = ( { view: initialTab = 'employees' } ) => {
	const [ employees, setEmployees ] = useState( [] );
	const [ loading, setLoading ] = useState( true );
	const [ error, setError ] = useState( null );
	const [ activeTab, setActiveTab ] = useState( initialTab );

	// Edit Modal & Snackbar State
	const [ isEditModalOpen, setIsEditModalOpen ] = useState( false );
	const [ editingEmployee, setEditingEmployee ] = useState( null );
	const [ snackbars, setSnackbars ] = useState( [] );

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

	const addSnackbar = ( message ) => {
		setSnackbars( ( prev ) => [
			...prev,
			{ id: Date.now().toString(), content: message },
		] );
	};

	const removeSnackbar = ( id ) => {
		setSnackbars( ( prev ) => prev.filter( ( s ) => s.id !== id ) );
	};

	const fetchEmployees = async () => {
		setLoading( true );
		setError( null );
		try {
			const data = await apiFetch( { path: '/sahajanand-erp/v1/hr/employees' } );
			setEmployees( data );
		} catch ( err ) {
			setError(
				err.message || __( 'Failed to fetch employees', 'sahajanand-erp' )
			);
		} finally {
			setLoading( false );
		}
	};

	const handleAddNew = () => {
		setEditingEmployee( null );
		setIsEditModalOpen( true );
	};

	const handleEdit = ( item ) => {
		setEditingEmployee( item );
		setIsEditModalOpen( true );
	};

	const handleDelete = async ( item ) => {
		if (
			window.confirm(
				__( 'Are you sure you want to delete this employee?', 'sahajanand-erp' )
			)
		) {
			try {
				await apiFetch( {
					path: `/sahajanand-erp/v1/hr/employees/${ item.id }`,
					method: 'DELETE',
				} );
				addSnackbar( __( 'Employee deleted successfully.', 'sahajanand-erp' ) );
				fetchEmployees();
			} catch ( err ) {
				// eslint-disable-next-line no-console
				console.error( err );
				addSnackbar( __( 'Failed to delete employee.', 'sahajanand-erp' ) );
			}
		}
	};

	const handleSave = async ( data ) => {
		try {
			if ( editingEmployee ) {
				await apiFetch( {
					path: `/sahajanand-erp/v1/hr/employees/${ editingEmployee.id }`,
					method: 'POST',
					data,
				} );
				addSnackbar( __( 'Employee updated successfully.', 'sahajanand-erp' ) );
			} else {
				await apiFetch( {
					path: '/sahajanand-erp/v1/hr/employees',
					method: 'POST',
					data,
				} );
				addSnackbar( __( 'Employee created successfully.', 'sahajanand-erp' ) );
			}
			fetchEmployees();
		} catch ( err ) {
			// eslint-disable-next-line no-console
			console.error( err );
			addSnackbar( __( 'Failed to save employee.', 'sahajanand-erp' ) );
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
				header: __( 'Employee ID', 'sahajanand-erp' ),
				getValue: ( { item } ) => item.employee_id || '-',
				enableSorting: true,
			},
			{
				id: 'name',
				header: __( 'Name', 'sahajanand-erp' ),
				getValue: ( { item } ) =>
					item.first_name ? `${ item.first_name } ${ item.last_name || '' }` : (item.user_id ? `User #${ item.user_id }` : '-'),
				enableSorting: true,
			},
			{
				id: 'designation',
				header: __( 'Designation', 'sahajanand-erp' ),
				getValue: ( { item } ) => item.designation || '-',
				enableSorting: true,
			},
			{
				id: 'department',
				header: __( 'Department', 'sahajanand-erp' ),
				getValue: ( { item } ) => item.department || '-',
				enableSorting: true,
			},
			{
				id: 'status',
				header: __( 'Status', 'sahajanand-erp' ),
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
						{ item.status || 'inactive' }
					</span>
				),
				enableSorting: true,
			},
		],
		[]
	);

	const actions = useMemo(
		() => [
			{
				id: 'edit',
				label: __( 'Edit', 'sahajanand-erp' ),
				isPrimary: true,
				callback: ( items ) => {
					if ( items.length > 0 ) {
						handleEdit( items[ 0 ] );
					}
				},
			},
			{
				id: 'delete',
				label: __( 'Delete', 'sahajanand-erp' ),
				callback: ( items ) => {
					if ( items.length > 0 ) {
						handleDelete( items[ 0 ] );
					}
				},
			},
		],
		[]
	);

	const defaultLayouts = useMemo(
		() => ( {
			table: {
				titleField: 'employee_id',
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

		return (
			<div>
				<Flex justify="flex-end" style={ { marginBottom: '16px' } }>
					<Button variant="primary" onClick={ handleAddNew }>
						{ __( 'Add New Employee', 'sahajanand-erp' ) }
					</Button>
				</Flex>

				{ employees.length === 0 ? (
					<Notice status="info" isDismissible={ false }>
						{ __( 'No employees found.', 'sahajanand-erp' ) }
					</Notice>
				) : (
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
							actions={ actions }
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
				) }
			</div>
		);
	};

	const renderLeaveRequests = () => {
		return (
			<div className="sahajanand-erp-hr">
				<Card>
					<CardHeader>
						<h2 style={ { margin: 0 } }>
							{ __( 'Leave Requests', 'sahajanand-erp' ) }
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
							{ __( 'Leave management coming soon…', 'sahajanand-erp' ) }
						</p>
					</CardBody>
				</Card>
			</div>
		);
	};

	const employeeFields = [
		{ key: 'employee_id', label: __( 'Employee ID', 'sahajanand-erp' ), type: 'text' },
		{ key: 'first_name', label: __( 'First Name', 'sahajanand-erp' ), type: 'text' },
		{ key: 'last_name', label: __( 'Last Name', 'sahajanand-erp' ), type: 'text' },
		{ key: 'designation', label: __( 'Designation', 'sahajanand-erp' ), type: 'text' },
		{ key: 'department', label: __( 'Department', 'sahajanand-erp' ), type: 'text' },
		{
			key: 'status',
			label: __( 'Status', 'sahajanand-erp' ),
			type: 'select',
			options: [
				{ label: 'Active', value: 'active' },
				{ label: 'Inactive', value: 'inactive' },
				{ label: 'On Leave', value: 'leave' },
			],
		},
	];

	return (
		<div className="sahajanand-erp-hr">
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
					{ __( 'HR Management', 'sahajanand-erp' ) }
				</h1>
			</div>
			<div style={{ padding: '0 40px' }}>
				<TabPanel
					className="sahajanand-erp-hr-tabs"
					activeClass="is-active"
					initialTabName={ activeTab }
					onSelect={ ( tabName ) => setActiveTab( tabName ) }
					tabs={ [
						{
							name: 'employees',
							title: __( 'Employees', 'sahajanand-erp' ),
							className: 'tab-employees',
						},
						{
							name: 'leaves',
							title: __( 'Leave Requests', 'sahajanand-erp' ),
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

			<EditModal
				title={ editingEmployee ? __( 'Edit Employee', 'sahajanand-erp' ) : __( 'Add New Employee', 'sahajanand-erp' ) }
				isOpen={ isEditModalOpen }
				onClose={ () => setIsEditModalOpen( false ) }
				onSave={ handleSave }
				data={ editingEmployee }
				fields={ employeeFields }
			/>

			<SnackbarList
				notices={ snackbars }
				onRemove={ removeSnackbar }
				style={{ position: 'fixed', bottom: '20px', left: '20px', zIndex: 100000 }}
			/>
		</div>
	);
};

export default HRApp;
