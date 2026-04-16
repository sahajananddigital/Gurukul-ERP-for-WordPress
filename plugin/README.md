# Gurukul ERP for WordPress

A comprehensive ERP solution for WordPress with extensible addon support. Includes CRM, Accounting, HR, and Helpdesk modules built with Gutenberg native UI. Specifically tailored for Gurukul management.

## Features

- **Modular Architecture**: Extensible plugin structure for custom addons.
- **Gutenberg UI**: Native WordPress Gutenberg components for a modern interface.
- **Core Modules**:
  - **CRM**: Contact management, lead tracking, customer relationships.
    - **Import/Export**: Import contacts from CSV; Export as CSV or PDF.
    - **Sample Template**: Downloadable sample CSV for easy data prep.
  - **Accounting**: Chart of accounts, transactions, billing.
  - **Invoices**: Create and manage invoices for your clients.
  - **HR**: Employee management, leave requests.
  - **Helpdesk**: Ticket management system.
- **Specialized Modules**:
  - **Daily Darshan**: Manage and display daily sacred images with zoom and slide capabilities.
  - **Daily Quotes**: Manage spiritual quotes and thoughts of the day.
  - **Satsang & Programs**: Schedule and manage daily programs and satsang updates.
  - **Expenses**: Track and categorize your company/institution expenses.
  - **Food Pass**: Manage daily meal passes for students/employees with reporting.
  - **Donations**: Donation receipting system with donor history and ledger management.
- **Bidirectional WP User Sync**: Automatically sync CRM contacts with WordPress users. Users created in CRM can log in to the website/app instantly.
- **REST API**: Full REST API for all modules, powering the integrated Mobile App.
- **User Management**: Granular access control to assign specific modules to specific users.

## Installation

1. Upload the plugin to the `/wp-content/plugins/` directory.
2. Activate the plugin through the 'Plugins' menu in WordPress.
3. The plugin will automatically create/update necessary database tables using `dbDelta`.

## Development Workflow

We use a unified Node.js environment to manage both JavaScript and PHP tools.

### Prerequisites
- Node.js 16+ and npm
- PHP 7.4+
- Composer (managed via npm)

### Setup
```bash
npm install
npm run composer install
```

### Build & Format
```bash
# Build production assets
npm run build

# Watch for development changes
npm start

# Format code (JS and PHP)
npm run format
```

### Quality Assurance
```bash
# Lint JavaScript code
npm run lint:js

# Lint PHP code (WordPress Coding Standards)
npm run lint:php

# Run unit tests (Jest)
npm run test

# Run E2E tests (Playwright + wp-env)
npm run test:e2e
```

## API Endpoints

### CRM
- `GET /wp-erp/v1/crm/contacts` - Get all contacts
- `POST /wp-erp/v1/crm/contacts` - Create contact
- `POST /wp-erp/v1/crm/import` - Import contacts via CSV
- `GET /wp-erp/v1/crm/export` - Export contacts (format: `csv` or `pdf`)
- `GET /wp-erp/v1/crm/import/sample` - Download sample CSV template

### Content (Darshan/Quotes)
- `GET /wp-erp/v1/content/daily-darshan` - Get latest darshan images
- `POST /wp-erp/v1/content/daily-darshan` - Upload/Manage darshan

## License

GPL v3 or later

## Credits

Developed by Sahajanand Digital.
