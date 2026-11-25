import { useState, useEffect, useMemo, useCallback } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	Flex,
	Spinner,
	Button,
	SnackbarList,
	Notice,
	TabPanel,
} from '@wordpress/components';
import { DataViews } from '@wordpress/dataviews';
import apiFetch from '@wordpress/api-fetch';
import EditModal from '../../../components/EditModal';
import { fetchExpenses as fetchExpensesApi } from '../services/api';

const ExpensesList = ( {
	expenses: propExpenses,
	loading: propLoading,
	onExpenseUpdated,
	view: initialView = 'list',
} ) => {
	const [ localExpenses, setLocalExpenses ] = useState( [] );
	const [ localLoading, setLocalLoading ] = useState(
		propExpenses === undefined
	);
	const [ isEditModalOpen, setIsEditModalOpen ] = useState(
		initialView === 'create'
	);
	const [ editingItem, setEditingItem ] = useState( null );
	const [ snackbars, setSnackbars ] = useState( [] );
	const [ error, setError ] = useState( null );

	const isControlled = propExpenses !== undefined;
	const expenses = isControlled ? propExpenses : localExpenses;
	const loading = isControlled ? propLoading || false : localLoading;

	useEffect( () => {
		if ( ! isControlled ) {
			loadData();
		}
	}, [ isControlled ] );

	useEffect( () => {
		if ( initialView === 'create' ) {
			setIsEditModalOpen( true );
		}
	}, [ initialView ] );

	const loadData = async () => {
		setLocalLoading( true );
		setError( null );
		try {
			const data = await fetchExpensesApi();
			setLocalExpenses( data );
		} catch ( err ) {
			setError( err.message );
		} finally {
			setLocalLoading( false );
		}
	};

	const [ view, setView ] = useState( {
		type: 'table',
		perPage: 20,
		page: 1,
		sort: {
			field: 'id',
			direction: 'desc',
		},
		search: '',
		filters: [],
		fields: [
			'expense_no',
			'date',
			'category',
			'amount',
			'description',
			'status',
		],
	} );

	const addSnackbar = ( message ) => {
		setSnackbars( ( prev ) => [
			...prev,
			{ id: Date.now().toString(), content: message },
		] );
	};

	const removeSnackbar = ( id ) => {
		setSnackbars( ( prev ) => prev.filter( ( s ) => s.id !== id ) );
	};

	const handleAddNew = () => {
		setEditingItem( null );
		setIsEditModalOpen( true );
	};

	const handleEdit = ( item ) => {
		setEditingItem( item );
		setIsEditModalOpen( true );
	};

	const handleDelete = useCallback(
		async ( item ) => {
			/* eslint-disable no-alert */
			const confirmed = window.confirm(
				__(
					'Are you sure you want to delete this expense?',
					'sahajanand-erp'
				)
			);
			/* eslint-enable no-alert */
			if ( confirmed ) {
				try {
					await apiFetch( {
						path: `/sahajanand-erp/v1/expenses/${ item.id }`,
						method: 'DELETE',
					} );
					addSnackbar(
						__( 'Expense deleted successfully.', 'sahajanand-erp' )
					);
					if ( onExpenseUpdated ) {
						onExpenseUpdated();
					}
					if ( ! isControlled ) {
						loadData();
					}
				} catch {
					addSnackbar(
						__( 'Failed to delete expense.', 'sahajanand-erp' )
					);
				}
			}
		},
		[ isControlled, onExpenseUpdated ]
	);

	const handleSave = async ( data ) => {
		try {
			if ( editingItem && editingItem.id ) {
				await apiFetch( {
					path: `/sahajanand-erp/v1/expenses/${ editingItem.id }`,
					method: 'POST',
					data,
				} );
				addSnackbar(
					__( 'Expense updated successfully.', 'sahajanand-erp' )
				);
			} else {
				await apiFetch( {
					path: '/sahajanand-erp/v1/expenses',
					method: 'POST',
					data,
				} );
				addSnackbar(
					__( 'Expense created successfully.', 'sahajanand-erp' )
				);
			}
			setIsEditModalOpen( false );
			if ( onExpenseUpdated ) {
				onExpenseUpdated();
			}
			if ( ! isControlled ) {
				loadData();
			}
		} catch {
			addSnackbar( __( 'Failed to save expense.', 'sahajanand-erp' ) );
		}
	};

	const fields = useMemo(
		() => [
			{
				id: 'expense_no',
				header: __( 'Expense #', 'sahajanand-erp' ),
				getValue: ( { item } ) => item.expense_no || `EXP-${ item.id }`,
				enableSorting: true,
			},
			{
				id: 'date',
				header: __( 'Date', 'sahajanand-erp' ),
				getValue: ( { item } ) => item.date || '-',
				enableSorting: true,
			},
			{
				id: 'category',
				header: __( 'Category', 'sahajanand-erp' ),
				getValue: ( { item } ) => item.category || '-',
				enableSorting: true,
			},
			{
				id: 'amount',
				header: __( 'Amount', 'sahajanand-erp' ),
				getValue: ( { item } ) => item.amount || '-',
				enableSorting: true,
			},
			{
				id: 'description',
				header: __( 'Description', 'sahajanand-erp' ),
				getValue: ( { item } ) => item.description || '-',
				enableSorting: true,
			},
			{
				id: 'status',
				header: __( 'Status', 'sahajanand-erp' ),
				getValue: ( { item } ) => item.status || '-',
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
		[ handleDelete ]
	);

	const defaultLayouts = useMemo(
		() => ( { table: { titleField: 'date' } } ),
		[]
	);

	let content = null;
	if ( loading ) {
		content = (
			<Flex justify="center" style={ { padding: '32px' } }>
				<Spinner />
			</Flex>
		);
	} else if ( expenses.length === 0 ) {
		content = (
			<Notice status="info" isDismissible={ false }>
				{ __( 'No expenses found.', 'sahajanand-erp' ) }
			</Notice>
		);
	} else {
		content = (
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
					actions={ actions }
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
	}

	return (
		<div className="sahajanand-erp-expenses">
			{ error && (
				<Notice
					status="error"
					isDismissible={ false }
					onRemove={ () => setError( null ) }
				>
					{ error }
				</Notice>
			) }

			<TabPanel
				className="sahajanand-erp-expenses-tabs"
				activeClass="is-active"
				initialTabName="list"
				tabs={ [
					{
						name: 'list',
						title: __( 'All Expenses', 'sahajanand-erp' ),
						className: 'tab-list',
					},
				] }
			>
				{ () => (
					<div>
						<Flex
							justify="flex-end"
							style={ { marginBottom: '16px' } }
						>
							<Button variant="primary" onClick={ handleAddNew }>
								{ __( 'Add Expense', 'sahajanand-erp' ) }
							</Button>
						</Flex>

						{ content }
					</div>
				) }
			</TabPanel>

			<EditModal
				title={
					editingItem
						? __( 'Edit Expense', 'sahajanand-erp' )
						: __( 'Add Expense', 'sahajanand-erp' )
				}
				isOpen={ isEditModalOpen }
				onClose={ () => setIsEditModalOpen( false ) }
				onSave={ handleSave }
				data={ editingItem }
				fields={ [
					{ key: 'date', label: 'Date', type: 'date' },
					{
						key: 'expense_type',
						label: 'Expense Type',
						type: 'text',
					},
					{ key: 'category', label: 'Category', type: 'text' },
					{ key: 'amount', label: 'Amount', type: 'number' },
					{
						key: 'description',
						label: 'Description',
						type: 'textarea',
					},
					{
						key: 'status',
						label: 'Status',
						type: 'select',
						options: [
							{ label: 'Pending', value: 'pending' },
							{ label: 'Approved', value: 'approved' },
							{ label: 'Rejected', value: 'rejected' },
						],
					},
				] }
			/>

			<SnackbarList
				notices={ snackbars }
				onRemove={ removeSnackbar }
				style={ {
					position: 'fixed',
					bottom: '20px',
					left: '20px',
					zIndex: 100000,
				} }
			/>
		</div>
	);
};

export default ExpensesList;
