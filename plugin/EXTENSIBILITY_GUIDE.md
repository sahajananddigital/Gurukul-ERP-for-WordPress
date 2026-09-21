# Advanced Concepts: Extensibility & Interactivity

This guide covers advanced WordPress architecture concepts for the Sahajanand ERP plugin. As the ERP grows, it needs to be extensible for custom addons and performant on the frontend. We follow WordPress Core standards for extensibility (SlotFills and JS Filters) and frontend performance (Interactivity API).

**References:**
* [JavaScript Filters](https://developer.wordpress.org/block-editor/reference-guides/filters/)
* [SlotFills](https://developer.wordpress.org/block-editor/reference-guides/slotfills/)
* [Interactivity API](https://developer.wordpress.org/block-editor/reference-guides/interactivity-api/)

---

## 1. SlotFills (React Extensibility)

The **SlotFill** pattern is WordPress's standard way of allowing plugins and addons to inject React UI components into predefined areas of an application without modifying the core application code. 

For the ERP, this is how we will allow custom addons (like an HR extension or custom CRM module) to inject widgets into the main Dashboard or add new tabs to settings pages.

### How it works
1. **The Slot:** You define a `<Slot>` in the core ERP React app where you want third-party UI to appear.
2. **The Fill:** Addon developers use a `<Fill>` to inject their UI into that Slot.

### Code Example
First, import the components from `@wordpress/components`:

```javascript
import { Slot, Fill, createSlotFill } from '@wordpress/components';

// 1. Create a custom SlotFill pair for the ERP Dashboard
const { Slot: DashboardWidgetSlot, Fill: DashboardWidgetFill } = createSlotFill(
    'SahajanandERPDashboardWidget'
);

// 2. In your core ERP Dashboard UI, output the Slot:
export const Dashboard = () => (
    <div className="erp-dashboard">
        <h1>Dashboard</h1>
        {/* Core widgets go here */}
        
        {/* Addons will inject their widgets here */}
        <DashboardWidgetSlot /> 
    </div>
);

// 3. In a separate Addon file, use the Fill to inject a widget:
export const MyCustomAddonWidget = () => (
    <DashboardWidgetFill>
        <div className="custom-addon-widget">
            <h3>HR Statistics</h3>
            <p>Active employees: 42</p>
        </div>
    </DashboardWidgetFill>
);
```

---

## 2. JavaScript Filters

Just like PHP hooks (`apply_filters` and `add_action`), WordPress provides a robust JavaScript hooks system via the `@wordpress/hooks` package. This allows you to modify settings, intercept data, or alter configurations dynamically.

### Use Cases for ERP
* Filtering data payloads before they are sent via API.
* Modifying default configurations for UI components.
* Extending block settings if the ERP registers custom Gutenberg blocks.

### Code Example
```javascript
import { addFilter, applyFilters } from '@wordpress/hooks';

// 1. Core ERP applies a filter to a configuration object
let config = { theme: 'light', showSidebar: true };
config = applyFilters( 'sahajanand_erp.dashboard_config', config );

// 2. An Addon intercepts and modifies the configuration
addFilter(
    'sahajanand_erp.dashboard_config', // Hook name
    'sahajanand-erp/custom-addon',     // Namespace (prevents collisions)
    ( currentConfig ) => {
        // Force the sidebar to be hidden
        return {
            ...currentConfig,
            showSidebar: false
        };
    }
);
```

---

## 3. Interactivity API (Frontend Performance)

The **Interactivity API** is the modern WordPress standard for adding frontend interactions (like toggles, live search, tabs, or modals) without loading heavy React bundles on the frontend. It uses HTML directives (similar to Alpine.js or Vue) mapped to a lightweight JavaScript state.

### Use Cases for ERP
While the ERP admin panel is built heavily in React, if the ERP exposes **frontend portals** (e.g., an employee login portal, a public job board, or front-end shortcodes/blocks), you should use the Interactivity API to ensure blazing-fast load times.

### How it works
1. **State:** You define the interactive state in PHP (using `wp_interactivity_state()`) or JavaScript.
2. **Directives:** You add `data-wp-*` attributes to your HTML markup to bind elements to the state.

### Code Example (Frontend HTML/PHP)
```php
<?php
// Set initial state for the module
wp_interactivity_state( 'sahajanandErp', array(
    'isFormVisible' => false,
) );
?>

<!-- data-wp-interactive defines the namespace -->
<div data-wp-interactive="sahajanandErp">
    
    <!-- data-wp-on binds event listeners -->
    <button data-wp-on--click="actions.toggleForm">
        Toggle Contact Form
    </button>
    
    <!-- data-wp-bind binds HTML attributes to state -->
    <div data-wp-bind--hidden="!state.isFormVisible">
        <form>
            <!-- Form fields -->
        </form>
    </div>
    
</div>
```

### Code Example (Frontend JS)
```javascript
import { store } from '@wordpress/interactivity';

// Define the logic that the HTML directives point to
store( 'sahajanandErp', {
    state: {
        get isFormVisible() {
            // Computed state logic (optional)
        }
    },
    actions: {
        toggleForm: ( { state } ) => {
            // Mutate state
            state.isFormVisible = ! state.isFormVisible;
        }
    }
} );
```

---

## Summary
* **Use SlotFills** to allow addons to extend the React Admin UI visually.
* **Use JS Filters** to allow addons to alter data and configurations safely.
* **Use Interactivity API** for any frontend shortcodes or blocks to maximize performance and avoid heavy React DOM rendering.
