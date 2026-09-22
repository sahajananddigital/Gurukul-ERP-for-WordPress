# 🗺️ Product Roadmap & Implementation Plan

## Goal Description
You are entirely correct: the current state of the application is a **CRUD boilerplate**. We have polished the UI to be native and stable, but it lacks the actual business workflows and "deep" features that make tools like FreeScout, HubSpot, or BambooHR useful to actual teams.

Fortunately, my research into your database (`class-sahajanand-erp-database.php`) shows that the foundational tables for these advanced features (e.g., `erp_helpdesk_ticket_replies` and `erp_crm_activities`) **already exist** in your schema! They just don't have backend APIs or frontend UIs built for them yet.

This plan establishes a high-level roadmap for every module, followed by a **Detailed Technical Implementation Plan** for our first target: transforming the **Helpdesk** module into a FreeScout-style system.

---

## 📅 High-Level ERP Feature Roadmap

Here is the overarching product vision for each module moving forward. If this aligns with your goals, we will execute them module-by-module.

### 1. Helpdesk Module (Inspired by FreeScout / Zendesk)
*   **Threaded Conversations:** Instead of a modal to "Edit" a ticket, clicking a ticket opens a full conversation view.
*   **Replies & Internal Notes:** Ability to add customer-facing replies vs. internal team notes.
*   **Status Workflows & Assignees:** Easily reassign tickets and transition statuses (Open -> Pending -> Resolved).
*   **Rich Text Editor:** Support for rich text formatting in replies.

### 2. CRM Module (Inspired by HubSpot / Pipedrive)
*   **Activity Timeline:** A right-hand sidebar on Contacts/Leads showing a timeline of Notes, Calls, and Emails.
*   **Deal Kanban Board:** Visual drag-and-drop Kanban board for Deals across different stages (Prospecting -> Qualified -> Won/Lost).
*   **Lead Scoring & Conversion:** Workflow to graduate a "Lead" into a "Contact" and associate a "Deal".

### 3. HR Module (Inspired by BambooHR)
*   **Employee Profiles:** Detailed views showing an employee's department, manager, and history.
*   **Leave Management Workflow:** A dedicated dashboard for Employees to request time off and HR to Approve/Reject them.
*   **Attendance Tracking:** Basic clock-in / clock-out or daily logging capabilities.

### 4. Accounting & Expenses (Inspired by QuickBooks / Expensify)
*   **Expense Approval Workflows:** Expenses transition from Pending -> Approved -> Paid.
*   **Automated Ledger Entries:** When an expense is marked "Paid", it automatically generates an entry in the Accounting Transactions ledger.
*   **Invoice Generation:** Generate PDF invoices from the UI and email them to CRM Contacts.

---

## 🛠️ Phase 1 Implementation Plan: Helpdesk Overhaul

To avoid overwhelming the system, we will start with the Helpdesk module to give it real utility.

### User Review Required
> [!IMPORTANT]
> Since we are transitioning away from the basic CRUD grid, clicking a Ticket will now route to a **Ticket Detail View** instead of opening the generic `<EditModal>`. Do you approve of building a custom threaded view (like FreeScout)?

### Proposed Changes

#### 1. Backend APIs (PHP)
*   **[MODIFY]** `class-sahajanand-erp-api-general.php`
    *   Add `GET /helpdesk/tickets/(?P<id>[\d]+)/replies` to fetch threaded messages.
    *   Add `POST /helpdesk/tickets/(?P<id>[\d]+)/replies` to insert a new reply/note.

#### 2. Frontend Application (React)
*   **[NEW]** `plugin/src/modules/helpdesk/components/TicketDetail.js`
    *   A full-screen view containing the original ticket description at the top.
    *   A threaded feed of replies/notes using the `@wordpress/components` Card system.
    *   A rich text reply box (`RichText` or standard `TextareaControl`) with tabs for "Reply" vs "Internal Note".
    *   A right-hand sidebar to update Ticket Status, Priority, and Assignee.
*   **[MODIFY]** `plugin/src/modules/helpdesk/App.js`
    *   Add state routing: If a `selectedTicketId` is set, render `<TicketDetail>` instead of the DataViews table.
    *   Update the DataViews `actions` so that clicking "View/Edit" sets the `selectedTicketId` state instead of opening the basic Modal.

## Verification Plan

### Automated Tests
*   Ensure the React build compiles (`npm run build`) without errors after adding the nested views.

### Manual Verification
1.  Navigate to **Helpdesk**.
2.  Click on an existing Ticket. The UI should seamlessly transition to the new `TicketDetail` view.
3.  Add an "Internal Note" to the ticket. Verify it appears in the timeline instantly via the new API.
4.  Change the status from "Open" to "Pending" using the right-hand sidebar. Navigate back to the list and ensure the status reflects the change.
# 🚑 Implementation Plan: Helpdesk (FreeScout Edition)

## Goal Description
The objective is to transform the current rudimentary Helpdesk grid into a fully-fledged "Shared Inbox" system heavily inspired by **FreeScout / Help Scout**. 

This requires moving away from simple modal editing and building a rich, threaded conversation interface, supporting internal notes, multiple mailboxes, saved replies, agent assignment, and **Live Email Integration (IMAP/SMTP)**.

---

## 🏗️ Core Feature Scope (Phase 1)

1. **Email Fetching & Parsing:** Connect to IMAP servers to automatically fetch customer emails and pipe them into tickets/replies.
2. **Email Sending:** Send agent replies directly to customers via SMTP.
3. **Mailboxes:** Support for multiple shared inboxes (e.g., "General Support", "Billing", "Sales") with individual IMAP/SMTP credentials.
4. **Threaded Conversations:** Chronological view of customer replies and agent responses.
5. **Internal Notes:** Private, yellow-tinted notes visible only to staff, kept inline with the conversation.
6. **Agent Assignment:** Assigning tickets to specific WordPress users (Agents).
7. **Saved Replies (Canned Responses):** Ability to quickly insert pre-written templates into the reply box.
8. **Customer Context:** A sidebar on the ticket showing the customer's CRM details.

---

## 🛠️ Proposed Changes

### 1. External Dependencies (PHP)
*   **[MODIFY]** `plugin/composer.json`
    *   Add `"webklex/php-imap": "^5.0"` to require. This is the industry-standard PHP IMAP library (used by FreeScout itself) and doesn't rely on the often-disabled PHP C-client IMAP extension.

### 2. Database Schema Layer (PHP)
We must expand `class-sahajanand-erp-database.php` to handle the new FreeScout-style data structures.

*   **Create Mailboxes Table:** `erp_helpdesk_mailboxes` (id, name, email_address, imap_host, imap_port, imap_user, imap_pass, smtp_host, smtp_port, smtp_user, smtp_pass, signature).
*   **Create Saved Replies Table:** `erp_helpdesk_saved_replies` (id, title, content).
*   **Alter Tickets Table:** Add `mailbox_id` (bigint), `assignee_id` (bigint), and `message_id` (varchar) for email threading.
*   **Alter Replies Table:** Add `is_note` (boolean), `attachment_ids` (varchar), and `message_id` (varchar).

### 3. Email Engine & Cron (PHP)
*   **[NEW]** `plugin/includes/helpdesk/class-sahajanand-erp-mail-fetcher.php`
    *   A class hooked into a 5-minute WordPress cron (`erp_helpdesk_fetch_emails`).
    *   Iterates through all configured Mailboxes, connects via `Webklex\IMAP\ClientManager`, and parses UNSEEN emails.
    *   Matches emails to existing tickets using the `In-Reply-To` and `References` headers, or `[Ticket #ID]` in the subject. Creates new tickets if no match is found.
*   **[NEW]** `plugin/includes/helpdesk/class-sahajanand-erp-mail-sender.php`
    *   A class to dispatch emails to customers using the mailbox's specific SMTP credentials when an Agent clicks "Reply".

### 4. Backend REST API Layer (PHP)
*   **[MODIFY]** `plugin/includes/api/class-sahajanand-erp-api-general.php`
    *   `GET & POST /helpdesk/mailboxes`
    *   `GET & POST /helpdesk/saved-replies`
    *   `GET /helpdesk/tickets/(?P<id>[\d]+)/replies` (Fetches full thread chronological history)
    *   `POST /helpdesk/tickets/(?P<id>[\d]+)/replies` (Saves reply to DB *and* triggers `MailSender` if `is_note` is false)
    *   `PUT /helpdesk/tickets/(?P<id>[\d]+)/assign` (Quick-assign endpoint)

### 5. Frontend Application Layer (React)
This is a massive UI overhaul. We will move from a basic `DataViews` table to a highly structured SPA layout.

#### [NEW] `plugin/src/modules/helpdesk/components/TicketDetail.js`
This will be the core FreeScout view. It will be split into two columns:
*   **Main Column (Left):**
    *   **Ticket Subject & Original Message:** Displayed at the top.
    *   **Conversation Timeline:** Mapping through the `replies` API. Customer replies are white, agent replies are light blue, and `is_note: true` replies are highlighted in yellow.
    *   **Reply Box:** A rich text editor with two tabs: "Reply to Customer" and "Add Note". Includes a button to trigger the Saved Replies modal.
*   **Context Sidebar (Right):**
    *   Dropdown to change **Status** (Active, Pending, Closed).
    *   Dropdown to change **Assignee** (fetches WP Users).
    *   **Customer Profile Block:** Shows the connected `contact_id` details (Name, Email, Phone) fetched from the CRM module.

#### [MODIFY] `plugin/src/modules/helpdesk/App.js`
*   Implement state-based routing. 
    *   If `selectedTicketId === null`, render the main Ticket Grid (with a new filter for `Mailbox`).
    *   If `selectedTicketId !== null`, render `<TicketDetail ticketId={selectedTicketId} onBack={() => setSelectedTicketId(null)} />`.

---

## 🧪 Verification Plan

### Automated Tests
*   Ensure the React build compiles (`npm run build`).
*   Run Composer update to verify `webklex/php-imap` installs cleanly.

### Manual Verification
1. **Mailbox Creation:** Add a Mailbox in the UI with mock IMAP credentials. Verify it saves to the database.
2. **UI Navigation:** Clicking a ticket from the DataViews grid seamlessly opens the `TicketDetail` view.
3. **Conversations:** Submitting an "Internal Note" renders instantly in yellow without a page reload. Submitting a standard "Reply" renders in blue and attempts to trigger the Mail Sender.
4. **Email Fetching Stub:** Trigger the `erp_helpdesk_fetch_emails` cron manually to ensure it processes gracefully (even if credentials fail, it should log the failure safely).
