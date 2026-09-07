import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import Announcements from "./pages/Announcements";
import AnnouncementDetail from "./pages/AnnouncementDetail";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import BookmarksDrawer from "./components/BookmarksDrawer";
import { ToastProvider } from "./context/ToastContext";
import { BookmarksProvider } from "./context/BookmarksContext";

export default function App() {
  return (
    <ToastProvider>
      <BookmarksProvider>
        <div id="top" className="flex min-h-screen flex-col bg-[#F8FAFC] text-slate-900 selection:bg-rose-600 selection:text-white">
          <Navbar />
          <BookmarksDrawer />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:id" element={<EventDetail />} />
              <Route path="/announcements" element={<Announcements />} />
              <Route path="/announcements/:id" element={<AnnouncementDetail />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BookmarksProvider>
    </ToastProvider>
  );
}
