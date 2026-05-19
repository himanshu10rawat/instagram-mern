import { X } from "lucide-react";

const ModalShell = ({
  children,
  className = "",
  contentClassName = "",
  description,
  onClose,
  title,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 px-0 pt-8 sm:items-center sm:px-4 sm:py-6">
      <section
        className={`flex max-h-[calc(100dvh_-_2rem)] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl dark:bg-slate-950 sm:max-h-[calc(100dvh_-_3rem)] sm:rounded-2xl ${className}`}
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 p-4 dark:border-slate-800">
          <div className="min-w-0">
            <h2 className="truncate text-base font-bold text-slate-950 dark:text-white">
              {title}
            </h2>

            {description ? (
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {description}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </header>

        <div className={`min-h-0 flex-1 overflow-y-auto ${contentClassName}`}>
          {children}
        </div>
      </section>
    </div>
  );
};

export default ModalShell;
