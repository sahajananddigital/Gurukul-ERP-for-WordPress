import { __ } from '@wordpress/i18n';
import { Card, CardBody, Flex, Button } from '@wordpress/components';

const Dashboard = ({ mailboxes, tickets, currentUser, onSelectMailbox }) => {
	return (
		<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
			{ mailboxes.map( mb => {
				const mbTickets = tickets.filter(t => t.mailbox_id == mb.id);
				const unassignedCount = mbTickets.filter(t => !t.assignee_id && t.status !== 'closed').length;
				const mineCount = mbTickets.filter(t => currentUser && t.assignee_id == currentUser.id && t.status !== 'closed').length;
				const assignedCount = mbTickets.filter(t => t.assignee_id && t.status !== 'closed').length;
				const closedCount = mbTickets.filter(t => t.status === 'closed').length;
				
				return (
					<Card key={mb.id} style={{ cursor: 'pointer', transition: 'box-shadow 0.2s' }} onClick={() => onSelectMailbox(mb.id)} onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)'} onMouseOut={(e) => e.currentTarget.style.boxShadow = 'none'}>
						<div style={{ backgroundColor: '#f3f4f5', padding: '16px', borderBottom: '1px solid #e2e4e7' }}>
							<h3 style={{ margin: 0, fontSize: '18px', color: '#1e1e1e' }}>{ mb.name }</h3>
							<p style={{ margin: '4px 0 0 0', color: '#757575', fontSize: '12px' }}>{ mb.email_address }</p>
						</div>
						<CardBody style={{ padding: '0' }}>
							<ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
								<li style={{ padding: '12px 16px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
									<span>Unassigned</span>
									{ unassignedCount > 0 ? <span style={{ backgroundColor: '#8993a4', color: '#fff', borderRadius: '12px', padding: '2px 8px', fontSize: '12px', fontWeight: 'bold' }}>{unassignedCount}</span> : null }
								</li>
								<li style={{ padding: '12px 16px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
									<span>Mine</span>
									{ mineCount > 0 ? <span style={{ backgroundColor: '#007cba', color: '#fff', borderRadius: '12px', padding: '2px 8px', fontSize: '12px', fontWeight: 'bold' }}>{mineCount}</span> : null }
								</li>
								<li style={{ padding: '12px 16px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
									<span>Assigned</span>
									{ assignedCount > 0 ? <span style={{ backgroundColor: '#e0e0e0', color: '#333', borderRadius: '12px', padding: '2px 8px', fontSize: '12px', fontWeight: 'bold' }}>{assignedCount}</span> : null }
								</li>
								<li style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between' }}>
									<span>Closed</span>
									{ closedCount > 0 ? <span style={{ backgroundColor: '#e0e0e0', color: '#333', borderRadius: '12px', padding: '2px 8px', fontSize: '12px', fontWeight: 'bold' }}>{closedCount}</span> : null }
								</li>
							</ul>
						</CardBody>
					</Card>
				);
			} ) }
			{ mailboxes.length === 0 && (
				<div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px', color: '#666' }}>
					<p>{ __('No mailboxes found. Go to Settings to create one.', 'sahajanand-erp') }</p>
				</div>
			)}
		</div>
	);
};

export default Dashboard;
