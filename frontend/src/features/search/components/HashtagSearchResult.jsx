import { Hash } from "lucide-react";

const HashtagSearchResult = ({ hashtag }) => {
  const tagName = hashtag.name || hashtag.tag || hashtag.title;

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
        <Hash size={20} />
      </div>

      <div>
        <p className="text-sm font-semibold text-slate-950">#{tagName}</p>
        <p className="text-xs text-slate-500">
          {hashtag.postsCount || hashtag.count || 0} posts
        </p>
      </div>
    </div>
  );
};

export default HashtagSearchResult;
