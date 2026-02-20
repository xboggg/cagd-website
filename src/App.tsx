import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicLayout from "@/components/layout/PublicLayout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PlaceholderPage from "@/components/PlaceholderPage";
import WhoWeAre from "@/pages/about/WhoWeAre";
import MissionVision from "@/pages/about/MissionVision";
import CoreValues from "@/pages/about/CoreValues";
import CoreFunctions from "@/pages/about/CoreFunctions";
import OurHistory from "@/pages/about/OurHistory";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
            <Route path="/management/leadership" element={<PlaceholderPage title="Leadership" />} />
            <Route path="/management/regional-directors" element={<PlaceholderPage title="Regional Directors" />} />

            {/* Divisions */}
            <Route path="/divisions/finance-administration" element={<PlaceholderPage title="Finance & Administration Division" />} />
            <Route path="/divisions/treasury" element={<PlaceholderPage title="Treasury Division" />} />
            <Route path="/divisions/fms" element={<PlaceholderPage title="Financial Management Services" />} />
            <Route path="/divisions/ict" element={<PlaceholderPage title="ICT Management Division" />} />
            <Route path="/divisions/payroll" element={<PlaceholderPage title="Payroll Management Division" />} />
            <Route path="/divisions/audit" element={<PlaceholderPage title="Audit & Investigation Division" />} />

            {/* Projects */}
            <Route path="/projects/pfmrp" element={<PlaceholderPage title="Public Financial Management Reform Project (PFMRP)" />} />
            <Route path="/projects/ipsas" element={<PlaceholderPage title="IPSAS Implementation" />} />

            {/* News & Events */}
            <Route path="/news" element={<PlaceholderPage title="News & Updates" />} />
            <Route path="/news/:slug" element={<PlaceholderPage title="News Article" />} />
            <Route path="/events" element={<PlaceholderPage title="Events" />} />

            {/* Reports */}
            <Route path="/reports" element={<PlaceholderPage title="Reports & Documents" />} />

            {/* Gallery */}
            <Route path="/gallery" element={<PlaceholderPage title="Gallery" />} />

            {/* Contact & FAQ */}
            <Route path="/contact" element={<PlaceholderPage title="Contact Us" />} />
            <Route path="/faq" element={<PlaceholderPage title="Frequently Asked Questions" />} />
          </Route>

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
