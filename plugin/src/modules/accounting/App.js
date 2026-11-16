/**
 * Accounting Module App
 * Unified Accounting module containing Chart of Accounts, Transactions, Invoices, Expenses, and Vouchers.
 */
import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Notice, TabPanel } from '@wordpress/components';
import { Heading } from '../../components/wp-compat';
import {
	fetchAccounts as fetchAccountsApi,
	fetchTransactions as fetchTransactionsApi,
	fetchExpenses as fetchExpensesApi,
} from './services/api';
import AccountsList from './components/AccountsList';
import TransactionsList from './components/TransactionsList';
import InvoicesList from './components/InvoicesList';
import ExpensesList from './components/ExpensesList';
import VouchersList from './components/VouchersList';

const AccountingApp = ( { view = 'accounts' } ) => {
	const [ accounts, setAccounts ] = useState( [] );
	const [ transactions, setTransactions ] = useState( [] );
	const [ expenses, setExpenses ] = useState( [] );
	const [ loading, setLoading ] = useState( true );
	const [ error, setError ] = useState( null );
	const [ activeTab, setActiveTab ] = useState( view );

	useEffect( () => {
		if ( activeTab === 'accounts' ) {
			loadAccounts();
		} else if ( activeTab === 'transactions' ) {
			loadTransactions();
		} else if ( activeTab === 'expenses' ) {
			loadExpenses();
		}
	}, [ activeTab ] );

	const loadAccounts = async () => {
		setLoading( true );
		setError( null );
		try {
			const data = await fetchAccountsApi();
			setAccounts( data );
		} catch ( err ) {
			setError( err.message );
		} finally {
			setLoading( false );
		}
	};

	const loadTransactions = async () => {
		setLoading( true );
		setError( null );
		try {
			const data = await fetchTransactionsApi();
			setTransactions( data );
		} catch ( err ) {
			setError( err.message );
		} finally {
			setLoading( false );
		}
	};

	const loadExpenses = async () => {
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
		<div className="sahajanand-erp-accounting">
			{ error && (
				<Notice
					status="error"
					isDismissible={ false }
					onRemove={ () => setError( null ) }
				>
					{ error }
				</Notice>
			) }

			<div
				style={ {
					padding: '32px 40px',
					borderBottom: '1px solid #e0e0e0',
				} }
			>
				<Heading
					level={ 1 }
					style={ { margin: 0, fontSize: '24px', fontWeight: 600 } }
				>
					{ __( 'Accounting', 'sahajanand-erp' ) }
				</Heading>
			</div>
			<div style={ { padding: '0 40px' } }>
				<TabPanel
					className="sahajanand-erp-accounting-tabs"
					activeClass="is-active"
					initialTabName={ activeTab }
					onSelect={ ( tabName ) => setActiveTab( tabName ) }
					tabs={ [
						{
							name: 'accounts',
							title: __( 'Chart of Accounts', 'sahajanand-erp' ),
							className: 'tab-accounts',
						},
						{
							name: 'transactions',
							title: __( 'Transactions', 'sahajanand-erp' ),
							className: 'tab-transactions',
						},
						{
							name: 'invoices',
							title: __( 'Invoices', 'sahajanand-erp' ),
							className: 'tab-invoices',
						},
						{
							name: 'expenses',
							title: __( 'Expenses', 'sahajanand-erp' ),
							className: 'tab-expenses',
						},
						{
							name: 'vouchers',
							title: __( 'Vouchers', 'sahajanand-erp' ),
							className: 'tab-vouchers',
						},
					] }
				>
					{ ( tab ) => {
						if ( tab.name === 'accounts' ) {
							return (
								<AccountsList
									accounts={ accounts }
									loading={ loading }
									onAccountUpdated={ loadAccounts }
								/>
							);
						} else if ( tab.name === 'transactions' ) {
							return (
								<TransactionsList
									transactions={ transactions }
									loading={ loading }
									onTransactionUpdated={ loadTransactions }
								/>
							);
						} else if ( tab.name === 'invoices' ) {
							return <InvoicesList />;
						} else if ( tab.name === 'expenses' ) {
							return (
								<ExpensesList
									expenses={ expenses }
									loading={ loading }
									onExpenseUpdated={ loadExpenses }
								/>
							);
						} else if ( tab.name === 'vouchers' ) {
							return <VouchersList />;
						}
						return null;
					} }
				</TabPanel>
			</div>
		</div>
	);
};

export default AccountingApp;
