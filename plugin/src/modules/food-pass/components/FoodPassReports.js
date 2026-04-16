/**
 * Food Pass Reports Component
 */
import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	Card,
	Button,
	TextControl,
	Flex,
	FlexBlock,
} from '@wordpress/components';
import { getFilteredReports } from '../utils';

const FoodPassReports = ( { foodPasses } ) => {
	const [ reportStartDate, setReportStartDate ] = useState( '' );
	const [ reportEndDate, setReportEndDate ] = useState( '' );
	const [ reportFilterType, setReportFilterType ] = useState( 'all' ); // all, lunch, dinner

	useEffect( () => {
		const now = new Date();
		const firstDay = new Date( now.getFullYear(), now.getMonth(), 1 )
			.toISOString()
			.split( 'T' )[ 0 ];
		const lastDay = new Date( now.getFullYear(), now.getMonth() + 1, 0 )
			.toISOString()
			.split( 'T' )[ 0 ];
		setReportStartDate( firstDay );
		setReportEndDate( lastDay );
	}, [] );

	const filteredData = getFilteredReports(
		foodPasses,
		reportStartDate,
		reportEndDate,
		reportFilterType
	);

	// Calculate Stats for Filtered Data
	let totalQty = 0;
	let totalRevenue = 0;
	let lunchCount = 0;
	let dinnerCount = 0;

	filteredData.forEach( ( pass ) => {
		const qty = parseInt( pass.total_meals || 0 );
		let revenue = 0;
		let type = 'Lunch';

		try {
			const notesData = pass.notes ? JSON.parse( pass.notes ) : {};
			if ( notesData.amount ) {
				revenue = parseFloat( notesData.amount );
			} else {
				revenue = qty * 90;
			}
			if ( notesData.mealType ) {
				type = notesData.mealType;
			}
		} catch ( e ) {
			revenue = qty * 90;
		}

		totalQty += qty;
		totalRevenue += revenue;
		if ( type === 'Lunch' ) {
			lunchCount += qty;
		}
		if ( type === 'Dinner' ) {
			dinnerCount += qty;
		}
	} );

	return (
		<div className="food-pass-reports">
			{ /* Filters */ }
			<Card style={ { marginBottom: '20px', padding: '20px' } }>
				<Flex gap={ 4 } align="end" wrap={ true }>
					<FlexBlock>
						<TextControl
							label={ __( 'Start Date', 'wp-erp' ) }
							type="date"
							value={ reportStartDate }
							onChange={ ( val ) => setReportStartDate( val ) }
						/>
					</FlexBlock>
					<FlexBlock>
						<TextControl
							label={ __( 'End Date', 'wp-erp' ) }
							type="date"
							value={ reportEndDate }
							onChange={ ( val ) => setReportEndDate( val ) }
						/>
					</FlexBlock>
					<FlexBlock>
						<div className="components-base-control">
							<label
								className="components-base-control__label"
								style={ {
									marginBottom: '8px',
									display: 'block',
								} }
							>
								{ __( 'Meal Type', 'wp-erp' ) }
							</label>
							<select
								value={ reportFilterType }
								onChange={ ( e ) =>
									setReportFilterType( e.target.value )
								}
								style={ {
									width: '100%',
									height: '40px',
									borderColor: '#757575',
									borderRadius: '4px',
									padding: '0 8px',
								} }
							>
								<option value="all">
									{ __( 'All Types' ) }
								</option>
								<option value="lunch">{ __( 'Lunch' ) }</option>
								<option value="dinner">
									{ __( 'Dinner' ) }
								</option>
							</select>
						</div>
					</FlexBlock>
					<FlexBlock style={ { flex: '0 0 auto' } }>
						<Button
							variant="secondary"
							onClick={ () => {
								// Quick Range: Today
								const today = new Date()
									.toISOString()
									.split( 'T' )[ 0 ];
								setReportStartDate( today );
								setReportEndDate( today );
							} }
						>
							{ __( 'Today' ) }
						</Button>
					</FlexBlock>
				</Flex>
			</Card>

			{ /* Stats Cards */ }
			<Flex gap={ 4 } style={ { marginBottom: '20px' } }>
				<FlexBlock>
					<Card
						style={ {
							padding: '20px',
							textAlign: 'center',
							borderTop: '4px solid #2271b1',
						} }
					>
						<div
							style={ {
								color: '#646970',
								fontSize: '13px',
								textTransform: 'uppercase',
							} }
						>
							{ __( 'Total Revenue' ) }
						</div>
						<div
							style={ {
								fontSize: '28px',
								fontWeight: 'bold',
								color: '#101517',
							} }
						>
							₹{ totalRevenue.toLocaleString( 'en-IN' ) }
						</div>
					</Card>
				</FlexBlock>
				<FlexBlock>
					<Card
						style={ {
							padding: '20px',
							textAlign: 'center',
							borderTop: '4px solid #00a32a',
						} }
					>
						<div
							style={ {
								color: '#646970',
								fontSize: '13px',
								textTransform: 'uppercase',
							} }
						>
							{ __( 'Passes Sold' ) }
						</div>
						<div
							style={ {
								fontSize: '28px',
								fontWeight: 'bold',
							} }
						>
							{ totalQty }
						</div>
						<div
							style={ {
								fontSize: '12px',
								color: '#757575',
								marginTop: '4px',
							} }
						>
							{ lunchCount } Lunch • { dinnerCount } Dinner
						</div>
					</Card>
				</FlexBlock>
			</Flex>

			{ /* Detailed Filtered Table */ }
			{ filteredData.length > 0 ? (
				<div
					style={ {
						overflowX: 'auto',
						background: '#fff',
						border: '1px solid #e0e0e0',
					} }
				>
					<table className="wp-list-table widefat fixed striped">
						<thead>
							<tr>
								<th>{ __( 'Pass ID', 'wp-erp' ) }</th>
								<th>{ __( 'Date', 'wp-erp' ) }</th>
								<th>{ __( 'Meal Type', 'wp-erp' ) }</th>
								<th>{ __( 'Quantity', 'wp-erp' ) }</th>
								<th>{ __( 'Amount', 'wp-erp' ) }</th>
							</tr>
						</thead>
						<tbody>
							{ filteredData.map( ( pass ) => {
								let amount = '-';
								let mealType = '-';
								try {
									const notesData = pass.notes
										? JSON.parse( pass.notes )
										: {};
									if ( notesData.amount ) {
										amount = `₹${ notesData.amount }`;
									} else if ( pass.total_meals ) {
										amount = `₹${ pass.total_meals * 90 }`;
									}
									mealType = notesData.mealType || 'Lunch';
								} catch ( e ) {
									amount = `₹${ pass.total_meals * 90 }`;
									mealType = 'Lunch';
								}

								return (
									<tr key={ pass.id }>
										<td>
											<strong>{ pass.id }</strong>
										</td>
										<td>{ pass.issue_date }</td>
										<td>
											<span
												style={ {
													padding: '2px 6px',
													borderRadius: '4px',
													background:
														mealType === 'Lunch'
															? '#e5f5fa'
															: '#fcf0f1',
													color:
														mealType === 'Lunch'
															? '#00869d'
															: '#d63638',
													fontWeight: '500',
												} }
											>
												{ mealType }
											</span>
										</td>
										<td>{ pass.total_meals }</td>
										<td>{ amount }</td>
									</tr>
								);
							} ) }
						</tbody>
					</table>
				</div>
			) : (
				<div
					style={ {
						padding: '40px',
						textAlign: 'center',
						color: '#757575',
						background: '#fff',
						border: '1px solid #e0e0e0',
					} }
				>
					{ __(
						'No records found for the selected range.',
						'wp-erp'
					) }
				</div>
			) }
		</div>
	);
};

export default FoodPassReports;
