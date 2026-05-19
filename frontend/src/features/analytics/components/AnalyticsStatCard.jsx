const AnalyticsStatCard = ({ icon: Icon, label, value, helper }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>

          <h3 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
            {value ?? 0}
          </h3>

          {helper ? (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {helper}
            </p>
          ) : null}
        </div>

        {Icon ? (
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
            <Icon size={22} />
          </span>
        ) : null}
      </div>
    </div>
  );
};

export default AnalyticsStatCard;
