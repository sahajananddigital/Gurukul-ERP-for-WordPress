import { useState, useEffect, useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Flex, Button, Card, CardBody, Spinner } from '@wordpress/components';
import { ConfirmDialog } from '../../../components/wp-compat';
import { DataViews } from '@wordpress/dataviews';
import apiFetch from '@wordpress/api-fetch';
import EditModal from '../../../components/EditModal';

const SavedRepliesList = ( { addSnackbar } ) => {
	const [ replies, setReplies ] = useState( [] );
	const [ loading, setLoading ] = useState( true );
	const [ isModalOpen, setIsModalOpen ] = useState( false );
	const [ editingItem, setEditingItem ] = useState( null );
	const [ itemToDelete, setItemToDelete ] = useState( null );

	const fetchReplies = async () => {
		setLoading( true );
		try {
			const data = await apiFetch( {
				path: '/sahajanand-erp/v1/helpdesk/saved-replies',
			} );
			setReplies( data );
		} catch ( err ) {
			addSnackbar(
				__( 'Failed to fetch saved replies.', 'sahajanand-erp' )
			);
		} finally {
			setLoading( false );
		}
	};

	useEffect( () => {
		fetchReplies();
	}, [] );

	const handleSave = async ( data ) => {
		try {
			if ( editingItem && editingItem.id ) {
				await apiFetch( {
					path: `/sahajanand-erp/v1/helpdesk/saved-replies/${ editingItem.id }`,
					method: 'POST',
					data,
				} );
				addSnackbar( __( 'Saved reply updated.', 'sahajanand-erp' ) );
			} else {
				await apiFetch( {
					path: '/sahajanand-erp/v1/helpdesk/saved-replies',
					method: 'POST',
					data,
				} );
				addSnackbar( __( 'Saved reply created.', 'sahajanand-erp' ) );
			}
			setIsModalOpen( false );
			fetchReplies();
		} catch ( err ) {
			addSnackbar( __( 'Error saving reply.', 'sahajanand-erp' ) );
		}
	};

	const confirmDelete = async () => {
		if ( ! itemToDelete ) {
			return;
		}
		try {
			await apiFetch( {
				path: `/sahajanand-erp/v1/helpdesk/saved-replies/${ itemToDelete }`,
				method: 'DELETE',
			} );
			addSnackbar( __( 'Saved reply deleted.', 'sahajanand-erp' ) );
			fetchReplies();
		} catch ( err ) {
			addSnackbar( __( 'Error deleting reply.', 'sahajanand-erp' ) );
		}
		setItemToDelete( null );
	};

	const actions = useMemo(
		() => [
			{
				id: 'edit',
				label: __( 'Edit', 'sahajanand-erp' ),
				isPrimary: true,
				callback: ( items ) => {
					if ( items.length > 0 ) {
						setEditingItem( items[ 0 ] );
						setIsModalOpen( true );
					}
				},
			},
			{
				id: 'delete',
				label: __( 'Delete', 'sahajanand-erp' ),
				callback: ( items ) => {
					if ( items.length > 0 ) {
						setItemToDelete( items[ 0 ].id );
					}
				},
			},
		],
		[]
	);

	if ( loading ) {
		return <Spinner />;
	}

	return (
		<div>
			<Flex justify="flex-end" style={ { marginBottom: '16px' } }>
				<Button
					variant="primary"
					onClick={ () => {
						setEditingItem( null );
						setIsModalOpen( true );
					} }
				>
					{ __( 'Add Saved Reply', 'sahajanand-erp' ) }
				</Button>
			</Flex>

			<Card>
				<CardBody>
					<DataViews
						data={ replies }
						fields={ [
							{
								id: 'title',
								header: __( 'Title', 'sahajanand-erp' ),
								getValue: ( { item } ) => item.title,
							},
							{
								id: 'content',
								header: __( 'Content', 'sahajanand-erp' ),
								getValue: ( { item } ) =>
									item.content.length > 50
										? item.content.substring( 0, 50 ) +
											'...'
										: item.content,
							},
						] }
						actions={ actions }
						view={ {
							type: 'table',
							perPage: 20,
							page: 1,
							sort: { field: 'id', direction: 'desc' },
							search: '',
							filters: [],
							fields: [ 'title', 'content' ],
						} }
						onChangeView={ () => {} }
						defaultLayouts={ {
							table: { titleField: 'title' },
						} }
						paginationInfo={ {
							totalItems: replies.length,
							totalPages: 1,
						} }
					/>
				</CardBody>
			</Card>

			<EditModal
				title={
					editingItem
						? __( 'Edit Saved Reply', 'sahajanand-erp' )
						: __( 'Add Saved Reply', 'sahajanand-erp' )
				}
				isOpen={ isModalOpen }
				onClose={ () => setIsModalOpen( false ) }
				onSave={ handleSave }
				data={ editingItem }
				fields={ [
					{
						key: 'title',
						label: __( 'Title (e.g. Greeting)', 'sahajanand-erp' ),
						type: 'text',
					},
					{
						key: 'content',
						label: __( 'Content', 'sahajanand-erp' ),
						type: 'textarea',
					},
				] }
			/>

			<ConfirmDialog
				isOpen={ !! itemToDelete }
				onConfirm={ confirmDelete }
				onCancel={ () => setItemToDelete( null ) }
				confirmButtonText={ __( 'Delete', 'sahajanand-erp' ) }
			>
				{ __(
					'Are you sure you want to delete this saved reply?',
					'sahajanand-erp'
				) }
			</ConfirmDialog>
		</div>
	);
};
export default SavedRepliesList;
