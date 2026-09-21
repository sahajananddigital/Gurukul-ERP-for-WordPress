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
