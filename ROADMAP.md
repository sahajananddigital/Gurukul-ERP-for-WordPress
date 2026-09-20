# Sahajanand ERP - Future Roadmap

This document outlines the current state of the Sahajanand ERP WordPress plugin and the strategic vision for its future development.

## 🌟 Current State (V1.0)
The plugin has been successfully architected as a modern, Single Page Application (SPA) natively integrated into WordPress using React and `@wordpress/components`. 

**Core Modules Built:**
- **CRM Pipeline:** Full support for Contacts, Leads, Deals, and Organizations utilizing native Gutenberg `<DataViews />`.
- **Financials:** Accounting (Chart of Accounts, Transactions), Invoices, Expenses, and Vouchers.
- **Operations:** HR (Employee Management) and Helpdesk (Ticketing).
- **Settings & Access:** Centralized React settings and module-based role/capability management (User Access).
- **Add-on System:** Modular architecture supporting extensions like the `Gurukul Addon` (Donations, Food Pass, Calendar, etc.).

---

## 🚀 Future Roadmap

### Phase 1: Core Enhancements & Dashboard
*Targeting usability, data mobility, and top-level visibility.*
- [ ] **Global Dashboard Widgets:** Interactive charts and metrics (e.g., Revenue this month, Open Tickets, Deals in Pipeline) on the main `/dashboard` route.
- [ ] **Universal Import/Export:** Add CSV Import/Export buttons to all `<DataViews />` (currently only implemented in Contacts).
- [ ] **Advanced Filtering:** Multi-conditional filters and saved views for CRM and Accounting tables.
- [ ] **Global Search:** A unified search bar in the SPA header to find any Contact, Invoice, or Ticket instantly.

### Phase 2: Advanced CRM & Automation
*Transforming the CRM from a database into an active sales tool.*
- [ ] **Activity Timelines:** Log calls, emails, and notes directly on Lead and Deal profiles.
- [ ] **Email Integration:** Connect with SMTP/IMAP to send and receive client emails directly inside the CRM.
- [ ] **Workflow Automations:** Rule-based triggers (e.g., "If Deal stage = Closed Won, generate Invoice").
- [ ] **Quote & Proposal Builder:** Drag-and-drop builder to send proposals to Leads/Deals and convert them to Invoices.

### Phase 3: Robust Accounting & Payments
*Scaling financials for mid-sized businesses.*
- [ ] **Tax & Multi-Currency:** Configurable tax rates, tax groups, and multi-currency invoicing.
- [ ] **Payment Gateways:** Integrations with Stripe, PayPal, and Razorpay to allow clients to pay invoices via a public link.
- [ ] **Recurring Billing:** Automated recurring invoices and subscription management.
- [ ] **Bank Reconciliation:** Import bank statements (CSV/OFX) to match against internal transactions.

### Phase 4: Complete HR & Payroll
*Expanding beyond basic employee directories.*
- [ ] **Leave Management:** PTO requests, approvals, and holiday calendars.
- [ ] **Attendance Tracking:** Clock-in/clock-out system and timesheets.
- [ ] **Payroll Generation:** Automated salary calculation, tax deductions, and PDF payslip generation.

### Phase 5: Client Portal & Helpdesk
*Empowering clients and reducing support overhead.*
- [ ] **Frontend Client Portal:** A secure frontend area where clients can log in to view invoices, pay bills, and submit support tickets.
- [ ] **Helpdesk SLAs & Escalations:** Automated SLA tracking, ticket routing to specific departments, and escalation rules.
- [ ] **Knowledge Base:** Integrated FAQ and documentation builder linked to the Helpdesk.

### Phase 6: Ecosystem & Integrations
*Making Sahajanand ERP the central hub of business operations.*
- [ ] **Webhook Engine:** Fire webhooks on any entity creation/update to integrate with external systems.
- [ ] **Zapier / Make Integration:** Official apps for low-code automation platforms.
- [ ] **WooCommerce Sync:** Two-way sync for customers (CRM) and orders (Invoices/Accounting).
- [ ] **Add-on Marketplace:** In-app browser to discover, purchase, and install premium modules directly from the dashboard.
