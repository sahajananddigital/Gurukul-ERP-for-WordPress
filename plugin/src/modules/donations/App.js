/**
 * Donations Module App
 */
import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	Notice,
	TabPanel,
} from '@wordpress/components';
import {
	fetchLedgers as fetchLedgersApi,
	fetchDonations as fetchDonationsApi,
} from './services/api';
import CreateDonation from './components/CreateDonation';
import DonationHistory from './components/DonationHistory';
import LedgerSettings from './components/LedgerSettings';

const DonationsApp = () => {
	const [ donations, setDonations ] = useState( [] );
	const [ ledgers, setLedgers ] = useState( [] );
	const [ loading, setLoading ] = useState( true );
	const [ error, setError ] = useState( null );
	const [ activeTab, setActiveTab ] = useState( 'create' );
	const [ donationsLoaded, setDonationsLoaded ] = useState( false );

	useEffect( () => {
		loadLedgers();
	}, [] );

	useEffect( () => {
		if ( activeTab === 'history' && ! donationsLoaded ) {
			loadDonations();
		}
	}, [ activeTab, donationsLoaded ] );

	const loadLedgers = async () => {
		const data = await fetchLedgersApi();
		setLedgers( data );
	};

	const loadDonations = async () => {
		setLoading( true );
		try {
			const data = await fetchDonationsApi();
			setDonations( data );
			setDonationsLoaded( true );
		} catch ( err ) {
			setError( err.message );
		} finally {
			setLoading( false );
		}
	};

	const handleDonationCreated = ( newDonation ) => {
		if ( donationsLoaded ) {
			setDonations( [ newDonation, ...donations ] );
		} else {
			// If not loaded yet, invalidate to force fetch next time history is viewed
			setDonationsLoaded( false );
		}
	};

	const handleLedgersUpdated = ( updatedLedgers ) => {
		setLedgers( updatedLedgers );
	};

	return (
		<div className="wp-erp-donations" style={ { padding: '20px' } }>
			{ error && (
				<Notice status="error" onRemove={ () => setError( null ) }>
					{ error }
				</Notice>
			) }

			<TabPanel
				className="wp-erp-donations-tabs"
				activeClass="is-active"
				initialTabName="create"
				onSelect={ setActiveTab }
				tabs={ [
					{
						name: 'create',
						title: 'Create Donation',
						className: 'tab-create',
					},
					{
						name: 'history',
						title: 'History',
						className: 'tab-history',
					},
					{
						name: 'settings',
						title: 'Settings',
						className: 'tab-settings',
					},
				] }
			>
				{ ( tab ) => {
					if ( tab.name === 'create' ) {
						return (
							<CreateDonation
								ledgers={ ledgers }
								onDonationCreated={ handleDonationCreated }
							/>
						);
					}
					if ( tab.name === 'history' ) {
						return (
							<DonationHistory
								donations={ donations }
								loading={ loading }
							/>
						);
					}
					if ( tab.name === 'settings' ) {
						return (
							<LedgerSettings
								ledgers={ ledgers }
								onLedgersUpdated={ handleLedgersUpdated }
							/>
						);
					}
				} }
			</TabPanel>
		</div>
	);
};

export default DonationsApp;
