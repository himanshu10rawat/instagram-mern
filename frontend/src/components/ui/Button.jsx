const Button = ({
  type = "button",
  children,
  disabled,
  className = "",
  onClick,
}) => {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`min-h-12 w-full rounded-xl bg-slate-900 px-4 py-3 text-base font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
