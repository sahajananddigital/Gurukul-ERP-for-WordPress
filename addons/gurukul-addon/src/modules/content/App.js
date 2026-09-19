import { Button, SelectControl, TextControl } from '@wordpress/components';
import AdminCrud from '../../components/AdminCrud';

export default function ContentApp() {
	// Note: API returns 'date' but we use 'date' in state.
	// API returns 'images' array of objects, state uses 'selectedImages'
	const defaultState = {
		date: new Date().toISOString().split( 'T' )[ 0 ],
		time: 'morning',
		images: [], // formatted as [{id, url}]
	};

	const columns = [
		{ label: 'Date', render: ( item ) => <strong>{ item.date }</strong> },
		{ label: 'Time', render: ( item ) => item.time },
		{
			label: 'Photos',
			render: ( item ) =>
				item.images ? `${ item.images.length } photos` : '0 photos',
		},
	];

	const prepareSubmitData = ( state ) => {
		return {
			date: state.date,
			time: state.time,
			image_ids: state.images.map( ( img ) => img.id ),
		};
	};

	const openMediaUploader = ( setState ) => {
		const frame = wp.media( {
			title: 'Select Darshan Images',
			multiple: true,
			button: { text: 'Use these images' },
		} );

		frame.on( 'select', () => {
			const selection = frame.state().get( 'selection' );
			const newImages = [];
			selection.forEach( ( attachment ) => {
				const json = attachment.toJSON();
				newImages.push( {
					id: json.id,
					url: json.sizes?.thumbnail?.url || json.url,
				} );
			} );
			setState( ( prev ) => ( {
				...prev,
				images: [ ...prev.images, ...newImages ],
			} ) );
		} );

		frame.open();
	};

	const removeImage = ( setState, idToRemove ) => {
		setState( ( prev ) => ( {
			...prev,
			images: prev.images.filter( ( img ) => img.id !== idToRemove ),
		} ) );
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
				<SelectControl
					label="Time"
					value={ state.time }
					options={ [
						{ label: 'Morning', value: 'morning' },
						{ label: 'Evening', value: 'evening' },
					] }
					onChange={ ( val ) => setState( { ...state, time: val } ) }
				/>
			</div>

			<div style={ { marginBottom: '20px' } }>
				<label
					style={ {
						display: 'block',
						marginBottom: '5px',
						fontWeight: '600',
					} }
				>
					Photos ({ state.images.length })
				</label>
				<div
					style={ {
						display: 'flex',
						flexWrap: 'wrap',
						gap: '10px',
						marginBottom: '10px',
					} }
				>
					{ state.images.map( ( img ) => (
						<div key={ img.id } style={ { position: 'relative' } }>
							<img
								src={ img.url }
								alt=""
								style={ {
									width: '80px',
									height: '80px',
									objectFit: 'cover',
									borderRadius: '4px',
								} }
							/>
							<Button
								icon="no-alt"
								isDestructive
								isSmall
								onClick={ () =>
									removeImage( setState, img.id )
								}
								style={ {
									position: 'absolute',
									top: '-8px',
									right: '-8px',
									minWidth: '24px',
									padding: 0,
									borderRadius: '50%',
									height: '24px',
								} }
							/>
						</div>
					) ) }
				</div>
				<Button
					isSecondary
					onClick={ () => openMediaUploader( setState ) }
				>
					Select Photos
				</Button>
			</div>
		</>
	);

	return (
		<AdminCrud
			title="Daily Darshan"
			apiPath="/wp-erp/v1/content/daily-darshan"
			entityName="Darshan"
			columns={ columns }
			defaultFormState={ defaultState }
			renderForm={ renderForm }
			prepareSubmitData={ prepareSubmitData }
		/>
	);
}
