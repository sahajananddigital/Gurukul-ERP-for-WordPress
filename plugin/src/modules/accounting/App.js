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
		<div className="wp-erp-accounting" style={ { padding: '16px' } }>
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
						{ __( 'Accounting', 'wp-erp' ) }
					</h2>
				</CardHeader>
				<CardBody>
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
				</CardBody>
			</Card>
		</div>
	);
};

export default AccountingApp;
