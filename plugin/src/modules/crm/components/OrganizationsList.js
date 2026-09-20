/**
 * Organizations List Component
 */

import { __ } from '@wordpress/i18n';
import { useState, useMemo } from '@wordpress/element';
import { Flex, Spinner, Notice } from '@wordpress/components';
import { DataViews } from '@wordpress/dataviews';
import EditModal from '../../../components/EditModal';
import { updateOrganization } from '../services/api';

const OrganizationsList = ( { organizations, loading, onOrganizationUpdated } ) => {
	const [ isEditModalOpen, setIsEditModalOpen ] = useState( false );
	const [ editingOrganization, setEditingOrganization ] = useState( null );

	const [ view, setView ] = useState( {
		type: 'table',
		perPage: 20,
		page: 1,
		sort: {
			field: 'id',
			direction: 'desc',
		},
		search: '',
		filters: [],
		fields: [ 'name', 'industry', 'website' ],
	} );

	const handleEdit = ( organization ) => {
		setEditingOrganization( organization );
		setIsEditModalOpen( true );
	};

	const handleSave = async ( data ) => {
		try {
			await updateOrganization( data );
			if ( onOrganizationUpdated ) {
				onOrganizationUpdated();
			}
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.error( error );
		}
	};

	const fields = useMemo( () => [
		{
			id: 'name',
			header: __( 'Name', 'wp-erp' ),
			getValue: ( { item } ) => item.name || '-',
			enableSorting: true,
		},
		{
			id: 'industry',
			header: __( 'Industry', 'wp-erp' ),
			getValue: ( { item } ) => item.industry || '-',
			enableSorting: true,
		},
		{
			id: 'website',
			header: __( 'Website', 'wp-erp' ),
			getValue: ( { item } ) => item.website || '-',
		},
	], [] );

	const actions = useMemo( () => [
		{
			id: 'edit',
			label: __( 'Edit', 'wp-erp' ),
			isPrimary: true,
			callback: ( items ) => {
				if ( items.length > 0 ) {
					handleEdit( items[ 0 ] );
				}
			},
		},
	], [] );

	const defaultLayouts = {
		table: {
			layout: {
				primaryField: 'name',
			},
		},
	};

	if ( loading ) {
		return (
			<Flex justify="center" style={ { padding: '32px' } }>
				<Spinner />
			</Flex>
		);
	}

	const organizationFields = [
		{ key: 'name', label: __( 'Name', 'wp-erp' ), type: 'text' },
		{ key: 'industry', label: __( 'Industry', 'wp-erp' ), type: 'text' },
		{ key: 'website', label: __( 'Website', 'wp-erp' ), type: 'text', inputType: 'url' },
	];

	return (
		<div>
			{ organizations.length === 0 ? (
				<Notice status="info" isDismissible={ false }>
					{ __( 'No organizations found.', 'wp-erp' ) }
				</Notice>
			) : (
				<div style={ { backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '4px' } }>
					<DataViews
						data={ organizations }
						fields={ fields }
						actions={ actions }
						view={ view }
						onChangeView={ setView }
						defaultLayouts={ defaultLayouts }
						paginationInfo={ {
							totalItems: organizations.length,
							totalPages: Math.ceil( organizations.length / view.perPage ),
						} }
					/>
				</div>
			) }

			<EditModal
				title={ __( 'Edit Organization', 'wp-erp' ) }
				isOpen={ isEditModalOpen }
				onClose={ () => setIsEditModalOpen( false ) }
				onSave={ handleSave }
				data={ editingOrganization }
				fields={ organizationFields }
			/>
		</div>
	);
};

export default OrganizationsList;
