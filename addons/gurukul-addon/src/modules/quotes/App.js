import { Button, TextControl, TextareaControl } from '@wordpress/components';
import AdminCrud from '../../components/AdminCrud';

export default function QuotesApp() {
	const defaultState = {
		quote_date: new Date().toISOString().split( 'T' )[ 0 ],
		quote_text: '',
		author: '',
		image_id: null,
		image_url: null,
	};

	const columns = [
		{
			label: 'Date',
			render: ( item ) => <strong>{ item.quote_date }</strong>,
		},
		{
			label: 'Quote',
			render: ( item ) => item.quote_text.substring( 0, 50 ) + '...',
		},
		{ label: 'Author', render: ( item ) => item.author },
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
			date: state.quote_date,
			text: state.quote_text,
			author: state.author,
			image_id: state.image_id,
		};
	};

	const openMediaUploader = ( setState ) => {
		const frame = wp.media( {
			title: 'Select Quote Background',
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
				value={ state.quote_date }
				onChange={ ( val ) =>
					setState( { ...state, quote_date: val } )
				}
				type="date"
			/>
			<TextareaControl
				label="Quote Text"
				value={ state.quote_text }
				onChange={ ( val ) =>
					setState( { ...state, quote_text: val } )
				}
				rows={ 4 }
			/>
			<TextControl
				label="Author"
				value={ state.author }
				onChange={ ( val ) => setState( { ...state, author: val } ) }
			/>
			<div style={ { marginBottom: '20px' } }>
				<label
					style={ {
						display: 'block',
						marginBottom: '5px',
						fontWeight: '600',
					} }
				>
					Background Image
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
			title="Daily Quotes"
			apiPath="/wp-erp/v1/content/daily-quotes"
			entityName="Quote"
			columns={ columns }
			defaultFormState={ defaultState }
			renderForm={ renderForm }
			prepareSubmitData={ prepareSubmitData }
		/>
	);
}
