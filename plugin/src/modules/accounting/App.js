/**
 * Accounting Module App
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
import {
	fetchAccounts as fetchAccountsApi,
	fetchTransactions as fetchTransactionsApi,
} from './services/api';
import AccountsList from './components/AccountsList';
import TransactionsList from './components/TransactionsList';
import CreateTransaction from './components/CreateTransaction';
import InvoicesApp from '../invoices/App';
import ExpensesApp from '../expenses/App';
import VouchersApp from '../vouchers/App';

const AccountingApp = ( { view = 'accounts' } ) => {
	const [ accounts, setAccounts ] = useState( [] );
	const [ transactions, setTransactions ] = useState( [] );
	const [ loading, setLoading ] = useState( true );
	const [ error, setError ] = useState( null );
	const [ activeTab, setActiveTab ] = useState(
		view === 'transactions' ? 'transactions' : 'accounts'
	);

	useEffect( () => {
		if ( activeTab === 'accounts' ) {
			loadAccounts();
		} else {
			loadTransactions();
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

	const handleTransactionCreated = () => {
		// Switch to transactions tab or just reload data?
		// Original app switched: setActiveTab( 'transactions' );
		// Let's do that.
		if ( activeTab !== 'transactions' ) {
			setActiveTab( 'transactions' );
		} else {
			loadTransactions();
		}
	};

	return (
		<div className="wp-erp-accounting">
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
					{ __( 'Accounting', 'wp-erp' ) }
				</h1>
			</div>
			<div style={{ padding: '0 40px' }}>
				<TabPanel
						className="wp-erp-accounting-tabs"
						activeClass="is-active"
						initialTabName={ activeTab }
						onSelect={ ( tabName ) => setActiveTab( tabName ) }
						tabs={ [
							{
								name: 'accounts',
								title: __( 'Chart of Accounts', 'wp-erp' ),
								className: 'tab-accounts',
							},
							{
								name: 'transactions',
								title: __( 'Transactions', 'wp-erp' ),
								className: 'tab-transactions',
							},
							{
								name: 'create',
								title: __( 'Create Transaction', 'wp-erp' ),
								className: 'tab-create',
							},
							{
								name: 'invoices',
								title: __( 'Invoices', 'wp-erp' ),
								className: 'tab-invoices',
							},
							{
								name: 'expenses',
								title: __( 'Expenses', 'wp-erp' ),
								className: 'tab-expenses',
							},
							{
								name: 'vouchers',
								title: __( 'Vouchers', 'wp-erp' ),
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
									/>
								);
							} else if ( tab.name === 'transactions' ) {
								return (
									<TransactionsList
										transactions={ transactions }
										loading={ loading }
									/>
								);
							} else if ( tab.name === 'invoices' ) {
								return <InvoicesApp />;
							} else if ( tab.name === 'expenses' ) {
								return <ExpensesApp />;
							} else if ( tab.name === 'vouchers' ) {
								return <VouchersApp />;
							}
							return (
								<CreateTransaction
									onTransactionCreated={
										handleTransactionCreated
									}
								/>
							);
						} }
					</TabPanel>
			</div>
		</div>
	);
};

export default AccountingApp;
