# CAGD Website

The official website of the **Controller and Accountant-General's Department,
Ghana** — [cagd.gov.gh](https://cagd.gov.gh).

A React single-page application with a content management admin panel and an
internal staff portal, backed by Supabase.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| UI | shadcn/ui + Radix UI + Tailwind CSS |
| Routing | React Router v6 |
| Data | Supabase JS SDK v2 + TanStack Query v5 |
| Auth | Supabase Auth (email/password) |
| Database & storage | Supabase (self-hosted) |
| i18n | i18next — English + Twi |

---

## Local development

Requires Node.js 18+.

```sh
npm install
npm run dev     # http://localhost:8080
```

Create a `.env` in the project root:

```
VITE_SUPABASE_URL="<supabase url>"
VITE_SUPABASE_ANON_KEY="<anon key>"
```

`.env` is git-ignored and must stay that way.

Other scripts:

```sh
npm run build   # production build into dist/
npm run test    # vitest
npm run lint    # eslint
```

---

## Deployment

> **Pushing to GitHub does not deploy anything.** There is no CI/CD.

The site is served from cPanel shared hosting. A release is a manual upload:

1. `npm run build`
2. Upload `dist/index.html` to the web root
3. Upload the new `dist/assets/index-*.js` (and the `.css` if its hash changed)
   to `assets/`
4. Leave the previous hashed files in place until the new ones are up
5. Hard-refresh and confirm the page is serving the new bundle

If a change needs a new database column or table, **run that SQL first** — the
new bundle will look for it the moment it is uploaded.

The project is deliberately not connected to any build platform. A Vercel
project existed until 2026-11-23; it never served the live site and only
published a stale public duplicate, so it was removed. Do not reconnect it.

> Note for any future CI: `npm install` will fail unless
> `PUPPETEER_SKIP_DOWNLOAD=1` is set. `puppeteer` is used only by a local deploy
> helper, never by `vite build`.

---

## Project layout

```
src/
├── App.tsx                 # Route definitions
├── components/
│   ├── admin/              # Admin layout + role guards
│   ├── auth/               # Auth route guard
│   ├── layout/             # Public header, footer, banner
│   ├── ui/                 # shadcn/ui components
│   └── FileUpload.tsx      # Upload to Supabase storage
├── hooks/useAuth.tsx       # Auth context — user, role, session
├── integrations/supabase/  # Client + generated types
├── pages/
│   ├── admin/              # Admin manager pages
│   ├── staff/              # Staff portal (sign-in required)
│   └── [public pages]
└── i18n/                   # English + Twi

supabase/
├── migrations/             # SQL migrations
└── functions/              # Deno edge functions
```

---

## Roles

- **admin** — full access to every admin section
- **editor** — Dashboard, News, Reports, Events and Messages only

Roles live in the `cagd_user_roles` table. The `/staff` portal is open to any
signed-in user.

---

## Documentation

| File | Contents |
|---|---|
| `CAGD_DOCUMENTATION.md` | Master documentation — architecture, deploy, database, common tasks |
| `CAGD_WEBSITE_DOCS.md` | Technical reference — structure, tables, admin pages, features |
| `CAGD_WEBSITE_DOCS_INTERNAL.md` | **Private.** Infrastructure, credentials locations, gotchas. Git-ignored — never commit it |

---

## Security notes

- Never commit `.env`, `.env.deploy`, or `CAGD_WEBSITE_DOCS_INTERNAL.md`
- The Supabase instance is shared with other projects — only touch
  `cagd_`-prefixed tables, functions and buckets
- There is currently **no SMTP** configured, so the reset-password button does
  nothing. Passwords are reset by SQL until that is fixed
