import { Button, TextControl, TextareaControl } from '@wordpress/components';
import AdminCrud from '../../components/AdminCrud';

export default function UpdatesApp() {
	const defaultState = {
		date: new Date().toISOString().split( 'T' )[ 0 ],
		title: '',
		description: '',
		image_id: null,
		image_url: null,
	};

	const columns = [
		{
			label: 'Date',
			render: ( item ) => <strong>{ item.update_date }</strong>,
		},
		{ label: 'Title', render: ( item ) => item.title },
		{
			label: 'Description',
			render: ( item ) =>
				item.description
					? item.description.substring( 0, 50 ) + '...'
					: '-',
		},
		{
			label: 'Image',
			render: ( item ) =>
				item.image_url ? (
					<img
						src={ item.image_url }
						style={ {
							width: '40px',
							height: '40px',
							objectFit: 'cover',
							borderRadius: '4px',
						} }
					/>
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
			image_id: state.image_id,
		};
	};

	const openMediaUploader = ( setState ) => {
		const frame = wp.media( {
			title: 'Select Update Image',
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
				image_url: attachment.sizes?.thumbnail?.url || attachment.url,
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
			<div style={ { marginBottom: '20px' } }>
				<label
					style={ {
						display: 'block',
						marginBottom: '5px',
						fontWeight: '600',
					} }
				>
					Image
				</label>
				{ state.image_url && (
					<div style={ { marginBottom: '10px' } }>
						<img
							src={ state.image_url }
							style={ {
								width: '100px',
								height: '100px',
								objectFit: 'cover',
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
							style={ { marginLeft: '10px' } }
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
			title="Daily Updates"
			apiPath="/wp-erp/v1/content/daily-updates"
			entityName="Update"
			columns={ columns }
			defaultFormState={ defaultState }
			renderForm={ renderForm }
			prepareSubmitData={ prepareSubmitData }
		/>
	);
}
