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
		<div className="sahajanand-erp-food-pass">
			{ error && (
				<Notice
					status="error"
					isDismissible={ false }
					onRemove={ () => setError( null ) }
				>
					{ error }
				</Notice>
			) }

			<div style={{ padding: '32px 40px', borderBottom: '1px solid #e0e0e0' }}> <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}> { __('Food Pass Management', 'sahajanand-erp') } </h1> </div>
			<div style={{ padding: '0 40px' }}>
					<TabPanel
						className="sahajanand-erp-food-pass-tabs"
						activeClass="is-active"
						initialTabName={ activeTab }
						onSelect={ ( tabName ) => setActiveTab( tabName ) }
						tabs={ [
							{
								name: 'create',
								title: __( 'Create Food Pass', 'sahajanand-erp' ),
								className: 'tab-create',
							},
							{
								name: 'list',
								title: __( 'All Food Passes', 'sahajanand-erp' ),
								className: 'tab-list',
							},
							{
								name: 'reports',
								title: __( 'Reports', 'sahajanand-erp' ),
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
			</div>
		</div>
	);
};

export default FoodPassApp;
