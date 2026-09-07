import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function SectionHeader({
  badge,
  title,
  description,
  viewAllTo,
  viewAllLabel = "View all",
}) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div>
        {badge && (
          <div className="text-xs font-bold uppercase tracking-wider text-red-600 mb-1">
            {badge}
          </div>
        )}
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-sm text-slate-500 max-w-xl">
            {description}
          </p>
        )}
      </div>

      {viewAllTo && (
        <Link
          to={viewAllTo}
          className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-red-600 hover:text-red-700 transition-colors shrink-0"
        >
          <span>{viewAllLabel}</span>
          <ArrowRight
            size={14}
            className="transition-transform group-hover:translate-x-1"
          />
        </Link>
      )}
    </div>
  );
}
