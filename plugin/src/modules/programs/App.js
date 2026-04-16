import { Button, TextControl } from '@wordpress/components';
import AdminCrud from '../../components/AdminCrud';

export default function ProgramsApp() {
	const defaultState = {
		date: new Date().toISOString().split( 'T' )[ 0 ],
		image_id: null,
		image_url: null,
	};

	const columns = [
		{
			label: 'Date',
			render: ( item ) => <strong>{ item.program_date }</strong>,
		},
		{
			label: 'Flyer',
			render: ( item ) =>
				item.image_url ? (
					<img
						src={ item.image_url }
						style={ { width: '80px', borderRadius: '4px' } }
					/>
				) : (
					'-'
				),
		},
	];

	const prepareSubmitData = ( state ) => {
		return {
			date: state.date,
			image_id: state.image_id,
		};
	};

	const openMediaUploader = ( setState ) => {
		const frame = wp.media( {
			title: 'Select Program Flyer',
			multiple: false,
			button: { text: 'Use this image' },
		} );
		frame.on( 'select', () => {
			const attachment = frame
				.state()
				.get( 'selection' )
				.first()
				.toJSON();
			setState( ( prev ) => ( {
				...prev,
				image_id: attachment.id,
				image_url: attachment.url,
			} ) );
		} );
		frame.open();
	};

	const renderForm = ( { state, setState } ) => (
		<>
			<TextControl
				label="Date"
				value={ state.date }
				onChange={ ( val ) => setState( { ...state, date: val } ) }
				type="date"
			/>
			<div style={ { marginBottom: '20px' } }>
				<label
					style={ {
						display: 'block',
						marginBottom: '5px',
						fontWeight: '600',
					} }
				>
					Program Flyer
				</label>
				{ state.image_url && (
					<div style={ { marginBottom: '10px' } }>
						<img
							src={ state.image_url }
							style={ {
								maxWidth: '100%',
								maxHeight: '300px',
								display: 'block',
								borderRadius: '4px',
							} }
						/>
						<Button
							isDestructive
							isSmall
							onClick={ () =>
								setState( {
									...state,
									image_id: null,
									image_url: null,
								} )
							}
							style={ { marginTop: '5px' } }
						>
							Remove
						</Button>
					</div>
				) }
				<Button
					isSecondary
					onClick={ () => openMediaUploader( setState ) }
				>
					{ state.image_url ? 'Change Image' : 'Select Image' }
				</Button>
			</div>
		</>
	);

	return (
		<AdminCrud
			title="Daily Programs"
			apiPath="/wp-erp/v1/content/daily-programs"
			entityName="Program"
			columns={ columns }
			defaultFormState={ defaultState }
			renderForm={ renderForm }
			prepareSubmitData={ prepareSubmitData }
		/>
	);
}
