/**
 * Food Pass Module App
 */
import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	Card,
	CardBody,
	CardHeader,
	Notice,
	TabPanel,
} from '@wordpress/components';
import { fetchFoodPasses as fetchPassesApi } from './services/api';
import CreateFoodPass from './components/CreateFoodPass';
import FoodPassList from './components/FoodPassList';
import FoodPassReports from './components/FoodPassReports';

const FoodPassApp = ( { view = 'create' } ) => {
	const [ foodPasses, setFoodPasses ] = useState( [] );
	const [ loading, setLoading ] = useState( true );
	const [ error, setError ] = useState( null );
	const [ activeTab, setActiveTab ] = useState(
		view === 'list' ? 'list' : 'create'
	);

	useEffect( () => {
		if ( activeTab === 'list' || activeTab === 'reports' ) {
			loadData();
		}
	}, [ activeTab ] );

	const loadData = async () => {
		setLoading( true );
		setError( null );
		try {
			const data = await fetchPassesApi();
			setFoodPasses( data );
		} catch ( err ) {
			setError( err.message );
		} finally {
			setLoading( false );
		}
	};

	const handleFoodPassCreated = () => {
		// Switch to list view or just reload data if we stay on create?
		// Original logic: reset form (handled in component)
		// But we probably want to fetch data so 'list' & 'reports' rely on fresh data.
		// If we stay on 'create', we don't need to fetch immediately unless we want the list prepared.
		// But let's fetch silently.
		fetchPassesApi()
			.then( setFoodPasses )
			.catch( () => {} );
		// Original logic didn't switch tabs, just reset form.
	};

	return (
		<div className="wp-erp-food-pass" style={ { padding: '16px' } }>
			{ error && (
				<Notice
					status="error"
					isDismissible={ false }
					onRemove={ () => setError( null ) }
				>
					{ error }
				</Notice>
			) }

			<Card>
				<CardHeader>
					<h2 style={ { margin: 0 } }>
						{ __( 'Food Pass Management', 'wp-erp' ) }
					</h2>
				</CardHeader>
				<CardBody>
					<TabPanel
						className="wp-erp-food-pass-tabs"
						activeClass="is-active"
						initialTabName={ activeTab }
						onSelect={ ( tabName ) => setActiveTab( tabName ) }
						tabs={ [
							{
								name: 'create',
								title: __( 'Create Food Pass', 'wp-erp' ),
								className: 'tab-create',
							},
							{
								name: 'list',
								title: __( 'All Food Passes', 'wp-erp' ),
								className: 'tab-list',
							},
							{
								name: 'reports',
								title: __( 'Reports', 'wp-erp' ),
								className: 'tab-reports',
							},
						] }
					>
						{ ( tab ) => {
							if ( tab.name === 'list' ) {
								return (
									<FoodPassList
										foodPasses={ foodPasses }
										loading={ loading }
									/>
								);
							} else if ( tab.name === 'reports' ) {
								return (
									<FoodPassReports
										foodPasses={ foodPasses }
									/>
								);
							}
							return (
								<CreateFoodPass
									onFoodPassCreated={ handleFoodPassCreated }
								/>
							);
						} }
					</TabPanel>
				</CardBody>
			</Card>
		</div>
	);
};

export default FoodPassApp;
