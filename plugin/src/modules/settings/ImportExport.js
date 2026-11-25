import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	Card,
	CardHeader,
	CardBody,
	Button,
	Notice,
	SelectControl,
	CheckboxControl,
	Spinner,
} from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';

const ImportExport = () => {
	// Settings states
	const [ importingSettings, setImportingSettings ] = useState( false );
	const [ settingsFile, setSettingsFile ] = useState( null );
	const [ settingsNotice, setSettingsNotice ] = useState( null );

	// Data states
	const [ dataFormat, setDataFormat ] = useState( 'json' );
	const [ selectedModules, setSelectedModules ] = useState( {
		crm: true,
		accounting: true,
		hr: true,
		helpdesk: true,
	} );
	const [ csvDataset, setCsvDataset ] = useState( 'contacts' );
	const [ exportingData, setExportingData ] = useState( false );

	const [ importFile, setImportFile ] = useState( null );
	const [ importMode, setImportMode ] = useState( 'append' );
	const [ importDataset, setImportDataset ] = useState( 'contacts' );
	const [ importingData, setImportingData ] = useState( false );
	const [ dataNotice, setDataNotice ] = useState( null );

	// Download helper
	const triggerDownload = ( blob, filename ) => {
		const url = window.URL.createObjectURL( blob );
		const a = document.createElement( 'a' );
		a.href = url;
		a.download = filename;
		document.body.appendChild( a );
		a.click();
		window.URL.revokeObjectURL( url );
		document.body.removeChild( a );
	};

	// 1. Export Settings
	const handleExportSettings = async () => {
		try {
			const res = await apiFetch( { path: '/sahajanand-erp/v1/settings/export' } );
			const blob = new Blob( [ JSON.stringify( res, null, 2 ) ], { type: 'application/json' } );
			triggerDownload( blob, `sahajanand-erp-settings-${ new Date().toISOString().slice( 0, 10 ) }.json` );
			setSettingsNotice( { type: 'success', message: __( 'Settings exported successfully!', 'sahajanand-erp' ) } );
		} catch ( err ) {
			setSettingsNotice( { type: 'error', message: err.message || __( 'Failed to export settings.', 'sahajanand-erp' ) } );
		}
	};

	// 2. Import Settings
	const handleImportSettings = async () => {
		if ( ! settingsFile ) {
			setSettingsNotice( { type: 'error', message: __( 'Please select a JSON settings file to import.', 'sahajanand-erp' ) } );
			return;
		}

		setImportingSettings( true );
		setSettingsNotice( null );

		const formData = new FormData();
		formData.append( 'file', settingsFile );

		try {
			const res = await apiFetch( {
				path: '/sahajanand-erp/v1/settings/import',
				method: 'POST',
				body: formData,
			} );
			setSettingsNotice( { type: 'success', message: res.message || __( 'Settings imported successfully!', 'sahajanand-erp' ) } );
			setSettingsFile( null );
		} catch ( err ) {
			setSettingsNotice( { type: 'error', message: err.message || __( 'Failed to import settings.', 'sahajanand-erp' ) } );
		} finally {
			setImportingSettings( false );
		}
	};

	// 3. Export Data
	const handleExportData = async () => {
		setExportingData( true );
		setDataNotice( null );

		try {
			if ( dataFormat === 'csv' ) {
				const query = new URLSearchParams( {
					format: 'csv',
					dataset: csvDataset,
					download: '1',
				} ).toString();

				const res = await window.fetch( `/wp-json/sahajanand-erp/v1/data/export?${ query }`, {
					headers: {
						'X-WP-Nonce': window.sahajanandErp ? window.sahajanandErp.nonce : '',
					},
				} );

				if ( ! res.ok ) {
					throw new Error( __( 'Failed to generate CSV export.', 'sahajanand-erp' ) );
				}

				const blob = await res.blob();
				triggerDownload( blob, `sahajanand-erp-${ csvDataset }-${ new Date().toISOString().slice( 0, 10 ) }.csv` );
			} else {
				const activeList = Object.keys( selectedModules ).filter( ( k ) => selectedModules[ k ] );
				const modulesParam = activeList.length === 4 ? 'all' : activeList.join( ',' );

				const res = await apiFetch( {
					path: `/sahajanand-erp/v1/data/export?modules=${ modulesParam }&format=json`,
				} );

				const blob = new Blob( [ JSON.stringify( res, null, 2 ) ], { type: 'application/json' } );
				triggerDownload( blob, `sahajanand-erp-backup-${ new Date().toISOString().slice( 0, 10 ) }.json` );
			}

			setDataNotice( { type: 'success', message: __( 'Data exported successfully!', 'sahajanand-erp' ) } );
		} catch ( err ) {
			setDataNotice( { type: 'error', message: err.message || __( 'Failed to export data.', 'sahajanand-erp' ) } );
		} finally {
			setExportingData( false );
		}
	};

	// 4. Import Data
	const handleImportData = async () => {
		if ( ! importFile ) {
			setDataNotice( { type: 'error', message: __( 'Please choose a file to import.', 'sahajanand-erp' ) } );
			return;
		}

		setImportingData( true );
		setDataNotice( null );

		const formData = new FormData();
		formData.append( 'file', importFile );
		formData.append( 'mode', importMode );
		if ( importFile.name.endsWith( '.csv' ) ) {
			formData.append( 'dataset', importDataset );
		}

		try {
			const res = await apiFetch( {
				path: '/sahajanand-erp/v1/data/import',
				method: 'POST',
				body: formData,
			} );

			const importedTotal = res.total || 0;
			const details = res.imported
				? Object.entries( res.imported )
						.map( ( [ k, v ] ) => `${ k }: ${ v }` )
						.join( ', ' )
				: '';

			setDataNotice( {
				type: 'success',
				message: `${ __( 'Data imported successfully!', 'sahajanand-erp' ) } (${ importedTotal } records: ${ details })`,
			} );
			setImportFile( null );
		} catch ( err ) {
			setDataNotice( { type: 'error', message: err.message || __( 'Failed to import data.', 'sahajanand-erp' ) } );
		} finally {
			setImportingData( false );
		}
	};

	return (
		<div className="sahajanand-erp-settings" style={ { padding: '40px', maxWidth: '850px', margin: '0 auto' } }>
			<div style={ { marginBottom: '32px' } }>
				<h1 style={ { margin: 0, fontSize: '24px', fontWeight: 600 } }>
					{ __( 'Import & Export', 'sahajanand-erp' ) }
				</h1>
				<p style={ { color: '#666', marginTop: '4px' } }>
					{ __( 'Backup or restore your ERP settings and business records across CRM, Accounting, HR, and Helpdesk.', 'sahajanand-erp' ) }
				</p>
			</div>

			{ /* SETTINGS SECTION */ }
			<Card style={ { marginBottom: '24px' } }>
				<CardHeader>
					<h2 style={ { margin: 0, fontSize: '16px', fontWeight: 600 } }>
						{ __( 'Settings Backup & Restore', 'sahajanand-erp' ) }
					</h2>
				</CardHeader>
				<CardBody>
					{ settingsNotice && (
						<Notice status={ settingsNotice.type } isDismissible={ false } style={ { marginBottom: '16px' } }>
							{ settingsNotice.message }
						</Notice>
					) }

					<div style={ { display: 'flex', gap: '32px', flexWrap: 'wrap' } }>
						{ /* Export Settings */ }
						<div style={ { flex: 1, minWidth: '280px' } }>
							<h3 style={ { fontSize: '14px', marginTop: 0 } }>{ __( 'Export Settings', 'sahajanand-erp' ) }</h3>
							<p style={ { fontSize: '13px', color: '#666' } }>
								{ __( 'Download your current general ERP configuration and module preferences as a JSON file.', 'sahajanand-erp' ) }
							</p>
							<Button isSecondary onClick={ handleExportSettings }>
								{ __( 'Export Settings (JSON)', 'sahajanand-erp' ) }
							</Button>
						</div>

						{ /* Import Settings */ }
						<div style={ { flex: 1, minWidth: '280px', borderLeft: '1px solid #e0e0e0', paddingLeft: '32px' } }>
							<h3 style={ { fontSize: '14px', marginTop: 0 } }>{ __( 'Import Settings', 'sahajanand-erp' ) }</h3>
							<p style={ { fontSize: '13px', color: '#666' } }>
								{ __( 'Restore configuration from a previously exported settings JSON file.', 'sahajanand-erp' ) }
							</p>
							<input
								type="file"
								accept=".json"
								onChange={ ( e ) => setSettingsFile( e.target.files[ 0 ] ) }
								style={ { marginBottom: '12px', display: 'block' } }
							/>
							<Button
								isPrimary
								isBusy={ importingSettings }
								disabled={ ! settingsFile || importingSettings }
								onClick={ handleImportSettings }
							>
								{ importingSettings ? __( 'Importing...', 'sahajanand-erp' ) : __( 'Import Settings', 'sahajanand-erp' ) }
							</Button>
						</div>
					</div>
				</CardBody>
			</Card>

			{ /* DATA EXPORT SECTION */ }
			<Card style={ { marginBottom: '24px' } }>
				<CardHeader>
					<h2 style={ { margin: 0, fontSize: '16px', fontWeight: 600 } }>
						{ __( 'Export Data', 'sahajanand-erp' ) }
					</h2>
				</CardHeader>
				<CardBody>
					{ dataNotice && (
						<Notice status={ dataNotice.type } isDismissible={ false } style={ { marginBottom: '16px' } }>
							{ dataNotice.message }
						</Notice>
					) }

					<div style={ { display: 'flex', gap: '20px', marginBottom: '16px' } }>
						<div style={ { width: '200px' } }>
							<SelectControl
								label={ __( 'Format', 'sahajanand-erp' ) }
								value={ dataFormat }
								options={ [
									{ label: 'JSON (Full Backup)', value: 'json' },
									{ label: 'CSV (Single Dataset)', value: 'csv' },
								] }
								onChange={ ( val ) => setDataFormat( val ) }
							/>
						</div>

						{ dataFormat === 'csv' && (
							<div style={ { width: '240px' } }>
								<SelectControl
									label={ __( 'Dataset to Export', 'sahajanand-erp' ) }
									value={ csvDataset }
									options={ [
										{ label: 'CRM Contacts', value: 'contacts' },
										{ label: 'CRM Leads', value: 'leads' },
										{ label: 'CRM Deals', value: 'deals' },
										{ label: 'CRM Organizations', value: 'organizations' },
										{ label: 'Accounting Accounts', value: 'accounts' },
										{ label: 'Accounting Invoices', value: 'invoices' },
										{ label: 'Accounting Expenses', value: 'expenses' },
										{ label: 'Accounting Vouchers', value: 'vouchers' },
										{ label: 'HR Employees', value: 'employees' },
										{ label: 'Helpdesk Tickets', value: 'tickets' },
										{ label: 'Helpdesk Mailboxes', value: 'mailboxes' },
									] }
									onChange={ ( val ) => setCsvDataset( val ) }
								/>
							</div>
						) }
					</div>

					{ dataFormat === 'json' && (
						<div style={ { marginBottom: '20px' } }>
							<label style={ { fontWeight: 500, fontSize: '13px', display: 'block', marginBottom: '8px' } }>
								{ __( 'Select Modules to Include in Backup:', 'sahajanand-erp' ) }
							</label>
							<div style={ { display: 'flex', gap: '20px' } }>
								<CheckboxControl
									label={ __( 'CRM', 'sahajanand-erp' ) }
									checked={ selectedModules.crm }
									onChange={ ( val ) => setSelectedModules( { ...selectedModules, crm: val } ) }
								/>
								<CheckboxControl
									label={ __( 'Accounting', 'sahajanand-erp' ) }
									checked={ selectedModules.accounting }
									onChange={ ( val ) => setSelectedModules( { ...selectedModules, accounting: val } ) }
								/>
								<CheckboxControl
									label={ __( 'HR', 'sahajanand-erp' ) }
									checked={ selectedModules.hr }
									onChange={ ( val ) => setSelectedModules( { ...selectedModules, hr: val } ) }
								/>
								<CheckboxControl
									label={ __( 'Helpdesk', 'sahajanand-erp' ) }
									checked={ selectedModules.helpdesk }
									onChange={ ( val ) => setSelectedModules( { ...selectedModules, helpdesk: val } ) }
								/>
							</div>
						</div>
					) }

					<Button
						isPrimary
						isBusy={ exportingData }
						disabled={ exportingData }
						onClick={ handleExportData }
					>
						{ exportingData ? __( 'Exporting...', 'sahajanand-erp' ) : __( 'Export Data', 'sahajanand-erp' ) }
					</Button>
				</CardBody>
			</Card>

			{ /* DATA IMPORT SECTION */ }
			<Card>
				<CardHeader>
					<h2 style={ { margin: 0, fontSize: '16px', fontWeight: 600 } }>
						{ __( 'Import Data', 'sahajanand-erp' ) }
					</h2>
				</CardHeader>
				<CardBody>
					<p style={ { fontSize: '13px', color: '#666', marginTop: 0 } }>
						{ __( 'Upload a JSON backup file or CSV file to import records directly into your ERP database.', 'sahajanand-erp' ) }
					</p>

					<div style={ { display: 'flex', gap: '20px', marginBottom: '16px', flexWrap: 'wrap' } }>
						<div style={ { width: '220px' } }>
							<SelectControl
								label={ __( 'Import Mode', 'sahajanand-erp' ) }
								value={ importMode }
								options={ [
									{ label: __( 'Append (Keep existing)', 'sahajanand-erp' ), value: 'append' },
									{ label: __( 'Replace (Overwrite existing)', 'sahajanand-erp' ), value: 'replace' },
								] }
								onChange={ ( val ) => setImportMode( val ) }
							/>
						</div>

						{ importFile && importFile.name.endsWith( '.csv' ) && (
							<div style={ { width: '240px' } }>
								<SelectControl
									label={ __( 'CSV Target Dataset', 'sahajanand-erp' ) }
									value={ importDataset }
									options={ [
										{ label: 'CRM Contacts', value: 'contacts' },
										{ label: 'CRM Leads', value: 'leads' },
										{ label: 'CRM Deals', value: 'deals' },
										{ label: 'CRM Organizations', value: 'organizations' },
										{ label: 'Accounting Accounts', value: 'accounts' },
										{ label: 'Accounting Invoices', value: 'invoices' },
										{ label: 'Accounting Expenses', value: 'expenses' },
										{ label: 'Accounting Vouchers', value: 'vouchers' },
										{ label: 'HR Employees', value: 'employees' },
										{ label: 'Helpdesk Tickets', value: 'tickets' },
										{ label: 'Helpdesk Mailboxes', value: 'mailboxes' },
									] }
									onChange={ ( val ) => setImportDataset( val ) }
								/>
							</div>
						) }
					</div>

					<div style={ { marginBottom: '20px' } }>
						<input
							type="file"
							accept=".json,.csv"
							onChange={ ( e ) => setImportFile( e.target.files[ 0 ] ) }
							style={ { display: 'block' } }
						/>
					</div>

					<Button
						isPrimary
						isBusy={ importingData }
						disabled={ ! importFile || importingData }
						onClick={ handleImportData }
					>
						{ importingData ? __( 'Importing Data...', 'sahajanand-erp' ) : __( 'Import Data', 'sahajanand-erp' ) }
					</Button>
				</CardBody>
			</Card>
		</div>
	);
};

export default ImportExport;
