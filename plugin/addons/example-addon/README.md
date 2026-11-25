# Example Addon for Sahajanand ERP

This is an example addon demonstrating how to extend Sahajanand ERP functionality using modern PHP 8+ and PSR-4 architecture.

## Installation

1. Copy this folder to `/wp-content/sahajanand-erp-addons/example-addon/`
2. Go to Sahajanand ERP > Addons in WordPress admin
3. Activate the addon

## Structure

```
example-addon/
  ├── example-addon.php    # Main addon class extending AbstractModule
  └── README.md            # Documentation and guide
```

## How It Works

The addon implements PSR-4 architecture under the `SahajanandERP\Addons` namespace and extends `SahajanandERP\Abstracts\AbstractModule`.

- **Modern Module Pattern**: Extends `\SahajanandERP\Abstracts\AbstractModule` and implements `\SahajanandERP\Interfaces\ModuleInterface`.
- **Auto-registration**: Registers automatically with `ModuleManager` on `sahajanand_erp_init`.
- **REST APIs**: Can register custom routes using `\SahajanandERP\Abstracts\AbstractController`.
- **UI Integration**: Injects custom admin views or hooks into the modern SPA React app.

## Example Usage

```php
declare(strict_types=1);

namespace SahajanandERP\Addons;

use SahajanandERP\Abstracts\AbstractModule;

class ExampleAddon extends AbstractModule {
    public string $slug = 'example-addon';
    public string $name = 'Example Addon';

    public function init(): void {
        add_action( 'sahajanand_erp_init', function() {
            // Access core ERP services
            $erp = Sahajanand_ERP();
            $crm = $erp->modules->get_module( 'crm' );
        } );
    }
}

new ExampleAddon();
```

## Creating Your Own Addon

1. Create a folder in `/wp-content/sahajanand-erp-addons/<addon-slug>/`
2. Create the main entry file `<addon-slug>/<addon-slug>.php`
3. Name your class `\SahajanandERP\Addons\<PascalCaseSlug>` or `<PascalCaseSlug>`
4. Extend `\SahajanandERP\Abstracts\AbstractModule` for seamless integration
5. The `AddonManager` handles discovery and activation automatically
