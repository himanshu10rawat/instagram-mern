const Avatar = ({ src, alt = "User", size = "md", ring = false }) => {
  const sizes = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-16 w-16",
  };

  return (
    <div
      className={`${sizes[size]} shrink-0 overflow-hidden rounded-full bg-slate-200 ${
        ring ? "ring-2 ring-pink-500 ring-offset-2" : ""
      }`}
    >
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : null}
    </div>
  );
};

export default Avatar;
