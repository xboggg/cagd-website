import { lazy, Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Header from "./Header";
import Footer from "./Footer";
import BackToTop from "./BackToTop";
import AnnouncementBanner from "./AnnouncementBanner";
import SkipLinks from "@/components/SkipLinks";
import ScrollToTop from "@/components/ScrollToTop";

const ChatBot = lazy(() => import("@/components/ChatBot"));

export default function PublicLayout() {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <ScrollToTop />
      <SkipLinks />
      <AnnouncementBanner />
      <Header />
      <main id="main-content" className="flex-1" role="main" aria-label="Main content">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <BackToTop />
      <Suspense fallback={null}>
        <ChatBot />
      </Suspense>
    </div>
  );
}
