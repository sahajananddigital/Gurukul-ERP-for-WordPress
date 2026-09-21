import { createSlotFill, Card, CardBody, CardHeader } from '@wordpress/components';

// Create a unique SlotFill pair for the Dashboard Widgets
const { Slot: DashboardWidgetSlot, Fill: DashboardWidgetFill } = createSlotFill(
	'SahajanandERPDashboardWidget'
);

/**
 * A wrapper component for Addon developers to use when registering a widget.
 * 
 * @param {Object} props
 * @param {string} props.title - The title of the widget
 * @param {React.ReactNode} props.children - Widget content
 */
export const DashboardWidget = ( { title, children } ) => (
	<DashboardWidgetFill>
		<Card className="sahajanand-erp-widget">
			{ title && (
				<CardHeader>
					<strong>{ title }</strong>
				</CardHeader>
			) }
			<CardBody>
				{ children }
			</CardBody>
		</Card>
	</DashboardWidgetFill>
);

export { DashboardWidgetSlot };
