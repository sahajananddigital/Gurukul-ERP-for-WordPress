import { __ } from '@wordpress/i18n';
import { Card, CardBody, CardHeader, Flex } from '@wordpress/components';
import { Grid, Heading, Text, VStack } from '../../../components/wp-compat';

const Dashboard = ( { mailboxes, tickets, currentUser, onSelectMailbox } ) => {
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

	return (
		<Grid columns={ [ 1, 2, 3 ] } gap={ 5 }>
			{ mailboxes.map( ( mb ) => {
				const mbTickets = tickets.filter(
					( t ) =>
						t.mailbox_id == mb.id &&
						! Number( t.is_deleted ) &&
						! Number( t.is_spam )
				);
				const counts = [
					{
						label: __( 'Unassigned', 'sahajanand-erp' ),
						value: mbTickets.filter(
							( t ) => ! t.assignee_id && t.status !== 'closed'
						).length,
					},
					{
						label: __( 'Mine', 'sahajanand-erp' ),
						value: mbTickets.filter(
							( t ) =>
								currentUser &&
								t.assignee_id == currentUser.id &&
								t.status !== 'closed'
						).length,
					},
					{
						label: __( 'Assigned', 'sahajanand-erp' ),
						value: mbTickets.filter(
							( t ) => t.assignee_id && t.status !== 'closed'
						).length,
					},
					{
						label: __( 'Closed', 'sahajanand-erp' ),
						value: mbTickets.filter(
							( t ) => t.status === 'closed'
						).length,
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
