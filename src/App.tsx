import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicLayout from "@/components/layout/PublicLayout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PlaceholderPage from "@/components/PlaceholderPage";

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
            <Route path="/about/who-we-are" element={<PlaceholderPage title="Who We Are" description="Learn about the Controller & Accountant-General's Department, established in 1885." />} />
            <Route path="/about/mission-vision" element={<PlaceholderPage title="Mission & Vision" />} />
            <Route path="/about/core-values" element={<PlaceholderPage title="Core Values" />} />
            <Route path="/about/core-functions" element={<PlaceholderPage title="Core Functions" />} />
            <Route path="/about/history" element={<PlaceholderPage title="Our History" description="From 'The Treasury' in 1885 to the modern CAGD." />} />

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
