/**
 * Expenses Module App
 */
import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	Card,
	CardBody,
	CardHeader,
	Notice,
	TabPanel,
} from '@wordpress/components';
import { fetchExpenses as fetchExpensesApi } from './services/api';
import ExpensesList from './components/ExpensesList';
import CreateExpense from './components/CreateExpense';

const ExpensesApp = ( { view = 'list' } ) => {
	const [ expenses, setExpenses ] = useState( [] );
	const [ loading, setLoading ] = useState( true );
	const [ error, setError ] = useState( null );
	const [ activeTab, setActiveTab ] = useState(
		view === 'create' ? 'create' : 'list'
	);

	useEffect( () => {
		if ( activeTab === 'list' ) {
			loadData();
		}
	}, [ activeTab ] );

	const loadData = async () => {
		setLoading( true );
		setError( null );
		try {
			const data = await fetchExpensesApi();
			setExpenses( data );
		} catch ( err ) {
			setError( err.message );
		} finally {
			setLoading( false );
		}
	};

	const handleExpenseCreated = () => {
		if ( activeTab !== 'list' ) {
			setActiveTab( 'list' );
		} else {
			loadData();
		}
	};

	return (
		<div className="wp-erp-expenses" style={ { padding: '16px' } }>
			{ error && (
				<Notice
					status="error"
					isDismissible={ false }
					onRemove={ () => setError( null ) }
				>
					{ error }
				</Notice>
			) }

			<Card>
				<CardHeader>
					<h2 style={ { margin: 0 } }>
						{ __( 'Expense Management', 'wp-erp' ) }
					</h2>
				</CardHeader>
				<CardBody>
					<TabPanel
						className="wp-erp-expenses-tabs"
						activeClass="is-active"
						initialTabName={ activeTab }
						onSelect={ ( tabName ) => setActiveTab( tabName ) }
						tabs={ [
							{
								name: 'list',
								title: __( 'All Expenses', 'wp-erp' ),
								className: 'tab-list',
							},
							{
								name: 'create',
								title: __( 'Add Expense', 'wp-erp' ),
								className: 'tab-create',
							},
						] }
					>
						{ ( tab ) => {
							if ( tab.name === 'list' ) {
								return (
									<ExpensesList
										expenses={ expenses }
										loading={ loading }
									/>
								);
							}
							return (
								<CreateExpense
									onExpenseCreated={ handleExpenseCreated }
								/>
							);
						} }
					</TabPanel>
				</CardBody>
			</Card>
		</div>
	);
};

export default ExpensesApp;
