import { useEffect, useRef } from "react";

const LiveVideoPlayer = ({ className = "", track }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!track || !container) return undefined;

    track.play(container);

    return () => {
      track.stop();
    };
  }, [track]);

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden rounded-2xl bg-black ${className}`}
    />
  );
};

export default LiveVideoPlayer;
