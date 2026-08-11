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
- `dist/index.html` — entry point
- `dist/assets/index-XXXXXXXX.js` — main bundle (hash changes each build)
- `dist/assets/index-XXXXXXXX.css` — stylesheet

### Deploy Steps
1. Run `npm run build`
2. Upload `dist/index.html` to web root
3. Upload `dist/assets/index-XXXXXXXX.js` to `assets/` folder
4. Delete the previous `index-XXXXXXXX.js` from `assets/`
5. CSS only needs re-uploading if the filename changed

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
| `cagd_news` | News articles |
| `cagd_events` | Public events |
| `cagd_reports` | PDF reports (with cover image + featured flag) |
| `cagd_management_profiles` | Leadership team |
| `cagd_gallery_albums` | Gallery albums |
| `cagd_gallery_photos` | Gallery photos |
| `cagd_announcements` | Announcement banners |
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
| /admin/announcements | Site banners |
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

### Announcement Banner
- Site-wide banner managed via Admin → Announcements
- Reads from `cagd_site_settings` → `announcement_banner` key

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

---

## 11. Deployment Checklist

- [ ] `npm run build` — confirm success
- [ ] Upload `dist/index.html` to web root
- [ ] Upload new `dist/assets/index-XXXXXXXX.js` to assets folder
- [ ] Delete previous `index-XXXXXXXX.js`
- [ ] Hard refresh (Ctrl+Shift+R) to verify
- [ ] Commit and push to GitHub
