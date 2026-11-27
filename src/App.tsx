import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import ErrorBoundary from "@/components/ErrorBoundary";
import RequireAuth from "@/components/auth/RequireAuth";
import RequireRole from "@/components/admin/RequireRole";
import PublicLayout from "@/components/layout/PublicLayout";
import AdminLayout from "@/components/admin/AdminLayout";
import RouteFallback from "@/components/RouteFallback";

/* ───────────────────────────────────────────────────────────────────
   Loaded straight away — the homepage and the 404 page.

   Everything else is loaded only when somebody actually goes there.
   That keeps the first visit small: before this, a citizen opening the
   homepage downloaded the whole admin back office (rich-text editor,
   charts, spreadsheet writer, map library) as part of one 3.25 MB file.
   ─────────────────────────────────────────────────────────────────── */
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

/* ───────────────── Public pages ───────────────── */
const WhoWeAre = lazy(() => import("@/pages/about/WhoWeAre"));
const MissionVision = lazy(() => import("@/pages/about/MissionVision"));
const OurStructure = lazy(() => import("@/pages/about/OurStructure"));
const CoreFunctions = lazy(() => import("@/pages/about/CoreFunctions"));
const OurHistory = lazy(() => import("@/pages/about/OurHistory"));
const Leadership = lazy(() => import("@/pages/management/Leadership"));
const TeamMember = lazy(() => import("@/pages/management/TeamMember"));
const RegionalDirectors = lazy(() => import("@/pages/management/RegionalDirectors"));
const FinanceAdministration = lazy(() => import("@/pages/divisions/FinanceAdministration"));
const Treasury = lazy(() => import("@/pages/divisions/Treasury"));
const FMS = lazy(() => import("@/pages/divisions/FMS"));
const ICT = lazy(() => import("@/pages/divisions/ICT"));
const Payroll = lazy(() => import("@/pages/divisions/Payroll"));
const Audit = lazy(() => import("@/pages/divisions/Audit"));
const Projects = lazy(() => import("@/pages/projects/Projects"));
const PFMRP = lazy(() => import("@/pages/projects/PFMRP"));
const IPSAS = lazy(() => import("@/pages/projects/IPSAS"));
const News = lazy(() => import("@/pages/News"));
const NewsDetail = lazy(() => import("@/pages/NewsDetail"));
const Events = lazy(() => import("@/pages/Events"));
const EventDetail = lazy(() => import("@/pages/EventDetail"));
const Reports = lazy(() => import("@/pages/Reports"));
const PressReleases = lazy(() => import("@/pages/PressReleases"));
const Digest = lazy(() => import("@/pages/Digest"));
const TreasuryNews = lazy(() => import("@/pages/TreasuryNews"));
const Gallery = lazy(() => import("@/pages/Gallery"));
const Contact = lazy(() => import("@/pages/Contact"));
const FAQ = lazy(() => import("@/pages/FAQ"));
const StaffDirectory = lazy(() => import("@/pages/StaffDirectory"));
const StatusPage = lazy(() => import("@/pages/Status"));
const FormsLibrary = lazy(() => import("@/pages/FormsLibrary"));
/* Pulls in the Leaflet map library — worth its own chunk. */
const RegionalOfficesMap = lazy(() => import("@/pages/RegionalOfficesMap"));

/* ───────────────── Staff portal (sign-in required) ───────────────── */
const StaffPortal = lazy(() => import("@/pages/staff/StaffPortal"));
const Announcements = lazy(() => import("@/pages/staff/Announcements"));
const BirthdayCalendar = lazy(() => import("@/pages/staff/BirthdayCalendar"));
const InternalEvents = lazy(() => import("@/pages/staff/InternalEvents"));
const OrgChart = lazy(() => import("@/pages/staff/OrgChart"));

/* ───────────────── Admin ───────────────── */
const Login = lazy(() => import("@/pages/admin/Login"));
const ForgotPassword = lazy(() => import("@/pages/admin/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/admin/ResetPassword"));
const Dashboard = lazy(() => import("@/pages/admin/Dashboard"));
const NewsManager = lazy(() => import("@/pages/admin/NewsManager"));
const ReportsManager = lazy(() => import("@/pages/admin/ReportsManager"));
const EventsManager = lazy(() => import("@/pages/admin/EventsManager"));
const GalleryManager = lazy(() => import("@/pages/admin/GalleryManager"));
const LeadershipManager = lazy(() => import("@/pages/admin/LeadershipManager"));
const DivisionsManager = lazy(() => import("@/pages/admin/DivisionsManager"));
const ProjectsManager = lazy(() => import("@/pages/admin/ProjectsManager"));
const RegionalOfficesManager = lazy(() => import("@/pages/admin/RegionalOfficesManager"));
const UserManagement = lazy(() => import("@/pages/admin/UserManagement"));
const SiteSettings = lazy(() => import("@/pages/admin/SiteSettings"));
const ContactMessages = lazy(() => import("@/pages/admin/ContactMessages"));
const HeroSlidesManager = lazy(() => import("@/pages/admin/HeroSlidesManager"));
const FAQManager = lazy(() => import("@/pages/admin/FAQManager"));
const HomepageManager = lazy(() => import("@/pages/admin/HomepageManager"));
const PagesContentManager = lazy(() => import("@/pages/admin/PagesContentManager"));
const StaffDirectoryManager = lazy(() => import("@/pages/admin/StaffDirectoryManager"));
const SubscriptionsManager = lazy(() => import("@/pages/admin/SubscriptionsManager"));
const FeedbackManager = lazy(() => import("@/pages/admin/FeedbackManager"));
const ServiceStatusManager = lazy(() => import("@/pages/admin/ServiceStatusManager"));
const FormsLibraryManager = lazy(() => import("@/pages/admin/FormsLibraryManager"));
const AuditTrail = lazy(() => import("@/pages/admin/AuditTrail"));
const AnnouncementsManager = lazy(() => import("@/pages/admin/AnnouncementsManager"));
const StaffEventsManager = lazy(() => import("@/pages/admin/StaffEventsManager"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 3,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 5000),
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      {/* Honour the visitor's "reduce motion" setting across the WHOLE site.
          The pages are full of looping animations — floating icons, pulsing
          rings, slow zooms — and before this there was nothing anywhere,
          in CSS or in JavaScript, that respected that setting. One line
          here switches all of them off for anyone who asked for it. */}
      <MotionConfig reducedMotion="user">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter basename={import.meta.env.BASE_URL}>
              {/* The layouts hold their own loading boundary around <Outlet />,
                  so the header and footer stay put while a page arrives.
                  This outer one only covers the pages that sit outside a
                  layout — the admin sign-in screens. */}
              <Suspense fallback={<RouteFallback />}>
                <Routes>
                  <Route element={<PublicLayout />}>
                    <Route path="/" element={<Index />} />
                    {/* About */}
                    <Route path="/about/who-we-are" element={<WhoWeAre />} />
                    <Route path="/about/mission-vision" element={<MissionVision />} />
                    <Route path="/about/core-values" element={<Navigate to="/about/who-we-are" replace />} />
                    <Route path="/about/structure" element={<OurStructure />} />
                    <Route path="/about/core-functions" element={<CoreFunctions />} />
                    <Route path="/about/history" element={<OurHistory />} />
                    {/* Management */}
                    <Route path="/management/leadership" element={<Leadership />} />
                    <Route path="/management/team/:slug" element={<TeamMember />} />
                    <Route path="/management/regional-directors" element={<RegionalDirectors />} />
                    {/* Divisions */}
                    <Route path="/divisions/finance-administration" element={<FinanceAdministration />} />
                    <Route path="/divisions/treasury" element={<Treasury />} />
                    <Route path="/divisions/fms" element={<FMS />} />
                    <Route path="/divisions/ict" element={<ICT />} />
                    <Route path="/divisions/payroll" element={<Payroll />} />
                    <Route path="/divisions/audit" element={<Audit />} />
                    {/* Projects */}
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/projects/pfmrp" element={<PFMRP />} />
                    <Route path="/projects/ipsas" element={<IPSAS />} />
                    {/* News & Events */}
                    <Route path="/news" element={<News />} />
                    <Route path="/news/press-releases" element={<PressReleases />} />
                    <Route path="/news/digest" element={<Digest />} />
                    <Route path="/news/treasury" element={<TreasuryNews />} />
                    <Route path="/news/:slug" element={<NewsDetail />} />
                    <Route path="/events" element={<Events />} />
                    <Route path="/events/:id" element={<EventDetail />} />
                    {/* Reports & Gallery */}
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/gallery" element={<Gallery />} />
                    {/* Contact & FAQ */}
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/faq" element={<FAQ />} />
                    {/* Staff Directory */}
                    <Route path="/staff-directory" element={<RequireAuth><StaffDirectory /></RequireAuth>} />
                    {/* System Status */}
                    <Route path="/status" element={<StatusPage />} />
                    {/* Forms Library */}
                    <Route path="/resources/forms" element={<FormsLibrary />} />
                    {/* Regional Offices Map */}
                    <Route path="/contact/offices" element={<RegionalOfficesMap />} />
                  </Route>

                  {/* Staff Portal — auth-gated */}
                  <Route path="/staff" element={<RequireAuth><PublicLayout /></RequireAuth>}>
                    <Route index element={<StaffPortal />} />
                    <Route path="announcements" element={<Announcements />} />
                    <Route path="birthdays" element={<BirthdayCalendar />} />
                    <Route path="events" element={<InternalEvents />} />
                    <Route path="org-chart" element={<OrgChart />} />
                  </Route>

                  {/* Admin Auth */}
                  <Route path="/admin/login" element={<Login />} />
                  <Route path="/admin/forgot-password" element={<ForgotPassword />} />
                  <Route path="/admin/reset-password" element={<ResetPassword />} />

                  {/* Admin Dashboard */}
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="hero-slides" element={<HeroSlidesManager />} />
                    <Route path="homepage" element={<HomepageManager />} />
                    <Route path="pages-content" element={<PagesContentManager />} />
                    <Route path="faqs" element={<FAQManager />} />
                    <Route path="news" element={<NewsManager />} />
                    <Route path="reports" element={<ReportsManager />} />
                    <Route path="events" element={<EventsManager />} />
                    <Route path="gallery" element={<GalleryManager />} />
                    <Route path="leadership" element={<LeadershipManager />} />
                    <Route path="divisions" element={<DivisionsManager />} />
                    <Route path="projects" element={<ProjectsManager />} />
                    <Route path="regional-offices" element={<RegionalOfficesManager />} />
                    <Route path="users" element={<RequireRole roles={["admin"]}><UserManagement /></RequireRole>} />
                    <Route path="settings" element={<RequireRole roles={["admin"]}><SiteSettings /></RequireRole>} />
                    <Route path="messages" element={<ContactMessages />} />
                    <Route path="staff" element={<StaffDirectoryManager />} />
                    <Route path="subscriptions" element={<SubscriptionsManager />} />
                    <Route path="feedback" element={<FeedbackManager />} />
                    <Route path="service-status" element={<RequireRole roles={["admin"]}><ServiceStatusManager /></RequireRole>} />
                    <Route path="forms" element={<FormsLibraryManager />} />
                    <Route path="announcements" element={<AnnouncementsManager />} />
                    <Route path="staff-events" element={<StaffEventsManager />} />
                    <Route path="audit-trail" element={<RequireRole roles={["admin"]}><AuditTrail /></RequireRole>} />
                  </Route>

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
      </MotionConfig>
    </ThemeProvider>
  </ErrorBoundary>
);

export default App;
