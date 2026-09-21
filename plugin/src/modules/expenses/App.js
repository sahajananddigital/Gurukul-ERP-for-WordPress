/**
 * Expenses Module App
 */
import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	Notice,
	TabPanel,
} from '@wordpress/components';
import { fetchExpenses as fetchExpensesApi } from './services/api';
import ExpensesList from './components/ExpensesList';

const ExpensesApp = ( { view = 'list' } ) => {
	const [ expenses, setExpenses ] = useState( [] );
	const [ loading, setLoading ] = useState( true );
	const [ error, setError ] = useState( null );
	const [ activeTab, setActiveTab ] = useState( 'list' );

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

			<div>
				<TabPanel
						className="sahajanand-erp-expenses-tabs"
						activeClass="is-active"
						initialTabName={ activeTab }
						onSelect={ ( tabName ) => setActiveTab( tabName ) }
						tabs={ [
							{
								name: 'list',
								title: __( 'All Expenses', 'sahajanand-erp' ),
								className: 'tab-list',
							}
						] }
					>
						{ ( tab ) => {
							if ( tab.name === 'list' ) {
								return (
									<ExpensesList
										expenses={ expenses }
										loading={ loading }
										onExpenseUpdated={ loadData }
									/>
								);
							}
							return null;
						} }
					</TabPanel>
			</div>
		</div>
	);
};

export default ExpensesApp;
