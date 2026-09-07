import { Link } from "react-router-dom";
import { Calendar, Megaphone, Shield, Heart } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-slate-800 bg-slate-950 text-white">
      <div className="mx-auto max-w-content px-4 py-14 sm:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Col 1 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <img
                src="https://ftwinnersictg.org/wp-content/uploads/2026/01/Your_paragraph_text__1_-removebg-preview-e1769781337210.png"
                alt="Winners Chapel ICT Group"
                className="h-9 w-auto object-contain"
              />
              <span className="font-display text-lg font-bold text-white">
                ICT Group Portal
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering church operations, conferences, AV livestreams, and technical ministries across Winners Chapel International.
            </p>
          </div>

          {/* Col 2 */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              <li>
                <Link to="/" className="hover:text-red-400 transition-colors">
                  Home Portal
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-red-400 transition-colors">
                  Events Directory
                </Link>
              </li>
              <li>
                <Link to="/announcements" className="hover:text-red-400 transition-colors">
                  Announcements
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Technical Units
            </h4>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              <li>• Software &amp; Systems</li>
              <li>• Audio / Visual Broadcast</li>
              <li>• Networks &amp; IT Infrastructure</li>
              <li>• Digital Ministry &amp; Outreach</li>
            </ul>
          </div>

          
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {currentYear} Winners Chapel ICT Group. All rights reserved.</p>
          <div className="flex items-center gap-1.5">
            <span>Crafted with</span>
            <Heart size={12} className="text-red-500 fill-red-500 inline" />
            <span>by</span>
            <a
              href="https://toluwanimidurojaiye.netlify.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-red-400 font-bold underline underline-offset-2 transition-colors"
            >
              Tolu
            </a>
            <span>for ministry excellence</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
