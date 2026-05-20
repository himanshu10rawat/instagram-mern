import { FileImage } from "lucide-react";

const MediaPreviewFallback = ({
  label = "IMAGE",
  message = "Preview unavailable",
  compact = false,
}) => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-slate-100 p-2 text-center dark:bg-slate-900">
      <FileImage
        size={compact ? 20 : 28}
        className="shrink-0 text-slate-400 dark:text-slate-500"
      />

      <span
        className={`max-w-full truncate font-semibold text-slate-700 dark:text-slate-200 ${
          compact ? "text-[10px]" : "text-xs"
        }`}
      >
        {label}
      </span>

      <span
        className={`max-w-full text-slate-500 dark:text-slate-400 ${
          compact ? "text-[9px] leading-3" : "text-[11px] leading-4"
        }`}
      >
        {message}
      </span>
    </div>
  );
};

export default MediaPreviewFallback;
