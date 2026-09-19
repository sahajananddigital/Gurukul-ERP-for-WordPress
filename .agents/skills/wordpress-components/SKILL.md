---
name: wordpress-components
description: >-
  Use this skill when developing React UI components for the WordPress plugin.
  It provides guidelines on using @wordpress/components and @wordpress/dataviews
  to match the native WordPress Full Site Editing (FSE) UI.
---

# WordPress Components and FSE UI Guidelines

When building the Single Page Application (SPA) for the plugin's admin interface, always use native WordPress components to ensure a seamless user experience.

## Primary Component Libraries

1. **`@wordpress/components`**: Use this for all foundational UI elements.
   - Layout: `Flex`, `FlexItem`, `Grid`, `Card`
   - Inputs: `TextControl`, `SelectControl`, `ToggleControl`, `CheckboxControl`
   - Buttons/Actions: `Button`, `ButtonGroup`, `DropdownMenu`
   - Overlays: `Modal`, `Popover`, `Tooltip`
   - Navigation: Use standard lists styled with WordPress classes or components like `Navigation` (if available in the version) or compose using `Button` with icons.

2. **`@wordpress/dataviews`**: (Experimental/Modern) Use this for all list screens and data tables (e.g., listing Subscriptions, Contacts, Transactions).
   - This package powers the modern Site Editor list views.
   - It provides filtering, sorting, and pagination out-of-the-box in a standardized UI.

## FSE Sidebar Implementation

To match the FSE UI (as seen in the Site Editor):
- The layout should consist of a dark sidebar taking up `100vh` and a main content area.
- Hide default WP menus using CSS (`#wpadminbar`, `#adminmenuwrap` -> `display: none;`).
- The sidebar should include a "Back to WP Admin" link at the top (pointing to `admin_url()`) with the WordPress logo icon.
- Use `react-router-dom` to handle navigation between the sidebar links and the main content area without full page reloads.

## Styling
- Do not write custom CSS for basic UI elements. Rely on the properties provided by `@wordpress/components` (e.g., `variant="primary"`, `size="small"`).
- If custom spacing is needed, use the `__experimental*` spacing props if available on the component, or standard flexbox utilities.

## Reference
- [Gutenberg Storybook](https://wordpress.github.io/gutenberg/?path=/docs/docs-introduction--page)
- When in doubt, search the `@wordpress/components` source or standard documentation for the correct component to use instead of building custom HTML.
