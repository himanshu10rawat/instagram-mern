const variantClasses = {
  panel:
    "rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:rounded-2xl sm:p-8",
  subtle:
    "rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/40 sm:rounded-2xl sm:p-6",
  inline: "rounded-xl p-4",
};

const toneClasses = {
  slate: "bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-300",
  blue: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300",
  emerald:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
  red: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300",
};

const sizeClasses = {
  sm: {
    wrapper: "text-center",
    icon: "mb-3 h-10 w-10",
    title: "text-sm",
    description: "mt-1 max-w-xs text-xs",
  },
  md: {
    wrapper: "text-center",
    icon: "mb-4 h-12 w-12",
    title: "text-base",
    description: "mt-2 max-w-sm text-sm",
  },
};

const EmptyState = ({
  action,
  className = "",
  description,
  icon: Icon,
  iconTone = "slate",
  size = "md",
  title,
  variant = "panel",
}) => {
  const selectedSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div
      className={`${variantClasses[variant] || variantClasses.panel} ${selectedSize.wrapper} ${className}`}
    >
      {Icon ? (
        <span
          className={`mx-auto flex items-center justify-center rounded-full ${selectedSize.icon} ${toneClasses[iconTone] || toneClasses.slate}`}
        >
          <Icon size={24} />
        </span>
      ) : null}

      <h2
        className={`${selectedSize.title} font-semibold text-slate-950 dark:text-white`}
      >
        {title}
      </h2>

      {description ? (
        <p
          className={`mx-auto text-slate-500 dark:text-slate-400 ${selectedSize.description}`}
        >
          {description}
        </p>
      ) : null}

      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
};

export default EmptyState;
