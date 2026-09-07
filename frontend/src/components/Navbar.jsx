import { useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { 
  Menu, 
  X, 
  Bookmark, 
  Shield,
  ArrowRight
} from "lucide-react";
import { useBookmarks } from "../context/BookmarksContext";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/events", label: "Events" },
  { to: "/announcements", label: "Announcements" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { totalBookmarks, setIsDrawerOpen } = useBookmarks();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 bg-slate-950 border-b border-slate-800/80 shadow-md">
      <div className="mx-auto flex max-w-content items-center justify-between px-4 py-3.5 sm:px-8">
        {/* Brand Logo */}
        <NavLink to="/" className="flex items-center gap-3">
          <img
            src="https://ftwinnersictg.org/wp-content/uploads/2026/01/Your_paragraph_text__1_-removebg-preview-e1769781337210.png"
            alt="Winners Chapel ICT Group"
            className="h-10 w-auto object-contain"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white">
                ICT Group
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-950/80 px-2 py-0.5 rounded-md border border-red-800/60">
                Portal
              </span>
            </div>
            <span className="hidden text-xs text-slate-400 sm:block -mt-0.5">
              Winners Chapel International
            </span>
          </div>
        </NavLink>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-semibold">
          {links.map((link) => {
            const isActive = link.end
              ? location.pathname === link.to
              : location.pathname.startsWith(link.to);

            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={`py-1 transition-colors ${
                  isActive
                    ? "text-white font-bold border-b-2 border-red-500 -mb-[2px]"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                {link.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Saved Items */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold border border-white/10 transition-colors"
            aria-label="View saved items"
          >
            <Bookmark size={14} className={totalBookmarks > 0 ? "fill-red-500 text-red-500" : "text-slate-300"} />
            <span>Saved</span>
            {totalBookmarks > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-white font-bold text-[10px]">
                {totalBookmarks}
              </span>
            )}
          </button>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="p-1.5 rounded-lg border border-slate-800 text-slate-300 md:hidden hover:bg-white/10"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="border-t border-slate-800 bg-slate-950 px-5 py-4 space-y-2 md:hidden">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between py-2.5 px-3 rounded-lg text-sm font-semibold text-slate-200 hover:bg-white/10"
            >
              <span>{link.label}</span>
              <ArrowRight size={14} className="text-slate-400" />
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
}
