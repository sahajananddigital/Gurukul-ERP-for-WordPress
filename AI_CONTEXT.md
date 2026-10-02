# Project Context: Sahajanand ERP & Mobile App

**Usage**: Provide this document to any LLM/AI assistant to establish immediate context for the project.

## 1. Project Overview
**Name**: Sahajanand ERP (Monorepo)
**Goal**: A comprehensive management system for a Gurukul (spiritual educational institute) consisting of a WordPress Backend and a React Native Mobile App.

### Directory Structure
- **root**: Monorepo root.
- **`plugin/`**: WordPress Plugin ("Sahajanand ERP").
    - Acts as the Backend, Admin Panel, and API Provider.
- **`app/`**: React Native Mobile Application ("Gurukul App").
    - Built with **Expo** (Managed workflow).

## 2. Technical Stack & Standards

### A. Backend (WordPress Plugin)
- **Namespace/Prefix**: `Sahajanand_ERP`, `sahajanand-erp`.
- **API Architecture**:
    - **Controller Pattern**: specific controllers per module (e.g., `SAHAJANAND_ERP_API_Content`, `SAHAJANAND_ERP_API_CRM`) in `plugin/includes/api/`.
    - **Base Class**: All controllers extend `SAHAJANAND_ERP_API_Controller`.
    - **Caching**: implement `Cache-Control` headers for GET requests.
    - **Security**: Follow [WP Security Standards](https://developer.wordpress.org/apis/security/) (Sanatization, Escaping, Nonces, Capabilities).
- **Admin UI Pattern (FSE SPA)**:
    - **React-First SPA**: The plugin UI completely replaces the standard WordPress admin layout (hiding the default sidebar and top bar). It mounts a single React application on `admin.php?page=sahajanand-erp-app`.
    - **Implementation**: The SPA uses `react-router-dom` to navigate between modules without page reloads.
    - **Components**: Strictly use `@wordpress/components` (e.g., Flex, Button, Navigation) to build the layout, and the experimental `@wordpress/dataviews` for modern, FSE-style list/table views.
    - **Reference**: [Gutenberg Storybook](https://wordpress.github.io/gutenberg/?path=/docs/docs-introduction--page).
    - **Media**: Use `wp.media` (WordPress Native Uploader) within the React App for image handling. Enqueue scripts via `admin_enqueue_scripts`.
    - **Build System & Testing**:
        - Tools: `@wordpress/scripts`.
        - Command: `npm run build` (Compiles React sources from `src/` to `build/`).
        - Entry Point: `plugin/src/index.js` renders the Master Layout holding the Sidebar and Routing.
        - **Unit Tests**: Use `jest` and `@testing-library/react`.
        - **E2E Tests**: Use `wp-scripts test-e2e` with `@wordpress/env` (Playwright-based).
- **Modules & Addons**:
    - **Core Modules**: Located in `plugin/modules/`. Provide free, core functionality.
    - **Premium Addons**: Managed via `SAHAJANAND_ERP_Addon_Manager` and exposed to the SPA to display active/inactive premium features.

### B. Frontend (Mobile App)
- **Framework**: **React Native** with **Expo**.
- **Navigation**: **Expo Router** (File-based routing in `app/app/`).
- **Styling**:
    - **Theming**: Support Light and Dark modes.
    - **Colors**: Use Saffron/Red/Orange accents (Gurukul branding). Defined in `constants/Colors.ts`.
    - **Typography**:
        - **Font**: "Anek Gujarati" (Google Fonts).
        - Ensure global font loading in Expo layout.
- **Localization**:
    - **Primary**: Gujarati (`gu`) and English (`en`).
    - Tool: `i18n-js`.
    - Service: `services/i18n.ts` manages translations.
- **API Client**: `axios` configured in `services/api.ts` with `BASE_URL` pointing to local WP.
    - Use platform-specific hosts (e.g., 127.0.0.1 for Android Emulator, localhost for iOS Simulator).
- **Components**:
    - Reusable UI elements in `components/` (e.g., `Themed.tsx`).

## 3. Key Feature Implementations

### Content Module (Daily Darshan)
- **Purpose**: Upload daily photos of the deity.
- **Backend**:
    - **CPT**: `daily_darshan` (Hidden from menu).
    - **Storage**:
        - Date: `post_title`.
        - Time: Meta `_darshan_time` ('morning'/'evening').
        - Images: Meta `_darshan_gallery_ids` (Comma-separated attachment IDs).
    - **API**:
        - `GET /content/daily-darshan`: Returns list with full image URLs.
        - `POST /content/daily-darshan`: Create new.
        - `POST /content/daily-darshan/{id}`: Update.
        - `DELETE /content/daily-darshan/{id}`: Delete.
- **Admin UI**:
    - Custom React App located at `plugin/src/modules/content/App.js` using `AdminCrud`.
    - Features: List View, Create/Edit Form, Date Picker, Media Uploader.

### Content Module (Daily Quotes)
- **Purpose**: Upload daily inspirational quotes.
- **Backend**:
    - **Table**: `sahajanand_erp_daily_quotes` (Custom Table).
    - **API**: `SAHAJANAND_ERP_API_Quotes` (Direct SQL access).
- **Admin UI**:
    - Located at `plugin/src/modules/quotes/App.js`.
    - Uses `AdminCrud` component.

## 4. User Preferences
- **Modularity**: Keep code separated by module. Don't build monolithic files.
- **UI Quality**: The App and Admin UI should feel "App-like" and modern.
- **CRUD**: Always provide full Create/Read/Update/Delete capabilities for data modules.
- **Testing**:
    - Plugin: Use `npm run playground` to run a local WP instance.
    - App: Use `npx expo start`.

## 5. Mobile App - Critical Troubleshooting

### A. Navigation & Routing
**Issue**: Dashboard grid items navigate to "Screen doesn't exist" error.

**Root Cause**: 
- API was returning simple route names (e.g., `"DailyDarshan"`)
- Expo Router requires file-system paths (e.g., `"/dashboard/daily-darshan"`)

**Solution**:
1. **Root Layout**: Ensure `app/app/_layout.tsx` registers the `dashboard` route:
   ```tsx
   <Stack.Screen name="dashboard" options={{ headerShown: false }} />
   ```

2. **Client-Side Route Mapping**: In `app/app/(tabs)/index.tsx`, map stable IDs to correct paths:
   ```tsx
   const RouteMap: Record<string, string> = {
     daily_darshan: '/dashboard/daily-darshan',
     daily_quotes: '/dashboard/daily-quotes',
     daily_update: '/dashboard/daily-updates',
     // ... etc
   };
   ```
   Use `router.push(RouteMap[item.id])` instead of `router.push(item.route)`.

3. **Dashboard Layout**: Create `app/app/dashboard/_layout.tsx`:
   ```tsx
   import { Stack } from 'expo-router';
   export default Stack;
   ```

### B. Image Loading on Mobile Devices
**Issue**: Images don't load or show placeholders despite valid URLs.

**Root Causes**:
1. WordPress returns `localhost` URLs which are inaccessible from mobile devices
2. Large "full size" images (5MB+) cause memory issues on mobile
3. Network caching can persist failed attempts

**Solutions**:

1. **Fallback Image Component** (Frontend):
   ```tsx
   const DarshanImage = ({ uri }: { uri: string }) => {
       const [error, setError] = useState(false);
       const fallback = require('../../assets/images/daily_darshan.png');
       
       useEffect(() => setError(false), [uri]);
       
       return (
           <Image 
               source={error ? fallback : { uri }} 
               style={styles.image}
               onError={() => setError(true)}
           />
       );
   };
   ```

2. **Cache Busting** (when needed):
   ```tsx
   uri={`${img.url}?t=${new Date().getTime()}`}
   ```

3. **Android Cleartext Traffic**: Ensure `app/app.json` includes:
   ```json
   "android": {
     "usesCleartextTraffic": true
   }
   ```

### C. API Configuration
- **BASE_URL** in `app/services/api.ts` must match your environment:
  - **Android Emulator**: `http://127.0.0.1:9400/wp-json/sahajanand-erp/v1`
  - **iOS Simulator / Web**: `http://localhost:9400/wp-json/sahajanand-erp/v1`
  - **Physical Device**: Use your machine's LAN IP if testing on a real device.

### D. Metro Bundler Cache Issues
When adding new screens/routes:
```bash
npm start -- -c  # Clear cache
```


## 6. Architecture & Extension Guidelines (Agent Context)

The following sub-sections contain detailed architectural references for the ERP.

# Sahajanand ERP - Gutenberg Components Style Guide

This document serves as a style guide and reference for the UI components available for developing the WordPress admin interface of this plugin. We strictly use the `@wordpress/components` library to ensure our plugin perfectly matches the native WordPress design system (Full Site Editing / Gutenberg style).

**Reference:** [WordPress Storybook (Gutenberg Components)](https://wordpress.github.io/gutenberg/?path=/docs/introduction--page)

## 📦 How to Import
All components listed below should be imported from the `@wordpress/components` package:
```javascript
import { Button, PanelBody, TextControl } from '@wordpress/components';
```

---

## 🛠 Available Components Directory

### 1. Inputs & Form Controls
Standard data-entry components.
*   **`TextControl`**: Standard text input field.
*   **`TextareaControl`**: Multi-line text input field.
*   **`SelectControl`**: Standard dropdown select menu.
*   **`CustomSelectControl`**: Highly customizable styled dropdown.
*   **`CheckboxControl`**: Single checkbox input.
*   **`RadioControl`**: Radio button group.
*   **`ToggleControl`**: A switch/toggle input (often used for on/off settings).
*   **`FormToggle`**: The visual switch without the label wrapper.
*   **`RangeControl`**: A slider control for numeric values.
*   **`NumberControl`**: An input specifically for numbers.
*   **`FormTokenField`**: A tagging input field (e.g., adding multiple tags or categories).
*   **`SearchControl`**: Input optimized for search queries with clear buttons.
*   **`BaseControl`**: The wrapper used to provide labels and help text to custom inputs.

### 2. Buttons & Actions
*   **`Button`**: The core interactive element. Supports variations: `isPrimary`, `isSecondary`, `isTertiary`, `isDestructive`, `isLink`.
*   **`ButtonGroup`**: A wrapper to visually group related buttons together.
*   **`ClipboardButton`**: A button that automatically copies a given text to the clipboard.

### 3. Layout & Structure
*   **`Panel` / `PanelBody` / `PanelRow`**: The standard collapsible boxes used in the WordPress sidebar and admin screens.
*   **`Card` / `CardBody` / `CardHeader` / `CardFooter`**: A clean, white box with a border for grouping content.
*   **`Flex` / `FlexItem`**: Flexbox utility components for layout.
*   **`VStack` / `HStack`**: Vertical and horizontal stack layouts for consistent spacing between children.
*   **`Grid`**: CSS Grid wrapper.
*   **`Surface`**: The foundational component for backgrounds and borders.
*   **`Divider`**: A horizontal line to separate content.
*   **`Spacer`**: A component purely for adding consistent vertical or horizontal margins.

### 4. Overlays & Dialogs
*   **`Modal`**: A dialog window that blocks interactions with the underlying page. Use for major tasks or warnings.
*   **`ConfirmDialog`**: A pre-styled modal specifically for confirming destructive actions.
*   **`Popover`**: A floating layer anchored to an element (like a tooltip with interactive content).
*   **`Tooltip`**: A small floating text box showing on hover.
*   **`Notice`**: A banner for alerts (success, error, warning, info).
*   **`Snackbar`**: A lightweight notification that pops up from the bottom of the screen.

### 5. Pickers & Advanced Inputs
*   **`ColorPicker` / `ColorPalette`**: Standard UI for picking colors.
*   **`DateTimePicker` / `DatePicker`**: Calendar and time inputs.
*   **`FontSizePicker`**: A specialized control for selecting typography sizes.
*   **`AnglePickerControl`**: A circular UI for selecting degrees/angles.
*   **`GradientPicker` / `DuotonePicker`**: Specialized color pickers.

### 6. Navigation & Menus
*   **`Tabs` / `TabPanel`**: Tabbed navigation for switching between views.
*   **`Dropdown` / `DropdownMenu`**: A button that opens a Popover containing a list of actions.
*   **`MenuGroup` / `MenuItem`**: The interactive list items to place inside Dropdowns.
*   **`TreeSelect`**: A select control displaying hierarchical data (like categories).

### 7. Media & Feedback
*   **`Icon`**: The SVG wrapper component.
*   **`Dashicon`**: Standard WordPress legacy icons.
*   **`Spinner`**: The standard WordPress loading circle.
*   **`ProgressBar`**: A horizontal loading indicator.
*   **`FormFileUpload` / `DropZone`**: Components for handling drag-and-drop or file upload selection.

### 8. Typography
*   **`Text`**: A basic wrapper for text enforcing WordPress standard typography.
*   **`Heading`**: For standard, consistent H1-H6 sizes.
*   **`TextHighlight`**: Used for highlighting a search term within a block of text.

---

## 🎨 Best Practices for Plugin Development
1. **Never use raw HTML inputs**: Use `<TextControl>` instead of `<input type="text" />` to inherit WP styling, focus rings, and accessibility features.
2. **Icons**: Use `@wordpress/icons` alongside the `<Icon />` component rather than adding custom SVGs when a core equivalent exists.
3. **Data Fetching**: Use `@wordpress/api-fetch` combined with `@wordpress/data` (or standard React state) to populate your components.
4. **Spacing**: Rely on `VStack`, `HStack`, or `Flex` rather than writing custom margin/padding CSS classes.


# WordPress Packages Reference Guide

This document provides a reference for the `@wordpress/*` packages used in our ERP application. While the [Components Style Guide](./COMPONENTS_GUIDE.md) focuses purely on UI elements, this guide covers the architectural and utility packages that power the logic, state, and ecosystem of our plugin.

**Reference:** [WordPress Block Editor Packages](https://developer.wordpress.org/block-editor/reference-guides/packages/)

---

## 🏗 Core Architecture Packages

### `@wordpress/element`
An abstraction layer atop React. It allows us to use React components in WordPress without explicitly requiring `react` and `react-dom` as direct dependencies in our compiled code, ensuring compatibility with the version of React bundled with WordPress core.
*   **Usage:** Use `import { useState, useEffect } from '@wordpress/element';` instead of importing directly from `react`.

### `@wordpress/data`
The core state management module for WordPress, built heavily upon the Redux architecture. It manages data hubs (stores) across the admin application.
*   **Key Hooks:** `useSelect` (to read data from a store) and `useDispatch` (to trigger actions).
*   **Usage:**
    ```javascript
    import { useSelect, useDispatch } from '@wordpress/data';
    const items = useSelect( ( select ) => select( 'wp-erp/data' ).getItems() );
    ```

### `@wordpress/api-fetch`
A utility package to make asynchronous requests to the WordPress REST API. It handles nonce authentication automatically, meaning you don't need to manually pass headers for authorized admin requests.
*   **Usage:**
    ```javascript
    import apiFetch from '@wordpress/api-fetch';
    apiFetch( { path: '/wp-erp/v1/content/dashboard' } ).then( ... );
    ```

### `@wordpress/hooks`
A JavaScript implementation of the classic WordPress hooks API (`do_action`, `apply_filters`). It allows our JavaScript modules to be extensible by other developers or addons.
*   **Key functions:** `addAction`, `doAction`, `addFilter`, `applyFilters`.

### `@wordpress/i18n`
The internationalization (i18n) package. It allows strings in JavaScript to be translated into different languages, mirroring PHP functions like `__()`, `_e()`, and `sprintf()`.
*   **Key functions:** `__`, `_x`, `_n`, `sprintf`.
*   **Usage:**
    ```javascript
    import { __ } from '@wordpress/i18n';
    const label = __( 'Save Settings', 'sahajanand-erp' );
    ```

---

## 🧩 UI & Logic Utilities

### `@wordpress/components`
The primary User Interface library. It contains all the buttons, inputs, modals, and layout containers needed to build interfaces that match WordPress's native look and feel.
*   *(See `COMPONENTS_GUIDE.md` for the full directory of components).*

### `@wordpress/dataviews`
A modern WordPress package designed for building robust, data-driven interfaces. It provides pre-built patterns for rendering lists, tables, and grids of data with built-in sorting, filtering, and pagination.
*   **Usage:** Highly recommended for our ERP's list tables (e.g., viewing all invoices, contacts, or HR records).

### `@wordpress/compose`
A collection of Higher-Order Components (HOCs) and custom React hooks used to simplify complex logic (like debouncing, window resizing, keyboard navigation, or instance IDs).
*   **Key Hooks:** `useInstanceId`, `usePrevious`, `useViewportMatch`.

### `@wordpress/icons`
The official repository of SVG icons used within the Gutenberg editor. It is meant to be used in conjunction with the `<Icon />` component from `@wordpress/components`.
*   **Usage:**
    ```javascript
    import { Icon } from '@wordpress/components';
    import { check } from '@wordpress/icons';
    <Icon icon={check} />
    ```

---

## 🛠 Development & Tooling Packages

### `@wordpress/scripts`
The official build tool for WordPress development. It wraps Webpack, Babel, ESLint, and Prettier into a single configuration-free dependency.
*   **Commands:** `wp-scripts build`, `wp-scripts start`, `wp-scripts lint-js`.

### `@wordpress/env`
A zero-configuration local WordPress development environment powered by Docker. It spins up a WordPress instance with your plugin mounted automatically.
*   **Commands:** `wp-env start`, `wp-env stop`, `wp-env destroy`.

### `@wordpress/e2e-test-utils-playwright`
Playwright utilities tailored specifically for WordPress end-to-end testing, making it easy to mock API requests, log in as an admin, and interact with WordPress UI elements.


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
