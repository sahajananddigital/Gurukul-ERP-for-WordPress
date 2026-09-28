import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Flex, Spinner } from '@wordpress/components';
import { Grid, Heading, Text, VStack } from '../../../components/wp-compat';
import apiFetch from '@wordpress/api-fetch';
import { DashboardWidget } from './DashboardWidget';

const ModuleSummary = () => {
	const [ summary, setSummary ] = useState( null );
	const [ isLoading, setIsLoading ] = useState( true );

	useEffect( () => {
		apiFetch( { path: '/sahajanand-erp/v1/dashboard/summary' } )
			.then( ( data ) => setSummary( data ) )
			.catch( () => setSummary( null ) )
			.finally( () => setIsLoading( false ) );
	}, [] );

	const money = ( value ) =>
		new Intl.NumberFormat( undefined, {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		} ).format( Number( value ) || 0 );

	const count = ( value ) =>
		new Intl.NumberFormat().format( Number( value ) || 0 );

	if ( isLoading ) {
		return (
			<DashboardWidget
				title={ __( 'Income & Expenses', 'sahajanand-erp' ) }
			>
				<Flex justify="center" style={ { padding: '20px' } }>
					<Spinner />
				</Flex>
			</DashboardWidget>
		);
	}

	if ( ! summary ) {
		return null;
	}

	const finance = [
		{
			label: __( 'Income', 'sahajanand-erp' ),
			value: summary.finance.income_total,
		},
		{
			label: __( 'Expenses', 'sahajanand-erp' ),
			value: summary.finance.expense_total,
		},
		{
			label: __( 'Net', 'sahajanand-erp' ),
			value: summary.finance.net_total,
		},
	];

	const modules = [
		{
			label: __( 'CRM', 'sahajanand-erp' ),
			details: `${ count( summary.crm.contacts ) } ${ __( 'contacts', 'sahajanand-erp' ) } · ${ count( summary.crm.leads ) } ${ __( 'leads', 'sahajanand-erp' ) } · ${ count( summary.crm.deals ) } ${ __( 'deals', 'sahajanand-erp' ) } (${ money( summary.crm.deals_value ) })`,
		},
		{
			label: __( 'Accounting', 'sahajanand-erp' ),
			details: `${ count( summary.accounting.accounts ) } ${ __( 'accounts', 'sahajanand-erp' ) } · ${ count( summary.accounting.transactions ) } ${ __( 'transactions', 'sahajanand-erp' ) }`,
		},
		{
			label: __( 'Invoices', 'sahajanand-erp' ),
			details: `${ count( summary.invoices.count ) } ${ __( 'invoices', 'sahajanand-erp' ) } · ${ money( summary.invoices.total ) } ${ __( 'invoiced', 'sahajanand-erp' ) }`,
		},
		{
			label: __( 'Expenses', 'sahajanand-erp' ),
			details: `${ count( summary.expenses.count ) } ${ __( 'expenses', 'sahajanand-erp' ) } · ${ money( summary.expenses.total ) } ${ __( 'spent', 'sahajanand-erp' ) }`,
		},
		{
			label: __( 'Vouchers', 'sahajanand-erp' ),
			details: `${ count( summary.vouchers.count ) } ${ __( 'vouchers', 'sahajanand-erp' ) } · ${ money( summary.vouchers.total ) }`,
		},
		{
			label: __( 'HR', 'sahajanand-erp' ),
			details: `${ count( summary.hr.employees ) } ${ __( 'employees', 'sahajanand-erp' ) } (${ count( summary.hr.active_employees ) } ${ __( 'active', 'sahajanand-erp' ) }) · ${ count( summary.hr.pending_leaves ) } ${ __( 'pending leaves', 'sahajanand-erp' ) }`,
		},
		{
			label: __( 'Helpdesk', 'sahajanand-erp' ),
			details: `${ count( summary.helpdesk.tickets ) } ${ __( 'tickets', 'sahajanand-erp' ) } · ${ count( summary.helpdesk.unassigned ) } ${ __( 'unassigned', 'sahajanand-erp' ) } · ${ count( summary.helpdesk.mailboxes ) } ${ __( 'mailboxes', 'sahajanand-erp' ) }`,
		},
	];

	return (
		<DashboardWidget title={ __( 'Income & Expenses', 'sahajanand-erp' ) }>
			<VStack spacing={ 5 }>
				<Grid columns={ 3 } gap={ 4 }>
					{ finance.map( ( item ) => (
						<VStack key={ item.label } spacing={ 1 }>
							<Text variant="muted">{ item.label }</Text>
							<Heading level={ 3 }>
								{ money( item.value ) }
							</Heading>
						</VStack>
					) ) }
				</Grid>

				<VStack spacing={ 3 }>
					{ modules.map( ( module ) => (
						<VStack key={ module.label } spacing={ 0 }>
							<Text weight={ 600 }>{ module.label }</Text>
							<Text variant="muted" size="12px">
								{ module.details }
							</Text>
						</VStack>
					) ) }
				</VStack>
			</VStack>
		</DashboardWidget>
	);
};

export default ModuleSummary;
