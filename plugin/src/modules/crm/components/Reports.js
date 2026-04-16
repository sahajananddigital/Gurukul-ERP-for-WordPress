/**
 * Reports Component
 */
import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	Card,
	CardBody,
	CardHeader,
	SelectControl,
	TextControl,
	Button,
	Flex,
	FlexItem,
	Spinner,
} from '@wordpress/components';
import { fetchContacts } from '../services/api';

const Reports = () => {
	const [ contacts, setContacts ] = useState( [] );
	const [ loading, setLoading ] = useState( false );

	// Filters
	const [ search, setSearch ] = useState( '' );
	const [ status, setStatus ] = useState( 'all' );
	const [ type, setType ] = useState( 'all' );
	const [ birthdayMonth, setBirthdayMonth ] = useState( '' );
	const [ monthList ] = useState( [
		{ label: __( 'All Months', 'wp-erp' ), value: '' },
		{ label: 'January', value: '1' },
		{ label: 'February', value: '2' },
		{ label: 'March', value: '3' },
		{ label: 'April', value: '4' },
		{ label: 'May', value: '5' },
		{ label: 'June', value: '6' },
		{ label: 'July', value: '7' },
		{ label: 'August', value: '8' },
		{ label: 'September', value: '9' },
		{ label: 'October', value: '10' },
		{ label: 'November', value: '11' },
		{ label: 'December', value: '12' },
	] );

	const fetchReport = async () => {
		setLoading( true );
		try {
			const params = {
				search,
				status,
				type,
				birthday_month: birthdayMonth,
			};

			// Remove empty
			Object.keys( params ).forEach(
				( key ) => params[ key ] === '' && delete params[ key ]
			);

			const data = await fetchContacts( params );
			setContacts( data );
		} catch ( err ) {
			console.error( err );
		} finally {
			setLoading( false );
		}
	};

	useEffect( () => {
		fetchReport();
	}, [] );

	return (
		<Card>
			<CardHeader>
				<h3>{ __( 'Contact Reports', 'wp-erp' ) }</h3>
			</CardHeader>
			<CardBody>
				{ /* Filters */ }
				<div
					style={ {
						marginBottom: '20px',
						padding: '15px',
						background: '#f8f9fa',
						borderRadius: '4px',
					} }
				>
					<Flex gap={ 4 } wrap={ true } align="end">
						<FlexItem>
							<TextControl
								label={ __( 'Search', 'wp-erp' ) }
								value={ search }
								onChange={ setSearch }
								placeholder="Name, Email, Phone..."
							/>
						</FlexItem>
						<FlexItem>
							<SelectControl
								label={ __( 'Status', 'wp-erp' ) }
								value={ status }
								options={ [
									{ label: 'All', value: 'all' },
									{ label: 'Lead', value: 'lead' },
									{ label: 'Customer', value: 'customer' },
									{
										label: 'Opportunity',
										value: 'opportunity',
									},
									{
										label: 'Subscriber',
										value: 'subscriber',
									},
								] }
								onChange={ setStatus }
							/>
						</FlexItem>
						<FlexItem>
							<SelectControl
								label={ __( 'Type', 'wp-erp' ) }
								value={ type }
								options={ [
									{ label: 'All', value: 'all' },
									{ label: 'Contact', value: 'contact' },
									{ label: 'Company', value: 'company' },
								] }
								onChange={ setType }
							/>
						</FlexItem>
						<FlexItem>
							<SelectControl
								label={ __( 'Birthday Month', 'wp-erp' ) }
								value={ birthdayMonth }
								options={ monthList }
								onChange={ setBirthdayMonth }
							/>
						</FlexItem>
						<FlexItem>
							<Button
								variant="primary"
								onClick={ fetchReport }
								isBusy={ loading }
							>
								{ __( 'Filter', 'wp-erp' ) }
							</Button>
						</FlexItem>
					</Flex>
				</div>

				{ /* Table */ }
				{ loading ? (
					<Flex justify="center">
						<Spinner />
					</Flex>
				) : (
					<>
						<p>Total Records: { contacts.length }</p>
						<table className="wp-list-table widefat fixed striped">
							<thead>
								<tr>
									<th>ID</th>
									<th>Name</th>
									<th>Email</th>
									<th>Phone</th>
									<th>Status</th>
									<th>Joined</th>
								</tr>
							</thead>
							<tbody>
								{ contacts.length > 0 ? (
									contacts.map( ( c ) => (
										<tr key={ c.id }>
											<td>{ c.id }</td>
											<td>
												{ c.first_name } { c.last_name }
											</td>
											<td>{ c.email }</td>
											<td>{ c.phone }</td>
											<td>{ c.status }</td>
											<td>
												{ new Date(
													c.created_at
												).toLocaleDateString() }
											</td>
										</tr>
									) )
								) : (
									<tr>
										<td colSpan="6">No records found.</td>
									</tr>
								) }
							</tbody>
						</table>
					</>
				) }
			</CardBody>
		</Card>
	);
};

export default Reports;
