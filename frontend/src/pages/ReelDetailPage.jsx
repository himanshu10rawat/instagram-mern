import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import ReelCard from "../features/reels/components/ReelCard";
import { fetchSingleReel } from "../features/reels/reelSlice";

const ReelDetailPage = () => {
  const { reelId } = useParams();
  const dispatch = useDispatch();

  const { currentReel, loading, error } = useSelector((state) => state.reels);

  useEffect(() => {
    dispatch(fetchSingleReel(reelId));
  }, [dispatch, reelId]);

  if (loading && !currentReel) {
    return <p className="text-sm text-slate-500">Loading reel...</p>;
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
        {error}
      </div>
    );
  }

  if (!currentReel) {
    return null;
  }

  return (
    <section className="mx-auto max-w-xl">
      <ReelCard reel={currentReel} />
    </section>
  );
};

export default ReelDetailPage;
