const Input = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  autoComplete,
}) => {
  return (
    <div>
      {label ? (
        <label
          htmlFor={name}
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          {label}
        </label>
      ) : null}

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900"
      />

      {error ? <p className="mt-1 text-xs text-red-500">{error}</p> : null}
    </div>
  );
};

export default Input;
