# Project Context: Gurukul ERP & Mobile App

**Usage**: Provide this document to any LLM/AI assistant to establish immediate context for the project.

## 1. Project Overview
**Name**: Gurukul ERP (Monorepo)
**Goal**: A comprehensive management system for a Gurukul (spiritual educational institute) consisting of a WordPress Backend and a React Native Mobile App.

### Directory Structure
- **root**: Monorepo root.
- **`plugin/`**: WordPress Plugin ("Gurukul ERP").
    - Acts as the Backend, Admin Panel, and API Provider.
- **`app/`**: React Native Mobile Application ("Gurukul App").
    - Built with **Expo** (Managed workflow).

## 2. Technical Stack & Standards

### A. Backend (WordPress Plugin)
- **Namespace/Prefix**: `WP_ERP`, `wp-erp`.
- **API Architecture**:
    - **Controller Pattern**: specific controllers per module (e.g., `WP_ERP_API_Content`, `WP_ERP_API_CRM`) in `plugin/includes/api/`.
    - **Base Class**: All controllers extend `WP_ERP_API_Controller`.
    - **Caching**: implement `Cache-Control` headers for GET requests.
    - **Security**: Follow [WP Security Standards](https://developer.wordpress.org/apis/security/) (Sanatization, Escaping, Nonces, Capabilities).
- **Admin UI Pattern**:
    - **React-First**: Do NOT use standard WordPress Admin tables or Classic Meta Boxes for complex data.
    - **Implementation**: Create a custom admin page that renders a root `div` (e.g., `#wp-erp-content-root`). Mount a React App from `plugin/src/modules/{module}/App.js`.
    - **Components**: Strictly use `@wordpress/components`.
        - **Shared Component**: Use `plugin/src/components/AdminCrud.js` for all List/Create/Edit/Delete interfaces.
        - **UX Rule**: NEVER use native `alert()` or `confirm()`. Use `Modal` for confirmations and `Notice` for feedback.
    - **Reference**: [Gutenberg Storybook](https://wordpress.github.io/gutenberg/?path=/docs/docs-introduction--page).
    - **Media**: Use `wp.media` (WordPress Native Uploader) within the React App for image handling. Enqueue scripts via `admin_enqueue_scripts`.
    - **Build System**:
        - Tools: `@wordpress/scripts`.
        - Command: `npm run build` (Compiles React sources from `src/` to `build/`).
        - Entry Point: `plugin/src/index.js` (detects DOM IDs like `#wp-erp-content-root` and mounts the corresponding App).
- **Modules**:
    - Located in `plugin/modules/`.
    - Each module (e.g., `content`, `donations`) has a main class (e.g., `WP_ERP_Content`) that registers CPTs and Admin Pages.
    - **Registry Pattern**: `WP_ERP_API` (`includes/class-wp-erp-api.php`) acts as the central registry, loading individual API controllers.
    - **Module Manager**: `WP_ERP_Module_Manager` handles module activation/deactivation.

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
    - **Table**: `wp_erp_daily_quotes` (Custom Table).
    - **API**: `WP_ERP_API_Quotes` (Direct SQL access).
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
  - **Android Emulator**: `http://127.0.0.1:9400/wp-json/wp-erp/v1`
  - **iOS Simulator / Web**: `http://localhost:9400/wp-json/wp-erp/v1`
  - **Physical Device**: Use your machine's LAN IP if testing on a real device.

### D. Metro Bundler Cache Issues
When adding new screens/routes:
```bash
npm start -- -c  # Clear cache
```
