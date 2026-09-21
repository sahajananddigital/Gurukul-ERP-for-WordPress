import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Card, CardHeader, CardBody, SelectControl, Button, Notice, Spinner, CheckboxControl } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';

const UserAccess = () => {
	const [ users, setUsers ] = useState( [] );
	const [ capabilities, setCapabilities ] = useState( {} );
	const [ selectedUserId, setSelectedUserId ] = useState( '' );
	const [ userAccess, setUserAccess ] = useState( null );
	const [ loading, setLoading ] = useState( true );
	const [ loadingAccess, setLoadingAccess ] = useState( false );
	const [ saving, setSaving ] = useState( false );
	const [ notice, setNotice ] = useState( null );

	useEffect( () => {
		Promise.all( [
			apiFetch( { path: '/sahajanand-erp/v1/user-access/users' } ),
			apiFetch( { path: '/sahajanand-erp/v1/user-access/capabilities' } )
		] ).then( ( [ usersData, capsData ] ) => {
			setUsers( usersData );
			setCapabilities( capsData );
			setLoading( false );
		} ).catch( ( err ) => {
			console.error( err );
			setNotice( { type: 'error', message: __( 'Failed to load user data.', 'sahajanand-erp' ) } );
			setLoading( false );
		} );
	}, [] );

	useEffect( () => {
		if ( ! selectedUserId ) {
			setUserAccess( null );
			return;
		}

		setLoadingAccess( true );
		setNotice( null );
		apiFetch( { path: `/sahajanand-erp/v1/user-access/${ selectedUserId }` } )
			.then( ( data ) => {
				setUserAccess( data );
				setLoadingAccess( false );
			} )
			.catch( ( err ) => {
				console.error( err );
				setNotice( { type: 'error', message: __( 'Failed to load user access.', 'sahajanand-erp' ) } );
				setLoadingAccess( false );
			} );
	}, [ selectedUserId ] );

	const handleSave = () => {
		setSaving( true );
		setNotice( null );
		apiFetch( {
			path: `/sahajanand-erp/v1/user-access/${ selectedUserId }`,
			method: 'POST',
			data: { access: userAccess.access },
		} )
			.then( () => {
				setNotice( { type: 'success', message: __( 'Permissions saved successfully!', 'sahajanand-erp' ) } );
				setSaving( false );
			} )
			.catch( ( err ) => {
				console.error( err );
				setNotice( { type: 'error', message: __( 'Failed to save permissions.', 'sahajanand-erp' ) } );
				setSaving( false );
			} );
	};

	const handleAccessChange = ( cap, checked ) => {
		setUserAccess( {
			...userAccess,
			access: {
				...userAccess.access,
				[ cap ]: checked
			}
		} );
	};

	if ( loading ) {
		return <Spinner />;
	}

	const userOptions = [
		{ label: __( '-- Select a user --', 'sahajanand-erp' ), value: '' },
		...users.map( u => ( { label: `${ u.display_name } (${ u.email })`, value: u.id } ) )
	];

	return (
		<div className="sahajanand-erp-user-access" style={ { padding: '40px', maxWidth: '800px', margin: '0 auto' } }>
			<div style={ { marginBottom: '32px' } }>
				<h1 style={ { margin: 0, fontSize: '24px', fontWeight: 600 } }>
					{ __( 'User Access Management', 'sahajanand-erp' ) }
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
					<h2 style={ { margin: 0 } }>{ __( 'Select User', 'sahajanand-erp' ) }</h2>
				</CardHeader>
				<CardBody>
					<SelectControl
						label={ __( 'User', 'sahajanand-erp' ) }
						value={ selectedUserId }
						options={ userOptions }
						onChange={ setSelectedUserId }
					/>
				</CardBody>
			</Card>

			{ loadingAccess && <div style={{ marginTop: '20px' }}><Spinner /></div> }

			{ ! loadingAccess && userAccess && (
				<Card style={ { marginTop: '20px' } }>
					<CardHeader>
						<h2 style={ { margin: 0 } }>{ __( 'Access Permissions', 'sahajanand-erp' ) }</h2>
					</CardHeader>
					<CardBody>
						{ userAccess.is_admin ? (
							<Notice status="warning" isDismissible={ false }>
								{ __( 'This user is an Administrator and has access to all modules by default.', 'sahajanand-erp' ) }
							</Notice>
						) : (
							<>
								<div style={ { marginBottom: '20px' } }>
									<p style={ { fontWeight: 500, marginBottom: '12px' } }>{ __( 'Allowed Modules', 'sahajanand-erp' ) }</p>
									{ Object.keys( capabilities ).map( ( cap ) => (
										<CheckboxControl
											key={ cap }
											label={ capabilities[ cap ] }
											checked={ !! userAccess.access[ cap ] }
											onChange={ ( checked ) => handleAccessChange( cap, checked ) }
										/>
									) ) }
									<p style={ { color: '#757575', fontSize: '13px', marginTop: '12px' } }>
										{ __( 'Check the modules this user should have access to.', 'sahajanand-erp' ) }
									</p>
								</div>
								
								<Button
									isPrimary
									isBusy={ saving }
									disabled={ saving }
									onClick={ handleSave }
								>
									{ saving ? __( 'Saving...', 'sahajanand-erp' ) : __( 'Save Permissions', 'sahajanand-erp' ) }
								</Button>
							</>
						) }
					</CardBody>
				</Card>
			) }
		</div>
	);
};

export default UserAccess;
