import React from "react";
import { AlertCircle, RotateCw } from "lucide-react";

export default function ErrorState({
  title = "Connection or retrieval error",
  message = "Failed to load requested data from the portal API.",
  onRetry,
}) {
  return (
    <div className="bg-rose-50/50 border border-rose-200 rounded-2xl p-8 text-center max-w-md mx-auto space-y-4 shadow-sm">
      <div className="h-12 w-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
        <AlertCircle size={24} />
      </div>

      <h3 className="font-display text-lg font-bold text-slate-900">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
        {message}
      </p>

      {onRetry && (
        <div className="pt-2">
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-rose-600 text-white text-xs font-bold transition-colors shadow-sm"
          >
            <RotateCw size={14} />
            <span>Try Again</span>
          </button>
        </div>
      )}
    </div>
  );
}
