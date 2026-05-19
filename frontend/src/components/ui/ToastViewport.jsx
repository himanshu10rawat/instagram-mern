import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from "lucide-react";

import { dismissToast } from "../../features/toasts/toastSlice";

const toastStyles = {
  success: {
    icon: CircleCheck,
    fallbackTitle: "Success",
    container:
      "border-emerald-200 bg-white text-slate-950 shadow-[0_18px_48px_rgba(15,23,42,0.16)] dark:border-emerald-500/30 dark:bg-slate-950 dark:text-white",
    iconWrap:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
    progress: "bg-emerald-500",
  },
  error: {
    icon: CircleAlert,
    fallbackTitle: "Error",
    container:
      "border-red-200 bg-white text-slate-950 shadow-[0_18px_48px_rgba(15,23,42,0.16)] dark:border-red-500/30 dark:bg-slate-950 dark:text-white",
    iconWrap:
      "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300",
    progress: "bg-red-500",
  },
  info: {
    icon: Info,
    fallbackTitle: "Heads up",
    container:
      "border-sky-200 bg-white text-slate-950 shadow-[0_18px_48px_rgba(15,23,42,0.16)] dark:border-sky-500/30 dark:bg-slate-950 dark:text-white",
    iconWrap:
      "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300",
    progress: "bg-sky-500",
  },
  warning: {
    icon: TriangleAlert,
    fallbackTitle: "Warning",
    container:
      "border-amber-200 bg-white text-slate-950 shadow-[0_18px_48px_rgba(15,23,42,0.16)] dark:border-amber-500/30 dark:bg-slate-950 dark:text-white",
    iconWrap:
      "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300",
    progress: "bg-amber-500",
  },
};

const ToastItem = ({ toast }) => {
  const dispatch = useDispatch();
  const style = toastStyles[toast.type] || toastStyles.info;
  const Icon = style.icon;
  const title = toast.title || style.fallbackTitle;
  const message = toast.message;
  const isAssertive = toast.type === "error";

  useEffect(() => {
    if (!toast.duration) return undefined;

    const timerId = window.setTimeout(() => {
      dispatch(dismissToast(toast.id));
    }, toast.duration);

    return () => window.clearTimeout(timerId);
  }, [dispatch, toast.duration, toast.id]);

  return (
    <article
      role={isAssertive ? "alert" : "status"}
      aria-live={isAssertive ? "assertive" : "polite"}
      className={`toast-enter pointer-events-auto relative overflow-hidden rounded-2xl border ${style.container}`}
    >
      <div className="flex min-w-0 items-start gap-3 p-4 pr-3">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${style.iconWrap}`}
        >
          <Icon size={20} strokeWidth={2.4} aria-hidden="true" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-5">{title}</p>

          {message ? (
            <p className="mt-0.5 break-words text-sm leading-5 text-slate-600 dark:text-slate-300">
              {message}
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => dispatch(dismissToast(toast.id))}
          className="shrink-0 rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-900 dark:hover:text-white"
          aria-label="Dismiss notification"
        >
          <X size={16} strokeWidth={2.4} />
        </button>
      </div>

      {toast.duration ? (
        <div className="h-1 bg-slate-100 dark:bg-slate-900">
          <div
            className={`toast-progress h-full ${style.progress}`}
            style={{ animationDuration: `${toast.duration}ms` }}
          />
        </div>
      ) : null}
    </article>
  );
};

const ToastViewport = () => {
  const toasts = useSelector((state) => state.toasts.items);

  if (!toasts.length) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-3 top-3 z-[70] flex flex-col gap-3 sm:inset-x-auto sm:right-4 sm:top-4 sm:w-full sm:max-w-sm"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
};

export default ToastViewport;
