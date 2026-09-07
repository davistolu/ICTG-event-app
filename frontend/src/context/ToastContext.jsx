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
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => {
          const isSuccess = toast.type === "success";
          const isError = toast.type === "error";
          return (
            <div
              key={toast.id}
              className="pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-lg bg-ink-950 text-white shadow-floating border border-ink-800 transition-all duration-200 animate-in fade-in slide-in-from-bottom-4"
            >
              <div className="flex items-center gap-2.5 text-xs font-mono font-medium">
                {isSuccess && <span className="h-2 w-2 rounded-full bg-emerald-400"></span>}
                {isError && <span className="h-2 w-2 rounded-full bg-crimson-500"></span>}
                {!isSuccess && !isError && <span className="h-2 w-2 rounded-full bg-white"></span>}
                <span className="font-sans text-sm text-paper-100">{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-ink-500 hover:text-white transition-colors p-1"
                aria-label="Close notification"
              >
                <X size={14} />
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
