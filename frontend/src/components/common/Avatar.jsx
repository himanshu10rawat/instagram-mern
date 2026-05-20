const Avatar = ({ src, alt = "User", size = "md", ring = false }) => {
  const sizes = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-16 w-16",
  };

  return (
    <div
      className={`${sizes[size]} shrink-0 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800 ${
        ring ? "ring-2 ring-pink-500 ring-offset-2 dark:ring-offset-slate-950" : ""
      }`}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      ) : null}
    </div>
  );
};

export default Avatar;
