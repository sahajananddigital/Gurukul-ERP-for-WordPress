import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	Card,
	CardBody,
	CardHeader,
	Flex,
	Button,
	Icon,
	Spinner,
	Notice,
} from '@wordpress/components';
import { Grid, Heading, Text, VStack } from '../../components/wp-compat';
import { plugins } from '@wordpress/icons';
import apiFetch from '@wordpress/api-fetch';

const AddonsApp = () => {
	const [ addons, setAddons ] = useState( [] );
	const [ loading, setLoading ] = useState( true );
	const [ busyKey, setBusyKey ] = useState( null );
	const [ error, setError ] = useState( null );

	const fetchAddons = async () => {
		try {
			const data = await apiFetch( {
				path: '/sahajanand-erp/v1/addons',
			} );
			setAddons( Array.isArray( data ) ? data : [] );
			setError( null );
		} catch ( err ) {
			setError(
				err.message || __( 'Failed to load add-ons.', 'sahajanand-erp' )
			);
		} finally {
			setLoading( false );
		}
	};

	useEffect( () => {
		fetchAddons();
	}, [] );

	const toggleAddon = async ( addon ) => {
		setBusyKey( addon.key );
		try {
			await apiFetch( {
				path: `/sahajanand-erp/v1/addons/${ addon.key }`,
				method: 'POST',
				data: { active: Number( addon.active ) ? 0 : 1 },
			} );
			await fetchAddons();
		} catch ( err ) {
			setError(
				err.message ||
					__( 'Failed to update the add-on.', 'sahajanand-erp' )
			);
		} finally {
			setBusyKey( null );
		}
	};

	if ( loading ) {
		return (
			<Flex justify="center" style={ { padding: '48px' } }>
				<Spinner />
			</Flex>
		);
	}

	return (
		<VStack spacing={ 5 } style={ { padding: '24px 40px' } }>
			<VStack spacing={ 1 }>
				<Heading level={ 1 }>
					{ __( 'Premium Add-ons', 'sahajanand-erp' ) }
				</Heading>
				<Text variant="muted">
					{ __(
						'Extend Sahajanand ERP with additional modules. Add-ons placed in wp-content/sahajanand-erp-addons appear here.',
						'sahajanand-erp'
					) }
				</Text>
			</VStack>

			{ error && (
				<Notice status="error" isDismissible={ false }>
					{ error }
				</Notice>
			) }

			{ addons.length === 0 ? (
				<Card>
					<CardBody>
						<Flex align="center" gap={ 3 }>
							<Icon icon={ plugins } />
							<VStack spacing={ 0 }>
								<Text weight={ 600 }>
									{ __(
										'No add-ons installed',
										'sahajanand-erp'
									) }
								</Text>
								<Text variant="muted">
									{ __(
										'Upload an add-on to wp-content/sahajanand-erp-addons to see it listed here.',
										'sahajanand-erp'
									) }
								</Text>
							</VStack>
						</Flex>
					</CardBody>
				</Card>
			) : (
				<Grid columns={ [ 1, 2, 3 ] } gap={ 5 }>
					{ addons.map( ( addon ) => {
						const isActive = Number( addon.active ) > 0;
						return (
							<Card key={ addon.key }>
								<CardHeader>
									<VStack spacing={ 0 }>
										<Heading level={ 4 }>
											{ addon.name }
										</Heading>
										<Text variant="muted" size="12px">
											{ addon.version
												? `v${ addon.version }`
												: '' }
											{ addon.author
												? ` · ${ addon.author }`
												: '' }
										</Text>
									</VStack>
								</CardHeader>
								<CardBody>
									<VStack spacing={ 4 }>
										<Text>
											{ addon.description ||
												__(
													'No description provided.',
													'sahajanand-erp'
												) }
										</Text>
										<Flex
											justify="space-between"
											align="center"
										>
											<Text weight={ 600 }>
												{ isActive
													? __(
															'Active',
															'sahajanand-erp'
														)
													: __(
															'Inactive',
															'sahajanand-erp'
														) }
											</Text>
											<Button
												variant={
													isActive
														? 'secondary'
														: 'primary'
												}
												isBusy={ busyKey === addon.key }
												disabled={ !! busyKey }
												onClick={ () =>
													toggleAddon( addon )
												}
											>
												{ isActive
													? __(
															'Deactivate',
															'sahajanand-erp'
														)
													: __(
															'Activate',
															'sahajanand-erp'
														) }
											</Button>
										</Flex>
									</VStack>
								</CardBody>
							</Card>
						);
					} ) }
				</Grid>
			) }
		</VStack>
	);
};

export default AddonsApp;
