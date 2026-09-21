import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Card, CardHeader, CardBody, TextControl, Button, Notice, Spinner } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';

const SettingsApp = () => {
	const [ settings, setSettings ] = useState( { company_name: '' } );
	const [ loading, setLoading ] = useState( true );
	const [ saving, setSaving ] = useState( false );
	const [ notice, setNotice ] = useState( null );

	useEffect( () => {
		apiFetch( { path: '/sahajanand-erp/v1/settings' } )
			.then( ( data ) => {
				setSettings( data );
				setLoading( false );
			} )
			.catch( ( err ) => {
				console.error( err );
				setNotice( { type: 'error', message: __( 'Failed to load settings.', 'sahajanand-erp' ) } );
				setLoading( false );
			} );
	}, [] );

	const handleSave = () => {
		setSaving( true );
		setNotice( null );
		apiFetch( {
			path: '/sahajanand-erp/v1/settings',
			method: 'POST',
			data: settings,
		} )
			.then( ( res ) => {
				setSettings( res.settings );
				setNotice( { type: 'success', message: __( 'Settings saved successfully!', 'sahajanand-erp' ) } );
				setSaving( false );
			} )
			.catch( ( err ) => {
				console.error( err );
				setNotice( { type: 'error', message: __( 'Failed to save settings.', 'sahajanand-erp' ) } );
				setSaving( false );
			} );
	};

	if ( loading ) {
		return <Spinner />;
	}

	return (
		<div className="sahajanand-erp-settings" style={ { padding: '40px', maxWidth: '800px', margin: '0 auto' } }>
			<div style={ { marginBottom: '32px' } }>
				<h1 style={ { margin: 0, fontSize: '24px', fontWeight: 600 } }>
					{ __( 'General Settings', 'sahajanand-erp' ) }
				</h1>
			</div>

			{ notice && (
				<Notice
					status={ notice.type }
					isDismissible={ false }
					style={ { marginBottom: '20px' } }
				>
					{ notice.message }
				</Notice>
			) }

			<Card>
				<CardHeader>
					<h2 style={ { margin: 0 } }>{ __( 'Company Information', 'sahajanand-erp' ) }</h2>
				</CardHeader>
				<CardBody>
					<div style={ { marginBottom: '20px' } }>
						<TextControl
							label={ __( 'Company Name', 'sahajanand-erp' ) }
							value={ settings.company_name }
							onChange={ ( val ) => setSettings( { ...settings, company_name: val } ) }
							help={ __( 'This name will appear on your invoices and reports.', 'sahajanand-erp' ) }
						/>
					</div>
					
					<Button
						isPrimary
						isBusy={ saving }
						disabled={ saving }
						onClick={ handleSave }
					>
						{ saving ? __( 'Saving...', 'sahajanand-erp' ) : __( 'Save Settings', 'sahajanand-erp' ) }
					</Button>
				</CardBody>
			</Card>
		</div>
	);
};

export default SettingsApp;
