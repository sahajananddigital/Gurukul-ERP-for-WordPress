# DataViews Migration Guide

We are migrating our legacy HTML tables to the `@wordpress/dataviews` component for a native FSE experience.

**Target Files to Migrate:**
You have been assigned specific files to migrate. Please replace any `<table className="wp-list-table">` with the `<DataViews />` component.

## Step 1: Imports
Import `DataViews`:
```javascript
import { DataViews } from '@wordpress/dataviews';
import { useState, useMemo } from '@wordpress/element';
```

## Step 2: Define State
Inside your component, set up the view state:
```javascript
const [ view, setView ] = useState( {
    type: 'table',
    perPage: 20,
    page: 1,
    sort: { field: 'id', direction: 'desc' },
    search: '',
    filters: [],
    fields: [ 'field1', 'field2' ], // Update with actual field IDs
} );
```

## Step 3: Define Fields
Use `useMemo` to define the fields based on the old table headers:
```javascript
const fields = useMemo( () => [
    {
        id: 'field1',
        header: __( 'Field 1', 'wp-erp' ),
        getValue: ( { item } ) => item.field1 || '-',
        enableSorting: true,
    },
    // Add custom rendering if necessary:
    {
        id: 'status',
        header: __( 'Status', 'wp-erp' ),
        getValue: ( { item } ) => item.status,
        render: ( { item } ) => (
            <span style={{ backgroundColor: '#eee', padding: '4px' }}>{item.status}</span>
        ),
    }
], [] );

const defaultLayouts = {
    table: {
        layout: { primaryField: 'field1' }, // Set the primary field ID
    },
};
```

## Step 4: Replace Table
Replace the old `<table>...</table>` with:
```javascript
<div style={ { backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '4px' } }>
    <DataViews
        data={ dataArray }
        fields={ fields }
        actions={ [] }
        view={ view }
        onChangeView={ setView }
        defaultLayouts={ defaultLayouts }
        paginationInfo={ {
            totalItems: dataArray.length,
            totalPages: Math.ceil( dataArray.length / view.perPage ),
        } }
    />
</div>
```

**IMPORTANT**: Ensure you do not remove any outer `<TabPanel>` logic or form logic if it's in the same file! Only replace the actual `renderList` table logic.
