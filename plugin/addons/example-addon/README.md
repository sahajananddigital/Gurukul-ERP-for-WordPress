# Example Addon for WP ERP

This is an example addon demonstrating how to extend WP ERP functionality.

## Installation

1. Copy this folder to `/wp-content/sahajanand-erp-addons/example-addon/`
2. Go to WP ERP > Addons in WordPress admin
3. Activate the addon

## Structure

```
example-addon/
  ├── example-addon.php    # Main addon file
  └── README.md            # This file
```

## How It Works

The addon hooks into WP ERP's initialization process and adds custom functionality. You can:

- Add custom admin pages
- Extend existing modules
- Add new REST API endpoints
- Hook into WP ERP actions and filters

## Example Usage

```php
// Hook into WP ERP initialization
add_action( 'sahajanand_erp_init', function() {
    // Your custom code here
});

// Access modules
$crm = sahajanand_erp_get_module( 'crm' );

// Check if module is active
if ( sahajanand_erp_is_module_active( 'crm' ) ) {
    // Your code
}
```

## Creating Your Own Addon

1. Create a new folder in `/wp-content/sahajanand-erp-addons/`
2. Create a main PHP file with your addon class
3. Follow the naming convention: `SAHAJANAND_ERP_Addon_Your_Addon_Name`
4. Register your addon in the WP ERP addons table

