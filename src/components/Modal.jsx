import { useEffect } from "react";
import { X } from "lucide-react";

/**
 * Shared dialog shell used across the app (confirm delete, create folder,
 * rename, details, etc.) so every popup shares the same chrome, spacing,
 * and motion instead of each modal reinventing its own box.
 *
 * icon: lucide component, tinted per-modal (e.g. red for destructive, blue for neutral)
 * tone: "default" | "danger" — controls the icon chip color
 */
function Modal({ icon: Icon, tone = "default", title, onClose, children, footer, maxWidth = "max-w-md" }) {
  const toneClasses =
    tone === "danger"
      ? "bg-red-50 text-red-600"
      : "bg-blue-50 text-blue-600";

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className={`modal-panel w-full ${maxWidth} rounded-2xl bg-white shadow-xl shadow-slate-900/10 overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 px-6 pt-6 pb-2">
          {Icon && (
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${toneClasses}`}>
              <Icon className="h-5 w-5" />
            </div>
          )}
          <div className="min-w-0 flex-1 pt-1.5">
            <h2 className="font-display text-base font-semibold text-slate-900">
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 pb-6 pt-2">{children}</div>

        {footer && (
          <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;
