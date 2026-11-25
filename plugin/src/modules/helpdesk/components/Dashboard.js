import { __ } from '@wordpress/i18n';
import { Card, CardBody, CardHeader, Flex } from '@wordpress/components';
import { Grid, Heading, Text, VStack } from '../../../components/wp-compat';

const Dashboard = ( { mailboxes, stats, onSelectMailbox } ) => {
	if ( mailboxes.length === 0 ) {
		return (
			<Flex justify="center" style={ { padding: '48px' } }>
				<Text variant="muted">
					{ __(
						'No mailboxes found. Go to Settings to create one.',
						'sahajanand-erp'
					) }
				</Text>
			</Flex>
		);
	}

	const lookup = {};
	if ( stats ) {
		stats.forEach( ( s ) => {
			lookup[ s.id ] = s;
		} );
	}

	return (
		<Grid columns={ [ 1, 2, 3 ] } gap={ 5 }>
			{ mailboxes.map( ( mb ) => {
				const s = lookup[ mb.id ] || {
					unassigned: 0,
					mine: 0,
					assigned: 0,
					closed: 0,
					total: 0,
				};
				const counts = [
					{
						label: __( 'Unassigned', 'sahajanand-erp' ),
						value: s.unassigned,
					},
					{
						label: __( 'Mine', 'sahajanand-erp' ),
						value: s.mine,
					},
					{
						label: __( 'Assigned', 'sahajanand-erp' ),
						value: s.assigned,
					},
					{
						label: __( 'Closed', 'sahajanand-erp' ),
						value: s.closed,
					},
				];

				return (
					<Card
						key={ mb.id }
						onClick={ () => onSelectMailbox( mb.id ) }
						style={ { cursor: 'pointer' } }
					>
						<CardHeader>
							<VStack spacing={ 0 }>
								<Heading level={ 4 }>{ mb.name }</Heading>
								<Text variant="muted" size="12px">
									{ mb.email_address }
								</Text>
							</VStack>
						</CardHeader>
						<CardBody>
							<VStack spacing={ 3 }>
								{ counts.map( ( count ) => (
									<Flex
										key={ count.label }
										justify="space-between"
									>
										<Text>{ count.label }</Text>
										<Text weight={ 600 }>
											{ count.value }
										</Text>
									</Flex>
								) ) }
							</VStack>
						</CardBody>
					</Card>
				);
			} ) }
		</Grid>
	);
};

export default Dashboard;
