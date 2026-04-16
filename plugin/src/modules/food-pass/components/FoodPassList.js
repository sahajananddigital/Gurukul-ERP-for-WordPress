/**
 * Food Pass List Component
 */
import { __ } from '@wordpress/i18n';
import {
	Card,
	CardBody,
	Flex,
	FlexBlock,
	Spinner,
} from '@wordpress/components';
import { getDashboardStats } from '../utils';

const FoodPassList = ( { foodPasses, loading } ) => {
	const stats = getDashboardStats( foodPasses );

	if ( loading ) {
		return (
			<Flex justify="center" style={ { padding: '32px' } }>
				<Spinner />
			</Flex>
		);
	}

	return (
		<div>
			{ /* Dashboard Stats Summary */ }
			<Card
				style={ {
					marginBottom: '20px',
					backgroundColor: '#fff',
					border: '1px solid #e0e0e0',
				} }
			>
				<CardBody>
					{ /* Monthly Insights */ }
					<h4
						style={ {
							margin: '0 0 10px 0',
							fontSize: '13px',
							color: '#757575',
							textTransform: 'uppercase',
						} }
					>
						{ __( 'Monthly Performance' ) }
					</h4>
					<Flex gap={ 4 }>
						<FlexBlock>
							<div
								style={ {
									border: '1px solid #e0e0e0',
									padding: '15px',
									borderRadius: '8px',
								} }
							>
								<div
									style={ {
										fontSize: '12px',
										color: '#646970',
										marginBottom: '4px',
									} }
								>
									{ __( 'This Month' ) }
								</div>
								<Flex
									justify="flex-start"
									gap={ 3 }
									align="baseline"
								>
									<div
										style={ {
											fontSize: '24px',
											fontWeight: 'bold',
											color: '#101517',
										} }
									>
										₹
										{ stats.thisMonth.amount.toLocaleString(
											'en-IN'
										) }
									</div>
									<div
										style={ {
											fontSize: '13px',
											color: '#757575',
										} }
									>
										({ stats.thisMonth.count } Passes)
									</div>
								</Flex>
							</div>
						</FlexBlock>
						<FlexBlock>
							<div
								style={ {
									border: '1px solid #e0e0e0',
									padding: '15px',
									borderRadius: '8px',
								} }
							>
								<div
									style={ {
										fontSize: '12px',
										color: '#646970',
										marginBottom: '4px',
									} }
								>
									{ __( 'Last Month' ) }
								</div>
								<Flex
									justify="flex-start"
									gap={ 3 }
									align="baseline"
								>
									<div
										style={ {
											fontSize: '24px',
											fontWeight: 'bold',
											color: '#646970',
										} }
									>
										₹
										{ stats.lastMonth.amount.toLocaleString(
											'en-IN'
										) }
									</div>
									<div
										style={ {
											fontSize: '13px',
											color: '#757575',
										} }
									>
										({ stats.lastMonth.count } Passes)
									</div>
								</Flex>
							</div>
						</FlexBlock>
					</Flex>
				</CardBody>
			</Card>

			{ foodPasses.length === 0 ? (
				<p
					style={ {
						padding: '16px',
						textAlign: 'center',
						color: '#757575',
					} }
				>
					{ __( 'No food passes found.', 'wp-erp' ) }
				</p>
			) : (
				<div style={ { overflowX: 'auto' } }>
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
							{ foodPasses.map( ( pass ) => {
								// Parse notes to get amount/rate if available
								let amount = '-';
								let mealType = '-';
								try {
									const notesData = pass.notes
										? JSON.parse( pass.notes )
										: {};
									if ( notesData.amount ) {
										amount = `₹${ notesData.amount }`;
									} else if ( pass.total_meals ) {
										// Fallback if data not in notes (legacy/manual entry)
										amount = `₹${ pass.total_meals * 90 }`;
									}

									if ( notesData.mealType ) {
										mealType = notesData.mealType;
									} else {
										// Fallback inference if missing
										mealType = 'Lunch'; // Legacy default
									}
								} catch ( e ) {
									// Legacy plain text notes or error
									if ( pass.total_meals ) {
										amount = `₹${ pass.total_meals * 90 }`;
										mealType = 'Lunch';
									}
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
			) }
		</div>
	);
};

export default FoodPassList;
