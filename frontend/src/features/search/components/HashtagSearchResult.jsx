import { Hash } from "lucide-react";

const HashtagSearchResult = ({ hashtag }) => {
  const tagName = hashtag.name || hashtag.tag || hashtag.title || hashtag._id;

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
        <Hash size={20} />
      </div>

      <div>
        <p className="text-sm font-semibold text-slate-950 dark:text-white">
          #{tagName}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {hashtag.postsCount || hashtag.count || 0} posts
        </p>
      </div>
    </div>
  );
};

export default HashtagSearchResult;
