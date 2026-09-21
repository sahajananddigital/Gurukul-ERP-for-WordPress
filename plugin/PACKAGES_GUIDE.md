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
