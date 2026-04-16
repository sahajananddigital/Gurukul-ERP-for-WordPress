import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { Button, Notice, Modal, Spinner } from '@wordpress/components';

/**
 * Reusable Admin CRUD Component
 *
 * @param {Object}   props
 * @param {string}   props.title             - Page Title
 * @param {string}   props.apiPath           - Base API path (e.g., '/wp-erp/v1/content/daily')
 * @param {string}   props.entityName        - Name of the entity for messages (e.g., 'Quote', 'Darshan')
 * @param {Array}    props.columns           - Table columns config: [{ label: 'Date', render: (item) => ... }]
 * @param {Object}   props.defaultFormState  - Initial state for the form
 * @param {Function} props.renderForm        - ({ state, setState, isEditing }) => JSX
 * @param {Function} props.prepareSubmitData - (state) => Object to submit
 */
export default function AdminCrud( {
	title,
	apiPath,
	entityName,
	columns,
	defaultFormState,
	renderForm,
	prepareSubmitData,
} ) {
	const [ view, setView ] = useState( 'list' );
	const [ items, setItems ] = useState( [] );
	const [ loading, setLoading ] = useState( true );
	const [ editItem, setEditItem ] = useState( null );
	const [ notice, setNotice ] = useState( null );
	const [ deleteId, setDeleteId ] = useState( null );
	const [ formState, setFormState ] = useState( defaultFormState );

	const fetchItems = () => {
		setLoading( true );
		apiFetch( { path: apiPath } )
			.then( ( data ) => {
				// Handle paginated response (new format) or simple array (old format)
				const itemsData = data.data ? data.data : data;
				setItems( itemsData );
				setLoading( false );
			} )
			.catch( ( err ) => {
				// eslint-disable-next-line no-console
				console.error( err );
				setLoading( false );
				setNotice( {
					status: 'error',
					message: 'Error loading data.',
				} );
			} );
	};

	useEffect( () => {
		fetchItems();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	const startEdit = ( item ) => {
		setEditItem( item );
		// Merge item data into form state (handling discrepancies if any)
		// We assume item keys match form state keys or parent handles it
		// For complex mapping, we might need a prop `mapItemToForm`
		setFormState( { ...defaultFormState, ...item } );
		setView( 'create' );
		setNotice( null );
	};

	const confirmDelete = () => {
		if ( ! deleteId ) {
			return;
		}

		apiFetch( {
			path: `${ apiPath }/${ deleteId }`,
			method: 'DELETE',
		} )
			.then( () => {
				setNotice( {
					status: 'success',
					message: `${ entityName } deleted successfully.`,
				} );
				fetchItems();
				setDeleteId( null );
			} )
			.catch( ( err ) => {
				setNotice( {
					status: 'error',
					message: `Error deleting ${ entityName }.`,
				} );
				console.error( err );
				setDeleteId( null );
			} );
	};

	const handleSubmit = () => {
		const data = prepareSubmitData
			? prepareSubmitData( formState )
			: formState;

		let request;
		if ( editItem ) {
			request = apiFetch( {
				path: `${ apiPath }/${ editItem.id }`,
				method: 'POST', // Using POST for update per our API pattern
				data,
			} );
		} else {
			request = apiFetch( {
				path: apiPath,
				method: 'POST',
				data,
			} );
		}

		request
			.then( ( res ) => {
				setNotice( {
					status: 'success',
					message: editItem
						? `${ entityName } updated!`
						: `${ entityName } created!`,
				} );
				setView( 'list' );
				setEditItem( null );
				fetchItems();
				resetForm();
			} )
			.catch( ( err ) => {
				setNotice( {
					status: 'error',
					message: 'Error saving data. Please check inputs.',
				} );
				console.error( err );
			} );
	};

	const resetForm = () => {
		setFormState( defaultFormState );
		setEditItem( null );
	};

	const handleCancel = () => {
		setView( 'list' );
		resetForm();
		setNotice( null );
	};

	return (
		<div className="wrap">
			<h1 className="wp-heading-inline">{ title }</h1>
			{ view === 'list' && (
				<Button
					isPrimary
					onClick={ () => {
						resetForm();
						setView( 'create' );
					} }
				>
					Add New
				</Button>
			) }
			<hr className="wp-header-end" />

			{ notice && (
				<div style={ { margin: '15px 0' } }>
					<Notice
						status={ notice.status }
						isDismissible={ true }
						onRemove={ () => setNotice( null ) }
					>
						{ notice.message }
					</Notice>
				</div>
			) }

			{ view === 'create' ? (
				<div
					style={ {
						maxWidth: '600px',
						marginTop: '20px',
						background: '#fff',
						padding: '20px',
						borderRadius: '4px',
						boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
					} }
				>
					<h2 style={ { marginTop: 0 } }>
						{ editItem
							? `Edit ${ entityName }`
							: `Add New ${ entityName }` }
					</h2>

					{ /* Render Specific Form Fields */ }
					{ renderForm( {
						state: formState,
						setState: setFormState,
						isEditing: !! editItem,
					} ) }

					<div
						style={ {
							display: 'flex',
							gap: '10px',
							marginTop: '20px',
						} }
					>
						<Button isPrimary onClick={ handleSubmit }>
							{ editItem ? 'Update' : 'Publish' }
						</Button>
						<Button isSecondary onClick={ handleCancel }>
							Cancel
						</Button>
					</div>
				</div>
			) : (
				<div style={ { marginTop: '20px' } }>
					{ loading ? (
						<Spinner />
					) : (
						<table className="wp-list-table widefat fixed striped">
							<thead>
								<tr>
									{ columns.map( ( col, idx ) => (
										<th key={ idx }>{ col.label }</th>
									) ) }
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{ items.map( ( item ) => (
									<tr key={ item.id }>
										{ columns.map( ( col, idx ) => (
											<td key={ idx }>
												{ col.render( item ) }
											</td>
										) ) }
										<td>
											<Button
												isSmall
												isSecondary
												onClick={ () =>
													startEdit( item )
												}
												style={ { marginRight: '5px' } }
											>
												Edit
											</Button>
											<Button
												isSmall
												isDestructive
												onClick={ () =>
													setDeleteId( item.id )
												}
											>
												Delete
											</Button>
										</td>
									</tr>
								) ) }
								{ items.length === 0 && (
									<tr>
										<td colSpan={ columns.length + 1 }>
											No items found.
										</td>
									</tr>
								) }
							</tbody>
						</table>
					) }
				</div>
			) }

			{ deleteId && (
				<Modal
					title={ `Delete ${ entityName }` }
					onRequestClose={ () => setDeleteId( null ) }
					style={ { maxWidth: '400px' } }
				>
					<div style={ { padding: '0 16px 16px' } }>
						<p>
							Are you sure you want to delete this{ ' ' }
							{ entityName.toLowerCase() }? This action cannot be
							undone.
						</p>
						<div
							style={ {
								marginTop: '20px',
								display: 'flex',
								gap: '10px',
								justifyContent: 'flex-end',
							} }
						>
							<Button
								isSecondary
								onClick={ () => setDeleteId( null ) }
							>
								Cancel
							</Button>
							<Button isDestructive onClick={ confirmDelete }>
								Delete
							</Button>
						</div>
					</div>
				</Modal>
			) }
		</div>
	);
}
