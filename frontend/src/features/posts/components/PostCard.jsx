import {
  Bookmark,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Send,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import Avatar from "../../../components/common/Avatar";
import { likePost, savePost } from "../postSlice";

const getId = (value) => (typeof value === "string" ? value : value?._id);

const PostCard = ({ post }) => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);

  const currentUserId = currentUser?._id;
  const isLiked = post.likes?.some((id) => getId(id) === currentUserId);
  const isSaved = post.savedBy?.some((id) => getId(id) === currentUserId);

  const firstMedia = post.media?.[0];

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <header className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Avatar
            src={post.author?.avatar?.url}
            alt={post.author?.username}
            size="md"
          />
          <div>
            <h3 className="text-sm font-semibold">
              {post.author?.username || "unknown"}
            </h3>
            {post.location ? (
              <p className="text-xs text-slate-500">{post.location}</p>
            ) : null}
          </div>
        </div>

        <button type="button" className="rounded-full p-2 hover:bg-slate-100">
          <MoreHorizontal size={20} />
        </button>
      </header>

      <div className="bg-slate-100">
        {firstMedia?.type === "video" ? (
          <video
            src={firstMedia.optimizedUrl || firstMedia.url}
            controls
            className="max-h-180 w-full object-cover"
          />
        ) : firstMedia?.url ? (
          <img
            src={firstMedia.optimizedUrl || firstMedia.url}
            alt={post.caption || "Post"}
            className="max-h-180 w-full object-cover"
          />
        ) : (
          <div className="aspect-square w-full bg-slate-100"></div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() =>
                dispatch(likePost({ postId: post._id, isLiked }))
              }
              className={isLiked ? "text-red-500" : "text-slate-900"}
            >
              <Heart size={24} fill={isLiked ? "currentColor" : "none"} />
            </button>

            <button type="button">
              <MessageCircle size={24} />
            </button>

            <button type="button">
              <Send size={24} />
            </button>
          </div>

          <button
            type="button"
            onClick={() =>
              dispatch(savePost({ postId: post._id, isSaved }))
            }
            className={isSaved ? "text-slate-950" : "text-slate-700"}
          >
            <Bookmark size={24} fill={isSaved ? "currentColor" : "none"} />
          </button>
        </div>

        <p className="mt-3 text-sm font-semibold">
          {post.likes?.length || 0} likes
        </p>

        {post.caption ? (
          <p className="mt-2 text-sm">
            <span className="font-semibold">{post.author?.username}</span>{" "}
            {post.caption}
          </p>
        ) : null}

        <button type="button" className="mt-2 text-sm text-slate-500">
          View all {post.commentsCount || 0} comments
        </button>
      </div>
    </article>
  );
};

export default PostCard;
