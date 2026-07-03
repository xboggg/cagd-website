import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import ErrorBoundary from "@/components/ErrorBoundary";
import RequireAuth from "@/components/auth/RequireAuth";
import PublicLayout from "@/components/layout/PublicLayout";
import AdminLayout from "@/components/admin/AdminLayout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import WhoWeAre from "@/pages/about/WhoWeAre";
import MissionVision from "@/pages/about/MissionVision";
import OurStructure from "@/pages/about/OurStructure";
import { Navigate } from "react-router-dom";
import CoreFunctions from "@/pages/about/CoreFunctions";
import OurHistory from "@/pages/about/OurHistory";
import Leadership from "@/pages/management/Leadership";
import TeamMember from "@/pages/management/TeamMember";
import RegionalDirectors from "@/pages/management/RegionalDirectors";
import FinanceAdministration from "@/pages/divisions/FinanceAdministration";
import Treasury from "@/pages/divisions/Treasury";
import FMS from "@/pages/divisions/FMS";
import ICT from "@/pages/divisions/ICT";
import Payroll from "@/pages/divisions/Payroll";
import Audit from "@/pages/divisions/Audit";
import Projects from "@/pages/projects/Projects";
import PFMRP from "@/pages/projects/PFMRP";
import IPSAS from "@/pages/projects/IPSAS";
import News from "@/pages/News";
import NewsDetail from "@/pages/NewsDetail";
import Events from "@/pages/Events";
import EventDetail from "@/pages/EventDetail";
import Reports from "@/pages/Reports";
import PressReleases from "@/pages/PressReleases";
import Digest from "@/pages/Digest";
import TreasuryNews from "@/pages/TreasuryNews";
import Gallery from "@/pages/Gallery";
import Contact from "@/pages/Contact";
import FAQ from "@/pages/FAQ";
import Login from "@/pages/admin/Login";
import ForgotPassword from "@/pages/admin/ForgotPassword";
import ResetPassword from "@/pages/admin/ResetPassword";
import Dashboard from "@/pages/admin/Dashboard";
import NewsManager from "@/pages/admin/NewsManager";
import ReportsManager from "@/pages/admin/ReportsManager";
import EventsManager from "@/pages/admin/EventsManager";
import GalleryManager from "@/pages/admin/GalleryManager";
import LeadershipManager from "@/pages/admin/LeadershipManager";
import DivisionsManager from "@/pages/admin/DivisionsManager";
import ProjectsManager from "@/pages/admin/ProjectsManager";
import RegionalOfficesManager from "@/pages/admin/RegionalOfficesManager";
import UserManagement from "@/pages/admin/UserManagement";
import SiteSettings from "@/pages/admin/SiteSettings";
import ContactMessages from "@/pages/admin/ContactMessages";
import HeroSlidesManager from "@/pages/admin/HeroSlidesManager";
import FAQManager from "@/pages/admin/FAQManager";
import HomepageManager from "@/pages/admin/HomepageManager";
import PagesContentManager from "@/pages/admin/PagesContentManager";
import StaffDirectory from "@/pages/StaffDirectory";
import StaffDirectoryManager from "@/pages/admin/StaffDirectoryManager";
import SubscriptionsManager from "@/pages/admin/SubscriptionsManager";
import FeedbackManager from "@/pages/admin/FeedbackManager";
import StatusPage from "@/pages/Status";
import FormsLibrary from "@/pages/FormsLibrary";
import RegionalOfficesMap from "@/pages/RegionalOfficesMap";
import ServiceStatusManager from "@/pages/admin/ServiceStatusManager";
import FormsLibraryManager from "@/pages/admin/FormsLibraryManager";
import AuditTrail from "@/pages/admin/AuditTrail";
import AnnouncementsManager from "@/pages/admin/AnnouncementsManager";
import StaffEventsManager from "@/pages/admin/StaffEventsManager";
import StaffPortal from "@/pages/staff/StaffPortal";
import Announcements from "@/pages/staff/Announcements";
import BirthdayCalendar from "@/pages/staff/BirthdayCalendar";
import InternalEvents from "@/pages/staff/InternalEvents";
import OrgChart from "@/pages/staff/OrgChart";
import RequireRole from "@/components/admin/RequireRole";

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
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter basename={import.meta.env.BASE_URL}>
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
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

export default App;
