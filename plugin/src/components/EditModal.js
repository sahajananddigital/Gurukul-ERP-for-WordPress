/**
 * Edit Modal Component
 */
import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	Modal,
	Button,
	TextControl,
	SelectControl,
	TextareaControl,
	Flex,
} from '@wordpress/components';

const EditModal = ( { title, isOpen, onClose, onSave, data, fields } ) => {
	const [ formData, setFormData ] = useState( {} );
	const [ isSaving, setIsSaving ] = useState( false );

	useEffect( () => {
		if ( data ) {
			setFormData( { ...data } );
		}
	}, [ data ] );

	const handleChange = ( key, value ) => {
		setFormData( {
			...formData,
			[ key ]: value,
		} );
	};

	const handleSave = async () => {
		setIsSaving( true );
		await onSave( formData );
		setIsSaving( false );
		onClose();
	};

	if ( ! isOpen ) {
		return null;
	}

	return (
		<Modal title={ title } onRequestClose={ onClose }>
			<div style={ { padding: '0 16px 16px' } }>
				{ fields.map( ( field ) => (
					<div key={ field.key } style={ { marginBottom: '16px' } }>
						{ field.type === 'text' && (
							<TextControl
								label={ field.label }
								value={ formData[ field.key ] || '' }
								onChange={ ( val ) =>
									handleChange( field.key, val )
								}
								type={ field.inputType || 'text' }
							/>
						) }
						{ field.type === 'textarea' && (
							<TextareaControl
								label={ field.label }
								value={ formData[ field.key ] || '' }
								onChange={ ( val ) =>
									handleChange( field.key, val )
								}
							/>
						) }
						{ field.type === 'select' && (
							<SelectControl
								label={ field.label }
								value={ formData[ field.key ] || '' }
								options={ field.options }
								onChange={ ( val ) =>
									handleChange( field.key, val )
								}
							/>
						) }
					</div>
				) ) }

				<Flex justify="flex-end" style={ { marginTop: '24px' } }>
					<Button
						variant="secondary"
						onClick={ onClose }
						disabled={ isSaving }
						style={ { marginRight: '8px' } }
					>
						{ __( 'Cancel', 'wp-erp' ) }
					</Button>
					<Button
						variant="primary"
						onClick={ handleSave }
						isBusy={ isSaving }
					>
						{ __( 'Save Changes', 'wp-erp' ) }
					</Button>
				</Flex>
			</div>
		</Modal>
	);
};

export default EditModal;
