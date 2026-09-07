import React from "react";

export default function LoadingState({ rows = 4, variant = "event" }) {
  const items = Array.from({ length: rows }, (_, i) => i);

  if (variant === "event") {
    return (
      <div className="grid gap-6 sm:grid-cols-2">
        {items.map((i) => (
          <div
            key={i}
            className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 animate-pulse shadow-soft"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="h-14 w-14 rounded-2xl bg-slate-100 shrink-0"></div>
                <div className="space-y-2">
                  <div className="h-3.5 w-20 bg-slate-100 rounded-full"></div>
                  <div className="h-3 w-14 bg-slate-100 rounded"></div>
                </div>
              </div>
              <div className="h-6 w-6 bg-slate-100 rounded-lg"></div>
            </div>

            <div className="space-y-2 pt-2">
              <div className="h-4 w-3/4 bg-slate-100 rounded"></div>
              <div className="h-3 w-full bg-slate-50 rounded"></div>
              <div className="h-3 w-2/3 bg-slate-50 rounded"></div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="h-3 w-24 bg-slate-100 rounded"></div>
              <div className="h-3 w-16 bg-slate-100 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((i) => (
        <div
          key={i}
          className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 animate-pulse shadow-soft"
        >
          <div className="flex items-center justify-between">
            <div className="h-3.5 w-20 bg-slate-100 rounded-full"></div>
            <div className="h-3 w-12 bg-slate-100 rounded"></div>
          </div>
          <div className="h-4 w-4/5 bg-slate-100 rounded"></div>
          <div className="h-3 w-full bg-slate-50 rounded"></div>
          <div className="h-3 w-2/3 bg-slate-50 rounded"></div>
        </div>
      ))}
    </div>
  );
}
