import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success", duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => {
          const isSuccess = toast.type === "success";
          const isError = toast.type === "error";
          return (
            <div
              key={toast.id}
              className="pointer-events-auto flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl bg-slate-950 text-white shadow-2xl border border-slate-800 transition-all duration-200 animate-in fade-in slide-in-from-bottom-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                {isSuccess && (
                  <div className="h-7 w-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={16} />
                  </div>
                )}
                {isError && (
                  <div className="h-7 w-7 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                    <AlertCircle size={16} />
                  </div>
                )}
                {!isSuccess && !isError && (
                  <div className="h-7 w-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                    <Info size={16} />
                  </div>
                )}
                <span className="text-sm font-medium text-white leading-snug break-words">
                  {toast.message}
                </span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg p-1 transition-colors shrink-0"
                aria-label="Close notification"
              >
                <X size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
