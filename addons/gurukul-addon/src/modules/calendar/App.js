import {
	TextControl,
	TextareaControl,
	SelectControl,
} from '@wordpress/components';
import AdminCrud from '../../components/AdminCrud';

export default function CalendarApp() {
	const defaultState = {
		date: new Date().toISOString().split( 'T' )[ 0 ],
		title: '',
		description: '',
		type: 'general',
	};

	const columns = [
		{
			label: 'Date',
			render: ( item ) => <strong>{ item.event_date }</strong>,
		},
		{ label: 'Title', render: ( item ) => item.title },
		{
			label: 'Type',
			render: ( item ) => (
				<span
					style={ {
						backgroundColor: '#eee',
						padding: '2px 6px',
						borderRadius: '4px',
						fontSize: '11px',
					} }
				>
					{ item.event_type }
				</span>
			),
		},
		{
			label: 'Description',
			render: ( item ) =>
				item.description
					? item.description.substring( 0, 50 ) + '...'
					: '-',
		},
	];

	const prepareSubmitData = ( state ) => {
		return {
			date: state.date,
			title: state.title,
			description: state.description,
			type: state.type,
		};
	};

	const renderForm = ( { state, setState } ) => (
		<>
			<TextControl
				label="Date"
				value={ state.date }
				onChange={ ( val ) => setState( { ...state, date: val } ) }
				type="date"
			/>
			<TextControl
				label="Event Title"
				value={ state.title }
				onChange={ ( val ) => setState( { ...state, title: val } ) }
			/>
			<SelectControl
				label="Event Type"
				value={ state.type }
				options={ [
					{ label: 'General', value: 'general' },
					{ label: 'Festival', value: 'festival' },
					{ label: 'Ekadashi', value: 'ekadashi' },
					{ label: 'Poonam', value: 'poonam' },
					{ label: 'Amavasya', value: 'amavasya' },
				] }
				onChange={ ( val ) => setState( { ...state, type: val } ) }
			/>
			<TextareaControl
				label="Description"
				value={ state.description }
				onChange={ ( val ) =>
					setState( { ...state, description: val } )
				}
				rows={ 4 }
			/>
		</>
	);

	return (
		<AdminCrud
			title="Calendar Events"
			apiPath="/wp-erp/v1/content/calendar-events"
			entityName="Event"
			columns={ columns }
			defaultFormState={ defaultState }
			renderForm={ renderForm }
			prepareSubmitData={ prepareSubmitData }
		/>
	);
}
