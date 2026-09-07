import React from "react";

export default function CategoryFilter({ categories, active, onChange }) {
  const options = ["All", ...categories];

  return (
    <div
      className="flex flex-wrap items-center gap-1.5"
      role="group"
      aria-label="Filter by category"
    >
      {options.map((option) => {
        const isActive = active === option || (option === "All" && !active);

        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option === "All" ? "" : option)}
            aria-pressed={isActive}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
              isActive
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200/90 hover:border-slate-300"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
