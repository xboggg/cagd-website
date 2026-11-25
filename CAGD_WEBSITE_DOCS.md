# CAGD Website — Technical Documentation
**Controller and Accountant-General's Department, Ghana**
Last updated: 2026-08-11

---

## 1. Overview

The CAGD website is the official digital presence of the Controller and Accountant-General's Department of Ghana. It is a React single-page application with a full content management admin panel.

---

## 2. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript |
| Build tool | Vite 5 |
| UI components | shadcn/ui + Radix UI |
| Styling | Tailwind CSS |
| Routing | React Router v6 |
| Backend/Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| i18n | i18next (English + Twi) |
| Animations | Framer Motion |

---

## 3. Local Development

### Prerequisites
- Node.js 18+
- npm

### Setup
```bash
npm install
npm run dev    # http://localhost:8080
```

### Environment Variables
Create `.env` in project root with your Supabase project URL and anon key:
```
VITE_SUPABASE_URL="your-supabase-url"
VITE_SUPABASE_ANON_KEY="your-anon-key"
```

---

## 4. Build & Deploy

### Build
```bash
npm run build
```
Output goes to `dist/`. Key output files:
- `dist/index.html` — entry point; this is the file that names the bundle
- `dist/assets/index-XXXXXXXX.js` — main bundle (hash changes each build)
- `dist/assets/index-XXXXXXXX.css` — stylesheet
- `dist/assets/Game2048-*.js`, `TicTacToe-*.js`, `TriviaQuiz-*.js`,
  `WordScramble-*.js`, `Calculator-*.js`, `CurrencyConverter-*.js` —
  lazy-loaded Break Room chunks, **also re-hashed on most builds**

### Deploy Steps

**Since 2026-11-25 deployment is over SSH** — NITA blocks cPanel's port 2083, so
neither the File Manager nor the cPanel API works. Easiest route is to
double-click `CAGD - Deploy to Live.bat`, which does all of the below.

1. Run `npm run build`
2. Upload **every** file in `dist/assets/` to `public_html/assets/` —
   not only `index-*`. A missing lazy chunk 404s when a user opens that feature.
3. Upload `dist/index.html` to the web root **LAST**

⚠️ **Order matters.** `index.html` names the new bundle. Upload it first and
every visitor gets a blank page until the assets finish arriving.

⚠️ **Do not delete the previous `index-*.js`.** A browser holding a cached
`index.html` still asks for the old bundle; deleting it breaks those visitors for
no gain. Old assets are small and harmless — leave them.

---

## 5. Project Structure

```
src/
├── App.tsx                    # Route definitions
├── main.tsx                   # Entry point
├── components/
│   ├── admin/
│   │   ├── AdminLayout.tsx    # Admin sidebar + auth gate
│   │   └── RequireRole.tsx    # Role-based route guard
│   ├── auth/
│   │   └── RequireAuth.tsx    # Auth route guard
│   ├── layout/
│   │   ├── Header.tsx         # Public nav
│   │   ├── Footer.tsx
│   │   ├── PublicLayout.tsx
│   │   └── AnnouncementBanner.tsx
│   ├── ui/                    # shadcn/ui components
│   └── FileUpload.tsx         # Supabase storage upload
├── hooks/
│   ├── useAuth.tsx            # Auth context
│   └── useSiteContent.ts
├── integrations/supabase/
│   └── client.ts              # Supabase client
├── lib/
│   ├── utils.ts
│   └── auditLog.ts
├── pages/
│   ├── admin/                 # 27 admin manager pages
│   ├── about/                 # About Us sub-pages
│   ├── divisions/             # Division pages
│   ├── management/            # Leadership pages
│   └── [public pages]
└── i18n/                      # English + Twi translations
```

---

## 6. Authentication & Roles

- Auth: Supabase Auth (email/password)
- Roles: `admin` (full access) or `editor` (News, Reports, Events, Messages, Dashboard)
- Admin URL: `/admin`

---

## 7. Database Tables

All tables use the `cagd_` prefix with Supabase RLS enabled.

| Table | Purpose |
|---|---|
| `cagd_news` | News articles. `share_to_social` controls Facebook auto-push |
| `cagd_events` | Public events |
| `cagd_reports` | PDF reports (with cover image + featured flag) |
| `cagd_management_profiles` | Leadership team |
| `cagd_gallery_albums` | Gallery albums |
| `cagd_gallery_photos` | Gallery photos |
| `cagd_announcements` | Internal staff announcements (`/staff/announcements`). Has `image_url` feature image + `attachment_url` |
| `cagd_social_posts` | Log of stories pushed out to social media, one row per story per platform |
| `cagd_contact_messages` | Contact form submissions |
| `cagd_divisions` | Division information |
| `cagd_document_downloads` | Download tracking |
| `cagd_event_registrations` | Event RSVPs |
| `cagd_feedback` | Public feedback |
| `cagd_forms_library` | Downloadable forms |
| `cagd_newsletter_subscribers` | Email subscribers |
| `cagd_projects` | Projects |
| `cagd_regional_offices` | Regional office contacts |
| `cagd_site_settings` | Key-value site settings |
| `cagd_staff_directory` | Staff listing |
| `cagd_staff_events` | Internal staff events |
| `cagd_user_roles` | Admin user roles |
| `cagd_audit_trail` | Admin action log |

---

## 8. Admin Panel Pages

| Path | Purpose |
|---|---|
| /admin | Dashboard |
| /admin/hero-slides | Homepage carousel slides |
| /admin/homepage | Homepage content sections |
| /admin/pages-content | Static page text |
| /admin/news | News articles |
| /admin/reports | PDF reports + cover images + featured carousel |
| /admin/events | Events |
| /admin/gallery | Photo albums |
| /admin/leadership | Leadership profiles |
| /admin/divisions | Division descriptions |
| /admin/projects | Projects |
| /admin/regional-offices | Regional office info |
| /admin/staff | Staff directory |
| /admin/messages | Contact form inbox |
| /admin/subscriptions | Newsletter subscribers |
| /admin/feedback | Public feedback |
| /admin/faqs | FAQs |
| /admin/announcements | Internal staff announcements (title, body, priority, feature image, attachment, expiry) |
| /admin/staff-events | Internal staff events |
| /admin/forms | Downloadable forms |
| /admin/service-status | System status |
| /admin/audit-trail | Admin action log |
| /admin/users | User management (admin only) |
| /admin/settings | Site settings (admin only) |

---

## 9. Key Features

### Reports Featured Carousel
- Up to 3 reports can be pinned to a top carousel on the public /reports page
- Toggle the star icon in Reports Manager to feature a report
- Each report supports an optional portrait cover image

### Announcement Banner (site-wide strip)
- Managed via Admin → **Site Settings**, not Admin → Announcements
- Reads from `cagd_site_settings` → `announcement_banner` key

### Staff Announcements (internal notices)
- A different feature from the banner above. Managed via Admin → Announcements,
  read by staff at `/staff/announcements` (sign-in required)
- Each notice has a priority (Normal / Urgent / Critical), an optional **feature
  image**, an optional attachment, and an optional expiry date
- The feature image shows as a thumbnail in the list and as a banner above the
  text when a notice is opened

### Facebook auto-push (phase 1)
- Publishing a news story can post it to the CAGD Facebook page automatically
- One-way only: website → Facebook. Nothing on Facebook changes the website, so
  every story keeps its draft/approve step and its audit trail entry
- Authors can untick **Also share on Facebook** per story
- A story posts once; editing a published story never re-posts it
- Inert until a Facebook page token is configured

### i18n
- English and Twi language support
- Language switcher in public header
- News articles support Twi translation

### Audit Trail
- Every admin create/edit/delete action is logged
- Viewable at /admin/audit-trail (admin only)

---

## 10. Known Issues & Fixes

| Issue | Status |
|---|---|
| Admin dialog closes when switching browser tabs | ✅ Fixed 2026-08-11 |
| Supabase token refresh causing full-page spinner in admin | ✅ Fixed 2026-08-11 |
| Service Worker intercepting image requests | ✅ Fixed |
| CORS on Supabase storage | ✅ Fixed |
| Admin dialogs scrolled sideways instead of wrapping | ✅ Fixed 2026-11-22 |
| Reset-password button does nothing | Known — no SMTP configured; reset by SQL |

---

## 11. Deployment Checklist

- [ ] If the change needs a new database column or table, run that SQL first
- [ ] `npm run build` — confirm success
- [ ] Upload **all** of `dist/assets/` to `public_html/assets/` (including the
      lazy Break Room chunks, which are re-hashed most builds)
- [ ] Upload `dist/index.html` to the web root — **LAST**
- [ ] Hard refresh (Ctrl+Shift+R) and confirm the page shows the new bundle name
- [ ] Commit and push to GitHub

Or simply double-click **`CAGD - Deploy to Live.bat`**, which does the build,
both uploads in the right order, and stops without touching the live site if
anything fails.

> Pushing to GitHub does **not** deploy. There is no CI/CD — the site only
> changes when the built files are uploaded to the web host.
