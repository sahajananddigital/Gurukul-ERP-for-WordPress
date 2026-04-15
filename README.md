# Gurukul ERP - WordPress Plugin + React Native Mobile App

A comprehensive management system for Gurukul (spiritual educational institute) consisting of a WordPress backend and a React Native mobile application.

## 📁 Project Structure (Monorepo)

```
Simple-ERP-for-WordPress/
├── plugin/              # WordPress Plugin (Backend & Admin)
├── app/                 # React Native Mobile App (Expo)
└── AI_CONTEXT.md        # Technical documentation for AI/developers
```

---

## 🚀 Quick Start

### Prerequisites
- **WordPress Backend**: WordPress 5.8+, PHP 7.4+, MySQL 5.7+
- **Mobile App**: Node.js 18+, npm/yarn, Expo CLI

### WordPress Plugin

```bash
cd plugin

# Install dependencies
npm install

# Build admin React UI
npm run build

# Start WordPress Playground for development
npm run playground
```

**Plugin Installation:**
1. Copy the `plugin` folder to `wp-content/plugins/wp-erp`
2. Activate "Gurukul ERP" in WordPress Admin → Plugins
3. Access modules under "Gurukul ERP" in the admin menu

### Mobile App

```bash
cd app

# Install dependencies
npm install

# Start Expo dev server
npm start

# Or run directly on platform
npm run android
npm run ios
```

**Configuration:**
Edit `app/services/api.ts` and update `BASE_URL` with your WordPress API endpoint:
```typescript
const BASE_URL = 'http://YOUR_IP:PORT/wp-json/wp-erp/v1';
```

---

## 🎯 Features

### WordPress Plugin (Admin Panel)

**Content Modules:**
- 📸 **Daily Darshan** - Upload daily deity photos
- 💬 **Daily Quotes** - Inspirational quotes with images
- 📰 **Daily Updates** - News and announcements
- 🎥 **Daily Satsang** - Video sermon links
- 📅 **Daily Programs** - Event flyers/posters
- 🗓️ **Calendar Events** - Festival and event scheduling

**Other Modules:**
- 🧾 Accounting
- 👥 CRM (Contact Management)
- 💰 Donations Tracking
- 💸 Expenses
- 🍽️ Food Pass Management
- 🎫 Helpdesk
- 🧩 HR (Human Resources)
- 🧾 Invoices
- 📊 Reports & Analytics
- 🎟️ Vouchers

**Technical:**
- Modern React admin UI using @wordpress/components
- REST API with proper authentication
- Custom database tables for performance
- Media library integration

### Mobile App

**Screens:**
- 🏠 **Home** - Dashboard grid with all content modules
- 🏢 **Front Desk** - Quick access menu
- 👤 **Profile** - User settings, language switcher

**Features:**
- Light/Dark mode support
- Multi-language (Gujarati + English)
- Offline-ready architecture
- Smooth navigation with Expo Router
- Image caching and fallbacks

---

## 🛠️ Development

### Plugin Development

**Directory Structure:**
```
plugin/
├── includes/           # Core PHP classes
│   ├── api/           # REST API controllers
│   └── class-wp-erp-database.php
├── modules/           # Feature modules
│   ├── content/       # Content management
│   ├── crm/          # Contact management
│   └── donations/    # Donation tracking
├── src/              # React admin UI source
│   ├── components/   # Shared components
│   └── modules/      # Module-specific UIs
└── build/            # Compiled JavaScript (gitignored)
```

**Key Commands:**
```bash
npm run build              # Build production bundle
npm run start              # Watch mode for development
npm run playground         # Start WordPress Playground
npm run format-php         # Format PHP with PHPCS
npm run plugin-zip         # Generate plugin ZIP file
```

### Mobile App Development

**Directory Structure:**
```
app/
├── app/               # Screens (Expo Router)
│   ├── (tabs)/       # Tab navigation screens
│   └── dashboard/    # Content module screens
├── components/        # Reusable UI components
├── services/         # API client, i18n
├── constants/        # Theme colors, config
└── assets/           # Images, fonts
```

**Key Commands:**
```bash
npm start              # Start Metro bundler
npm run android        # Run on Android emulator
npm run ios            # Run on iOS simulator
npm run web            # Run in browser
```

---

## 🔧 Configuration

### Environment Variables

**WordPress Plugin:**
No environment variables required. Configuration is stored in WordPress options.

**Mobile App:**
Edit `app/services/api.ts`:
```typescript
// For physical device testing
const BASE_URL = 'http://192.168.1.X:9400/wp-json/wp-erp/v1';

// For Android emulator
const BASE_URL = 'http://127.0.0.1:9400/wp-json/wp-erp/v1';
```

### Image URL Configuration

Update LAN IP in all API controllers (e.g., `plugin/includes/api/class-wp-erp-api-content.php`):
```php
$url = str_replace('http://localhost', 'http://YOUR_IP', $url);
```

---

## 📚 API Documentation

### Base URL
```
{WORDPRESS_URL}/wp-json/wp-erp/v1
```

### Endpoints

**Content Modules:**
- `GET /content/dashboard` - Dashboard grid items
- `GET /content/daily-darshan` - Daily darshan list
- `POST /content/daily-darshan` - Create darshan entry
- `GET /content/daily-quotes` - Daily quotes list
- `GET /content/daily-updates` - Updates list
- `GET /content/daily-satsang` - Satsang videos
- `GET /content/daily-programs` - Program flyers
- `GET /content/calendar-events` - Calendar events

**Authentication:**
Admin endpoints require WordPress authentication (cookie or Application Password).

---

## 🧪 Testing

### WordPress Plugin
```bash
# Check PHP syntax
php -l includes/api/class-wp-erp-api-*.php

# Test API endpoints
curl http://localhost:9400/wp-json/wp-erp/v1/content/dashboard
```

### Mobile App
```bash
# Clear cache and rebuild
npm start -- -c

# Run on specific device
npm run android -- -d "device_name"
```

---

## 📖 Documentation

- **[AI_CONTEXT.md](./AI_CONTEXT.md)** - Complete technical reference
- **[Walkthrough](./walkthrough.md)** - Implementation summary (in artifacts)
- **[Implementation Plan](./implementation_plan.md)** - Pagination roadmap (in artifacts)

---

## 🐛 Troubleshooting

See [AI_CONTEXT.md - Section 5: Mobile App Troubleshooting](./AI_CONTEXT.md#5-mobile-app---critical-troubleshooting)

**Common Issues:**
- **Images not loading**: Check LAN IP configuration
- **Navigation errors**: Clear Metro cache (`npm start -- -c`)
- **Admin panel errors**: Rebuild JS (`npm run build` in plugin/)

---

## 📦 Deployment

### WordPress Plugin
1. Upload `plugin` folder to server
2. Run `npm run build` to compile React UI
3. Activate plugin in WordPress admin
4. Update image URL logic for production domain

### Mobile App
1. Update API URL to production endpoint
2. Remove `usesCleartextTraffic: true` from `app.json`
3. Build release APK/IPA:
   ```bash
   eas build --platform android --profile production
   ```

---

## 🤝 Contributing

1. Keep modules independent and reusable
2. Use @wordpress/components for admin UI
3. Follow WordPress coding standards
4. Test on both Android and iOS

---

## 📄 License

Proprietary - All rights reserved

---

## 👥 Credits

Developed for Gurukul spiritual education management.

**Tech Stack:**
- WordPress 6.x + PHP 8
- React 18 + @wordpress/components
- React Native + Expo 51
- Expo Router for navigation
