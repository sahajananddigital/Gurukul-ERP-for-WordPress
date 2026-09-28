/**
 * Invoices Module App
 */
import { useState, useEffect, useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	Card,
	CardBody,
	CardHeader,
	Button,
	TextControl,
	TextareaControl,
	Spinner,
	Notice,
	Flex,
	FlexBlock,
	TabPanel,
} from '@wordpress/components';
import { DataViews } from '@wordpress/dataviews';
import apiFetch from '@wordpress/api-fetch';

const InvoicesApp = ( { view: initialTab = 'list' } ) => {
	const [ invoices, setInvoices ] = useState( [] );

	const [ loading, setLoading ] = useState( true );
	const [ error, setError ] = useState( null );
	const [ isCreating, setIsCreating ] = useState( false );
	const [ formData, setFormData ] = useState( {
		contact_id: '',
		invoice_date: new Date().toISOString().split( 'T' )[ 0 ],
		due_date: '',
		subtotal: '',
		tax_amount: '',
		total_amount: '',
		notes: '',
		status: 'draft',
	} );

	const [ activeTab, setActiveTab ] = useState(
		initialTab === 'create' ? 'create' : 'list'
	);

	const [ view, setView ] = useState( {
		type: 'table',
		perPage: 20,
		page: 1,
		sort: {
			field: 'invoice_no',
			direction: 'desc',
		},
		search: '',
		filters: [],
		fields: [
			'invoice_no',
			'client_name',
			'date',
			'due_date',
			'total',
			'status',
		],
	} );

	useEffect( () => {
		if ( activeTab === 'list' ) {
			fetchInvoices();
		}
	}, [ activeTab ] );

	const fetchInvoices = async () => {
		setLoading( true );
		setError( null );
		try {
			const data = await apiFetch( { path: '/sahajanand-erp/v1/invoices' } );
			setInvoices( data );
		} catch ( err ) {
			setError(
				err.message || __( 'Failed to fetch invoices', 'sahajanand-erp' )
			);
		} finally {
			setLoading( false );
		}
	};

	const handleSubmit = async ( e ) => {
		e.preventDefault();
		setIsCreating( true );
		setError( null );

		try {
			await apiFetch( {
				path: '/sahajanand-erp/v1/invoices',
				method: 'POST',
				data: formData,
			} );
			if ( activeTab === 'create' ) {
				setActiveTab( 'list' );
			} else {
				fetchInvoices();
			}
		} catch ( err ) {
			setError(
				err.message || __( 'Failed to create invoice', 'sahajanand-erp' )
			);
		} finally {
			setIsCreating( false );
		}
	};

	const getStatusColor = ( status ) => {
		switch ( status ) {
			case 'paid':
				return '#00a32a';
			case 'draft':
				return '#757575';
			default:
				return '#dba617';
		}
	};

	const fields = useMemo(
		() => [
			{
				id: 'invoice_no',
				header: __( 'Invoice No', 'sahajanand-erp' ),
				getValue: ( { item } ) => item.invoice_no,
				enableSorting: true,
			},
			{
				id: 'client_name',
				header: __( 'Client Name', 'sahajanand-erp' ),
				getValue: ( { item } ) => {
					if ( item.client_name ) {
						return item.client_name;
					}
					if ( item.contact_name ) {
						return item.contact_name;
					}
					return item.contact_id
						? `Contact #${ item.contact_id }`
						: '-';
				},
				enableSorting: true,
			},
			{
				id: 'date',
				header: __( 'Date', 'sahajanand-erp' ),
				getValue: ( { item } ) => item.date || item.invoice_date || '-',
				enableSorting: true,
			},
			{
				id: 'due_date',
				header: __( 'Due Date', 'sahajanand-erp' ),
				getValue: ( { item } ) => item.due_date || '-',
				enableSorting: true,
			},
			{
				id: 'total',
				header: __( 'Total', 'sahajanand-erp' ),
				getValue: ( { item } ) => {
					if ( item.total !== undefined ) {
						return item.total;
					}
					return item.total_amount !== undefined
						? item.total_amount
						: '-';
				},
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
				titleField: 'invoice_no',
			},
		} ),
		[]
	);

	const renderInvoicesList = () => {
		if ( loading ) {
			return (
				<Flex justify="center" style={ { padding: '32px' } }>
					<Spinner />
				</Flex>
			);
		}

		if ( invoices.length === 0 ) {
			return (
				<p
					style={ {
						padding: '16px',
						textAlign: 'center',
						color: '#757575',
					} }
				>
					{ __( 'No invoices found.', 'sahajanand-erp' ) }
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
					data={ invoices }
					fields={ fields }
					actions={ [] }
					view={ view }
					onChangeView={ setView }
					defaultLayouts={ defaultLayouts }
					paginationInfo={ {
						totalItems: invoices.length,
						totalPages: Math.ceil( invoices.length / view.perPage ),
					} }
				/>
			</div>
		);
	};

	const renderCreateInvoice = () => {
		return (
			<Card style={ { marginBottom: '24px' } }>
				<CardHeader>
					<h2 style={ { margin: 0 } }>
						{ __( 'Create Invoice', 'sahajanand-erp' ) }
					</h2>
				</CardHeader>
				<CardBody>
					<form onSubmit={ handleSubmit }>
						<Flex direction="column" gap={ 4 }>
							<Flex>
								<FlexBlock>
									<TextControl
										label={ __( 'Invoice Date', 'sahajanand-erp' ) }
										type="date"
										value={ formData.invoice_date }
										onChange={ ( value ) =>
											setFormData( {
												...formData,
												invoice_date: value,
											} )
										}
										required
									/>
								</FlexBlock>
								<FlexBlock>
									<TextControl
										label={ __( 'Due Date', 'sahajanand-erp' ) }
										type="date"
										value={ formData.due_date }
										onChange={ ( value ) =>
											setFormData( {
												...formData,
												due_date: value,
											} )
										}
									/>
								</FlexBlock>
							</Flex>
							<FlexBlock>
								<TextControl
									label={ __( 'Subtotal', 'sahajanand-erp' ) }
									type="number"
									step="0.01"
									value={ formData.subtotal }
									onChange={ ( value ) => {
										const subtotal =
											parseFloat( value ) || 0;
										const tax =
											parseFloat( formData.tax_amount ) ||
											0;
										setFormData( {
											...formData,
											subtotal: value,
											total_amount: (
												subtotal + tax
											).toFixed( 2 ),
										} );
									} }
								/>
							</FlexBlock>
							<FlexBlock>
								<TextControl
									label={ __( 'Tax Amount', 'sahajanand-erp' ) }
									type="number"
									step="0.01"
									value={ formData.tax_amount }
									onChange={ ( value ) => {
										const subtotal =
											parseFloat( formData.subtotal ) ||
											0;
										const tax = parseFloat( value ) || 0;
										setFormData( {
											...formData,
											tax_amount: value,
											total_amount: (
												subtotal + tax
											).toFixed( 2 ),
										} );
									} }
								/>
							</FlexBlock>
							<FlexBlock>
								<TextControl
									label={ __( 'Total Amount', 'sahajanand-erp' ) }
									type="number"
									step="0.01"
									value={ formData.total_amount }
									readOnly
								/>
							</FlexBlock>
							<FlexBlock>
								<TextareaControl
									label={ __( 'Notes', 'sahajanand-erp' ) }
									value={ formData.notes }
									onChange={ ( value ) =>
										setFormData( {
											...formData,
											notes: value,
										} )
									}
									rows={ 4 }
								/>
							</FlexBlock>
							<Flex justify="flex-start">
								<Button
									variant="primary"
									type="submit"
									isBusy={ isCreating }
								>
									{ __( 'Create Invoice', 'sahajanand-erp' ) }
								</Button>
							</Flex>
						</Flex>
					</form>
				</CardBody>
			</Card>
		);
	};

	return (
		<div className="sahajanand-erp-invoices">
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
						className="sahajanand-erp-invoices-tabs"
						activeClass="is-active"
						initialTabName={ activeTab }
						onSelect={ ( tabName ) => setActiveTab( tabName ) }
						tabs={ [
							{
								name: 'list',
								title: __( 'All Invoices', 'sahajanand-erp' ),
								className: 'tab-list',
							},
							{
								name: 'create',
								title: __( 'Create Invoice', 'sahajanand-erp' ),
								className: 'tab-create',
							},
						] }
					>
						{ ( tab ) => {
							if ( tab.name === 'list' ) {
								return renderInvoicesList();
							}
							return renderCreateInvoice();
						} }
					</TabPanel>
			</div>
		</div>
	);
};

export default InvoicesApp;
