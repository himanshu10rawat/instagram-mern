import Analytics from "../models/analytics.model.js";
import Collection from "../models/collection.model.js";
import Comment from "../models/comment.model.js";
import Conversation from "../models/conversation.model.js";
import FollowRequest from "../models/followRequest.model.js";
import Hashtag from "../models/hashtag.model.js";
import Highlight from "../models/highlight.model.js";
import LiveSession from "../models/liveSession.model.js";
import Message from "../models/message.model.js";
import Notification from "../models/notification.model.js";
import Post from "../models/post.model.js";
import Reel from "../models/reel.model.js";
import ReelComment from "../models/reelComment.model.js";
import Report from "../models/report.model.js";
import SearchHistory from "../models/searchHistory.model.js";
import Session from "../models/session.model.js";
import Story from "../models/story.model.js";
import User from "../models/user.model.js";

const pullDeletedUserReferences = async (userId) => {
  await Promise.all([
    User.updateMany(
      {},
      {
        $pull: {
          followers: userId,
          following: userId,
          blockedUsers: userId,
          mutedUsers: userId,
          closeFriends: userId,
        },
      },
    ),
    Hashtag.updateMany({}, { $pull: { followers: userId } }),
  ]);
};

const cleanEngagements = async (userId) => {
  await Promise.all([
    Post.updateMany(
      {},
      {
        $pull: {
          likes: userId,
          savedBy: userId,
          mentions: userId,
          "media.$[].taggedUsers": userId,
        },
      },
    ),
    Comment.updateMany({}, { $pull: { likes: userId } }),
    Reel.updateMany({}, { $pull: { likes: userId, savedBy: userId, mentions: userId } }),
    ReelComment.updateMany({}, { $pull: { likes: userId } }),
    Story.updateMany(
      {},
      {
        $pull: {
          likes: userId,
          viewers: { user: userId },
          replies: { user: userId },
          mentions: userId,
        },
      },
    ),
    Message.updateMany(
      {},
      {
        $pull: {
          reactions: { user: userId },
          seenBy: { user: userId },
        },
      },
    ),
    LiveSession.updateMany({}, { $pull: { viewers: userId } }),
  ]);

  await LiveSession.updateMany({}, [{ $set: { viewersCount: { $size: "$viewers" } } }]);
};

const removeOwnedAndDirectData = async ({ userId, postIds, reelIds, storyIds, commentIds }) => {
  await Promise.all([
    Post.updateMany({ author: userId }, { isDeleted: true }),
    Reel.updateMany({ author: userId }, { isDeleted: true }),
    Story.updateMany({ author: userId }, { isDeleted: true }),
    Comment.updateMany({ author: userId }, { isDeleted: true }),
    ReelComment.updateMany({ author: userId }, { isDeleted: true }),
    Highlight.updateMany({ owner: userId }, { isDeleted: true }),
    Collection.deleteMany({ owner: userId }),
    FollowRequest.deleteMany({ $or: [{ sender: userId }, { receiver: userId }] }),
    Notification.deleteMany({ $or: [{ sender: userId }, { receiver: userId }] }),
    SearchHistory.deleteMany({ $or: [{ user: userId }, { searchedUser: userId }] }),
    Analytics.deleteMany({ $or: [{ owner: userId }, { viewer: userId }] }),
    Report.deleteMany({ $or: [{ reporter: userId }, { reportedUser: userId }] }),
    Session.deleteMany({ user: userId }),
    LiveSession.updateMany(
      { host: userId, status: "live" },
      { status: "ended", endedAt: new Date(), viewers: [], viewersCount: 0 },
    ),
    Notification.deleteMany({
      $or: [
        { post: { $in: postIds } },
        { reel: { $in: reelIds } },
        { story: { $in: storyIds } },
        { comment: { $in: commentIds } },
      ],
    }),
  ]);
};

const decrementCommentCounters = async ({ postCommentCounts, reelCommentCounts }) => {
  await Promise.all([
    ...postCommentCounts.map((item) =>
      Post.updateOne(
        { _id: item._id },
        [
          {
            $set: {
              commentsCount: {
                $max: [0, { $subtract: ["$commentsCount", item.count] }],
              },
            },
          },
        ],
      ),
    ),
    ...reelCommentCounts.map((item) =>
      Reel.updateOne(
        { _id: item._id },
        [
          {
            $set: {
              commentsCount: {
                $max: [0, { $subtract: ["$commentsCount", item.count] }],
              },
            },
          },
        ],
      ),
    ),
  ]);
};

const decrementHashtagCounters = async ({ posts, reels }) => {
  const postTagCounts = new Map();
  const reelTagCounts = new Map();

  posts.forEach((post) => {
    (post.tags || []).forEach((tag) => {
      postTagCounts.set(tag, (postTagCounts.get(tag) || 0) + 1);
    });
  });

  reels.forEach((reel) => {
    (reel.hashtags || []).forEach((tag) => {
      reelTagCounts.set(tag, (reelTagCounts.get(tag) || 0) + 1);
    });
  });

  await Promise.all([
    ...Array.from(postTagCounts.entries()).map(([name, count]) =>
      Hashtag.updateOne(
        { name },
        [
          {
            $set: {
              postsCount: {
                $max: [0, { $subtract: ["$postsCount", count] }],
              },
            },
          },
        ],
      ),
    ),
    ...Array.from(reelTagCounts.entries()).map(([name, count]) =>
      Hashtag.updateOne(
        { name },
        [
          {
            $set: {
              reelsCount: {
                $max: [0, { $subtract: ["$reelsCount", count] }],
              },
            },
          },
        ],
      ),
    ),
  ]);
};

const cleanCollections = async ({ userId, postIds, reelIds }) => {
  await Collection.updateMany(
    {},
    {
      $pull: {
        items: {
          $or: [{ post: { $in: postIds } }, { reel: { $in: reelIds } }],
        },
      },
    },
  );

  await Post.updateMany({}, { $pull: { savedBy: userId } });
  await Reel.updateMany({}, { $pull: { savedBy: userId } });
};

const cleanMessages = async (userId) => {
  const conversations = await Conversation.find({ participants: userId }).select("_id");
  const conversationIds = conversations.map((conversation) => conversation._id);

  await Message.updateMany(
    { sender: userId },
    {
      text: "",
      media: null,
      isDeletedForEveryone: true,
    },
  );

  if (!conversationIds.length) {
    return;
  }

  const latestMessages = await Message.aggregate([
    {
      $match: {
        conversation: { $in: conversationIds },
        isDeletedForEveryone: false,
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: "$conversation",
        lastMessage: { $first: "$_id" },
      },
    },
  ]);

  const lastMessageByConversation = new Map(
    latestMessages.map((item) => [item._id.toString(), item.lastMessage]),
  );

  await Promise.all(
    conversationIds.map((conversationId) =>
      Conversation.updateOne(
        { _id: conversationId },
        {
          lastMessage: lastMessageByConversation.get(conversationId.toString()) || null,
          deletedFor: [],
        },
      ),
    ),
  );
};

export const cleanupDeletedUserData = async (userId) => {
  const [posts, reels, stories, comments, postCommentCounts, reelCommentCounts] =
    await Promise.all([
    Post.find({ author: userId }).select("_id tags"),
    Reel.find({ author: userId }).select("_id hashtags"),
    Story.find({ author: userId }).select("_id"),
    Comment.find({ author: userId }).select("_id"),
    Comment.aggregate([
      {
        $match: {
          author: userId,
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: "$post",
          count: { $sum: 1 },
        },
      },
    ]),
    ReelComment.aggregate([
      {
        $match: {
          author: userId,
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: "$reel",
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const postIds = posts.map((post) => post._id);
  const reelIds = reels.map((reel) => reel._id);
  const storyIds = stories.map((story) => story._id);
  const commentIds = comments.map((comment) => comment._id);

  await Promise.all([
    pullDeletedUserReferences(userId),
    cleanEngagements(userId),
    removeOwnedAndDirectData({ userId, postIds, reelIds, storyIds, commentIds }),
    cleanCollections({ userId, postIds, reelIds }),
    cleanMessages(userId),
    decrementCommentCounters({ postCommentCounts, reelCommentCounts }),
    decrementHashtagCounters({ posts, reels }),
  ]);
};
