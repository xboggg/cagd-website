import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import PublicLayout from "@/components/layout/PublicLayout";
import AdminLayout from "@/components/admin/AdminLayout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import WhoWeAre from "@/pages/about/WhoWeAre";
import MissionVision from "@/pages/about/MissionVision";
import CoreValues from "@/pages/about/CoreValues";
import CoreFunctions from "@/pages/about/CoreFunctions";
import OurHistory from "@/pages/about/OurHistory";
import Leadership from "@/pages/management/Leadership";
import RegionalDirectors from "@/pages/management/RegionalDirectors";
import FinanceAdministration from "@/pages/divisions/FinanceAdministration";
import Treasury from "@/pages/divisions/Treasury";
import FMS from "@/pages/divisions/FMS";
import ICT from "@/pages/divisions/ICT";
import Payroll from "@/pages/divisions/Payroll";
import Audit from "@/pages/divisions/Audit";
import PFMRP from "@/pages/projects/PFMRP";
import IPSAS from "@/pages/projects/IPSAS";
import News from "@/pages/News";
import Events from "@/pages/Events";
import Reports from "@/pages/Reports";
import Gallery from "@/pages/Gallery";
import Contact from "@/pages/Contact";
import FAQ from "@/pages/FAQ";
import Login from "@/pages/admin/Login";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Index />} />
              {/* About */}
              <Route path="/about/who-we-are" element={<WhoWeAre />} />
              <Route path="/about/mission-vision" element={<MissionVision />} />
              <Route path="/about/core-values" element={<CoreValues />} />
              <Route path="/about/core-functions" element={<CoreFunctions />} />
              <Route path="/about/history" element={<OurHistory />} />
              {/* Management */}
              <Route path="/management/leadership" element={<Leadership />} />
              <Route path="/management/regional-directors" element={<RegionalDirectors />} />
              {/* Divisions */}
              <Route path="/divisions/finance-administration" element={<FinanceAdministration />} />
              <Route path="/divisions/treasury" element={<Treasury />} />
              <Route path="/divisions/fms" element={<FMS />} />
              <Route path="/divisions/ict" element={<ICT />} />
              <Route path="/divisions/payroll" element={<Payroll />} />
              <Route path="/divisions/audit" element={<Audit />} />
              {/* Projects */}
              <Route path="/projects/pfmrp" element={<PFMRP />} />
              <Route path="/projects/ipsas" element={<IPSAS />} />
              {/* News & Events */}
              <Route path="/news" element={<News />} />
              <Route path="/events" element={<Events />} />
              {/* Reports & Gallery */}
              <Route path="/reports" element={<Reports />} />
              <Route path="/gallery" element={<Gallery />} />
              {/* Contact & FAQ */}
              <Route path="/contact" element={<Contact />} />
              <Route path="/faq" element={<FAQ />} />
            </Route>

            {/* Admin */}
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="news" element={<NewsManager />} />
              <Route path="reports" element={<ReportsManager />} />
              <Route path="events" element={<EventsManager />} />
              <Route path="gallery" element={<GalleryManager />} />
              <Route path="leadership" element={<LeadershipManager />} />
              <Route path="divisions" element={<DivisionsManager />} />
              <Route path="projects" element={<ProjectsManager />} />
              <Route path="regional-offices" element={<RegionalOfficesManager />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="settings" element={<SiteSettings />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
