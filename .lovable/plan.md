

# CAGD Website Rebuild — Complete Plan
## "The Best Government Website in Ghana"

---

## Phase 1: Foundation & Design System

### 1.1 Design System & Theme
- Implement CAGD's official color palette (Primary Green #048945, Gold #e6b321, Dark Blue #001a57, Orange #ff5e14)
- Set up Poppins (headings) and Rubik (body) typography
- Create reusable components: green-bordered section headings, rounded CTA buttons, card styles with box shadows
- Dark footer theme (#303030) with 4-column layout

### 1.2 Global Layout
- Responsive header with CAGD logo, mega-menu navigation matching the defined menu structure
- Sticky header with logo resize (130px → 80px)
- Mobile hamburger menu with collapsible sub-menus
- Footer with quick links, contact info, social media icons (gold accents), and newsletter signup form
- "Back to top" floating button

---

## Phase 2: Public-Facing Pages

### 2.1 Homepage
- Hero section with animated slider/carousel showcasing key CAGD messages
- Animated statistics counters (703 MDA units, 16 regions, 150+ reports, etc.)
- Latest news feed (3-4 cards)
- Quick links to e-Services (e-Payslip, GIFMIS, TPRS)
- Upcoming events section
- Featured reports section
- Partners/systems logo strip

### 2.2 About Us Section (5 pages)
- Who We Are — history timeline from 1885 to present with scroll animations
- Mission & Vision — clean layout with icons
- Core Values — interactive cards with hover effects
- Core Functions — 8 functions displayed as an animated grid
- Our History — visual timeline with key milestones

### 2.3 Management Section (2 pages)
- Leadership page — profile cards with photos, names, titles, expandable bios
- Regional Directors page — interactive map of Ghana's 16 regions; click a region to see the director's profile

### 2.4 Divisions Section (6 pages)
- One page per division with interactive organizational chart
- Directorate listings with expand/collapse functionality
- Functions listed with icons and descriptions

### 2.5 Projects Section (2 pages)
- PFMRP — 4 components displayed with progress indicators
- IPSAS — compliance tracker (31/36 standards) with visual progress

### 2.6 News & Updates
- All News page with category filters, search, and pagination
- Individual news article pages with rich content, related articles sidebar
- Category filter tabs (9 categories)
- Tag-based filtering

### 2.7 Reports & Documents
- Filterable report library with 9 category tabs
- Search within reports
- Download buttons with live download counters
- PDF preview capability
- Bulk category browsing

### 2.8 Gallery
- Album-based grid layout
- Grayscale-to-color hover effect
- Lightbox viewer with navigation
- Caption support

### 2.9 Events
- Upcoming events with countdown timers
- Past conference archive with details
- Calendar view option

### 2.10 Contact Us
- Contact form with validation
- Interactive Ghana map showing 16 regional offices
- Click region → see office details (phone, email, address)
- Social media links

### 2.11 FAQ
- Accordion-style FAQ section
- Organized by topic

---

## Phase 3: Backend & Database (Lovable Cloud / Supabase)

### 3.1 Database Schema
- **news** — title, content (rich text), featured image, category, tags, status (draft/published), publish date, author
- **reports** — title, file URL, category, publish date, download count
- **management_profiles** — name, title, bio, photo, display order, type (CAG/DCAG/Regional)
- **divisions** — name, description, directorates (JSON), functions
- **projects** — name, description, components, status
- **events** — title, description, date, venue, images, featured flag
- **gallery_albums** — title, date, photos (array)
- **gallery_photos** — album reference, image URL, caption, order
- **regional_offices** — region, phone, email, address, director reference
- **site_settings** — key-value store for contact info, social links, etc.
- **user_roles** — separate roles table (admin, editor, viewer) with security definer functions

### 3.2 Authentication & Roles
- Admin login with email/password
- Role-based access: Super Admin (full access), Content Editor (news/reports), Gallery Manager
- Secure RLS policies on all tables
- Password reset flow

### 3.3 File Storage
- Supabase Storage buckets: `report-pdfs`, `gallery-images`, `profile-photos`, `news-images`
- Organized folder structure per content type

---

## Phase 4: Admin Panel (Full CMS)

### 4.1 Admin Dashboard
- Overview stats cards: total posts, reports, downloads, page views
- Recent activity feed
- Quick action buttons (new post, upload report, add event)

### 4.2 Content Managers
- **News Manager** — Rich text editor, featured image upload, category/tag assignment, draft/published toggle, scheduled publishing
- **Reports Manager** — PDF upload with drag-and-drop, category selection, auto-naming convention enforcement, download counter display, bulk upload
- **Management Profiles** — Photo upload, rich text bio editor, drag-and-drop reordering
- **Regional Directors** — Same as profiles + region dropdown (16 regions)
- **Gallery Manager** — Album creation, bulk photo upload, drag-and-drop reorder, caption editing
- **Events Manager** — Date/time picker, venue selection, description editor, featured toggle
- **Divisions & Projects** — Edit division/project content with structured forms
- **User Management** — Add/remove admins, assign roles
- **Site Settings** — Edit contact info, social links, upload logo, footer content

### 4.3 Admin Layout
- Sidebar navigation with role-based menu items
- Breadcrumb navigation
- Responsive design for tablet/desktop admin use

---

## Phase 5: Interactivity & Polish

### 5.1 Animations
- Scroll-triggered fade-in and slide-up animations on all sections
- Page transition effects
- Hover effects on cards, buttons, gallery items
- Parallax hero sections
- Animated number counters for statistics

### 5.2 Search & Filtering
- Global search across news and reports
- Advanced category filtering with URL parameters
- Real-time search results

### 5.3 Interactive Elements
- Interactive organizational chart for divisions
- Clickable Ghana map for regional offices
- IPSAS compliance progress visualization
- Live download counters on reports

### 5.4 Performance & SEO
- Image optimization and lazy loading
- SEO meta tags on all pages
- Structured data for government organization
- Mobile-first responsive design
- WCAG accessibility compliance

---

## Implementation Notes

- **Technology**: React + Tailwind CSS + Supabase (Lovable Cloud)
- **This is a large project** — we'll build it iteratively, page by page, with each message focused on a specific component
- **Content migration** (81 news posts, 150+ reports) will happen after the structure is built
- **No careers page** per your specification

This plan will deliver a modern, interactive, and professional government website that sets a new standard in Ghana. Ready to start building!

