/**
 * Vouchers Module App
 */
import { useState, useEffect, useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	Card,
	CardBody,
	CardHeader,
	Button,
	TextControl,
	SelectControl,
	TextareaControl,
	Spinner,
	Notice,
	Flex,
	FlexBlock,
	TabPanel,
} from '@wordpress/components';
import { DataViews } from '@wordpress/dataviews';
import apiFetch from '@wordpress/api-fetch';

const VouchersApp = ( { view: initialTab = 'list' } ) => {
	const [ vouchers, setVouchers ] = useState( [] );
	const [ loading, setLoading ] = useState( true );
	const [ error, setError ] = useState( null );
	const [ isCreating, setIsCreating ] = useState( false );
	const [ formData, setFormData ] = useState( {
		voucher_type: 'payment',
		date: new Date().toISOString().split( 'T' )[ 0 ],
		party_name: '',
		amount: '',
		description: '',
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
			field: 'voucher_no',
			direction: 'desc',
		},
		search: '',
		filters: [],
		fields: [
			'voucher_no',
			'voucher_type',
			'date',
			'party_name',
			'amount',
			'status',
		],
	} );

	useEffect( () => {
		if ( activeTab === 'list' ) {
			fetchVouchers();
		}
	}, [ activeTab ] );

	const fetchVouchers = async () => {
		setLoading( true );
		setError( null );
		try {
			const data = await apiFetch( { path: '/wp-erp/v1/vouchers' } );
			setVouchers( data );
		} catch ( err ) {
			setError(
				err.message || __( 'Failed to fetch vouchers', 'wp-erp' )
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
				path: '/wp-erp/v1/vouchers',
				method: 'POST',
				data: formData,
			} );
			setFormData( {
				voucher_type: 'payment',
				date: new Date().toISOString().split( 'T' )[ 0 ],
				party_name: '',
				amount: '',
				description: '',
				status: 'draft',
			} );
			if ( activeTab === 'create' ) {
				setActiveTab( 'list' );
			} else {
				fetchVouchers();
			}
		} catch ( err ) {
			setError(
				err.message || __( 'Failed to create voucher', 'wp-erp' )
			);
		} finally {
			setIsCreating( false );
		}
	};

	const getStatusColor = ( status ) => {
		switch ( status ) {
			case 'approved':
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
				id: 'voucher_no',
				header: __( 'Voucher No', 'wp-erp' ),
				getValue: ( { item } ) => item.voucher_no,
				enableSorting: true,
			},
			{
				id: 'voucher_type',
				header: __( 'Type', 'wp-erp' ),
				getValue: ( { item } ) => item.voucher_type,
				enableSorting: true,
			},
			{
				id: 'date',
				header: __( 'Date', 'wp-erp' ),
				getValue: ( { item } ) => item.date,
				enableSorting: true,
			},
			{
				id: 'party_name',
				header: __( 'Party Name', 'wp-erp' ),
				getValue: ( { item } ) => item.party_name || '-',
				enableSorting: true,
			},
			{
				id: 'amount',
				header: __( 'Amount', 'wp-erp' ),
				getValue: ( { item } ) => item.amount,
				enableSorting: true,
			},
			{
				id: 'status',
				header: __( 'Status', 'wp-erp' ),
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
				layout: {
					primaryField: 'voucher_no',
				},
			},
		} ),
		[]
	);

	const renderVouchersList = () => {
		if ( loading ) {
			return (
				<Flex justify="center" style={ { padding: '32px' } }>
					<Spinner />
				</Flex>
			);
		}

		if ( vouchers.length === 0 ) {
			return (
				<p
					style={ {
						padding: '16px',
						textAlign: 'center',
						color: '#757575',
					} }
				>
					{ __( 'No vouchers found.', 'wp-erp' ) }
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
					data={ vouchers }
					fields={ fields }
					actions={ [] }
					view={ view }
					onChangeView={ setView }
					defaultLayouts={ defaultLayouts }
					paginationInfo={ {
						totalItems: vouchers.length,
						totalPages: Math.ceil( vouchers.length / view.perPage ),
					} }
				/>
			</div>
		);
	};

	const renderCreateVoucher = () => {
		return (
			<Card style={ { marginBottom: '24px' } }>
				<CardHeader>
					<h2 style={ { margin: 0 } }>
						{ __( 'Create New Voucher', 'wp-erp' ) }
					</h2>
				</CardHeader>
				<CardBody>
					<form onSubmit={ handleSubmit }>
						<Flex direction="column" gap={ 4 }>
							<Flex>
								<FlexBlock>
									<SelectControl
										label={ __( 'Voucher Type', 'wp-erp' ) }
										value={ formData.voucher_type }
										options={ [
											{
												label: __(
													'Payment',
													'wp-erp'
												),
												value: 'payment',
											},
											{
												label: __(
													'Receipt',
													'wp-erp'
												),
												value: 'receipt',
											},
											{
												label: __(
													'Journal',
													'wp-erp'
												),
												value: 'journal',
											},
										] }
										onChange={ ( value ) =>
											setFormData( {
												...formData,
												voucher_type: value,
											} )
										}
										required
									/>
								</FlexBlock>
								<FlexBlock>
									<TextControl
										label={ __( 'Date', 'wp-erp' ) }
										type="date"
										value={ formData.date }
										onChange={ ( value ) =>
											setFormData( {
												...formData,
												date: value,
											} )
										}
										required
									/>
								</FlexBlock>
							</Flex>
							<FlexBlock>
								<TextControl
									label={ __( 'Party Name', 'wp-erp' ) }
									value={ formData.party_name }
									onChange={ ( value ) =>
										setFormData( {
											...formData,
											party_name: value,
										} )
									}
								/>
							</FlexBlock>
							<FlexBlock>
								<TextControl
									label={ __( 'Amount', 'wp-erp' ) }
									type="number"
									step="0.01"
									value={ formData.amount }
									onChange={ ( value ) =>
										setFormData( {
											...formData,
											amount: value,
										} )
									}
									required
								/>
							</FlexBlock>
							<FlexBlock>
								<TextareaControl
									label={ __( 'Description', 'wp-erp' ) }
									value={ formData.description }
									onChange={ ( value ) =>
										setFormData( {
											...formData,
											description: value,
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
									{ __( 'Create Voucher', 'wp-erp' ) }
								</Button>
							</Flex>
						</Flex>
					</form>
				</CardBody>
			</Card>
		);
	};

	return (
		<div className="wp-erp-vouchers">
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
						className="wp-erp-vouchers-tabs"
						activeClass="is-active"
						initialTabName={ activeTab }
						onSelect={ ( tabName ) => setActiveTab( tabName ) }
						tabs={ [
							{
								name: 'list',
								title: __( 'All Vouchers', 'wp-erp' ),
								className: 'tab-list',
							},
							{
								name: 'create',
								title: __( 'Create Voucher', 'wp-erp' ),
								className: 'tab-create',
							},
						] }
					>
						{ ( tab ) => {
							if ( tab.name === 'list' ) {
								return renderVouchersList();
							}
							return renderCreateVoucher();
						} }
					</TabPanel>
			</div>
		</div>
	);
};

export default VouchersApp;
