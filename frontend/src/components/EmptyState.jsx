import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";

export default function EmptyState({
  icon: Icon = Sparkles,
  title = "No entries found",
  message = "No records match your selected criteria or search term.",
  actionLabel,
  actionTo,
  onAction,
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-10 sm:p-14 text-center max-w-md mx-auto shadow-soft space-y-4">
      <div className="h-14 w-14 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto shadow-sm">
        <Icon size={26} />
      </div>

      <h3 className="font-display text-xl font-bold text-slate-900">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
        {message}
      </p>

      {(actionLabel && (actionTo || onAction)) && (
        <div className="pt-2">
          {actionTo ? (
            <Link
              to={actionTo}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all"
            >
              <span>{actionLabel}</span>
              <ArrowRight size={14} />
            </Link>
          ) : (
            <button
              onClick={onAction}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all"
            >
              <span>{actionLabel}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
