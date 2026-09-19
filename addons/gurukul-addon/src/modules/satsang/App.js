import { TextControl, TextareaControl } from '@wordpress/components';
import AdminCrud from '../../components/AdminCrud';

export default function SatsangApp() {
	const defaultState = {
		date: new Date().toISOString().split( 'T' )[ 0 ],
		title: '',
		description: '',
		video_url: '',
	};

	const columns = [
		{
			label: 'Date',
			render: ( item ) => <strong>{ item.satsang_date }</strong>,
		},
		{ label: 'Title', render: ( item ) => item.title },
		{
			label: 'Video',
			render: ( item ) =>
				item.video_url ? (
					<a href={ item.video_url } target="_blank" rel="noreferrer">
						Watch Video
					</a>
				) : (
					'-'
				),
		},
	];

	const prepareSubmitData = ( state ) => {
		return {
			date: state.date,
			title: state.title,
			description: state.description,
			video_url: state.video_url,
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
				label="Title"
				value={ state.title }
				onChange={ ( val ) => setState( { ...state, title: val } ) }
			/>
			<TextareaControl
				label="Description"
				value={ state.description }
				onChange={ ( val ) =>
					setState( { ...state, description: val } )
				}
				rows={ 4 }
			/>
			<TextControl
				label="Video URL (YouTube/Vimeo)"
				value={ state.video_url }
				onChange={ ( val ) => setState( { ...state, video_url: val } ) }
				help="Enter the full URL of the video."
			/>
		</>
	);

	return (
		<AdminCrud
			title="Daily Satsang"
			apiPath="/wp-erp/v1/content/daily-satsang"
			entityName="Satsang"
			columns={ columns }
			defaultFormState={ defaultState }
			renderForm={ renderForm }
			prepareSubmitData={ prepareSubmitData }
		/>
	);
}
