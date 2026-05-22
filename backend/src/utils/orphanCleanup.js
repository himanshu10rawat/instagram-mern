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

const toId = (value) => value?._id?.toString?.() || value?.toString?.() || "";

const addSummary = (summary, key, result) => {
  summary[key] = {
    deleted: result?.deletedCount || 0,
    modified: result?.modifiedCount || 0,
  };
};

const decrementCounters = async ({ model, counts, field }) => {
  await Promise.all(
    counts.map((item) =>
      model.updateOne(
        { _id: item._id },
        [
          {
            $set: {
              [field]: {
                $max: [0, { $subtract: [`$${field}`, item.count] }],
              },
            },
          },
        ],
      ),
    ),
  );
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

const recalculateConversationLastMessages = async (conversationIds = []) => {
  if (!conversationIds.length) return;

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

const cleanupUserReferenceArrays = async ({ validUserIds, summary }) => {
  addSummary(
    summary,
    "users.referenceArrays",
    await User.updateMany(
      {},
      {
        $pull: {
          followers: { $nin: validUserIds },
          following: { $nin: validUserIds },
          blockedUsers: { $nin: validUserIds },
          mutedUsers: { $nin: validUserIds },
          closeFriends: { $nin: validUserIds },
        },
      },
    ),
  );

  addSummary(
    summary,
    "hashtags.followers",
    await Hashtag.updateMany({}, { $pull: { followers: { $nin: validUserIds } } }),
  );
};

const cleanupEngagementReferences = async ({ validUserIds, summary }) => {
  const results = await Promise.all([
    Post.updateMany(
      {},
      {
        $pull: {
          likes: { $nin: validUserIds },
          savedBy: { $nin: validUserIds },
          mentions: { $nin: validUserIds },
          "media.$[].taggedUsers": { $nin: validUserIds },
        },
      },
    ),
    Comment.updateMany({}, { $pull: { likes: { $nin: validUserIds } } }),
    Reel.updateMany(
      {},
      {
        $pull: {
          likes: { $nin: validUserIds },
          savedBy: { $nin: validUserIds },
          mentions: { $nin: validUserIds },
        },
      },
    ),
    ReelComment.updateMany({}, { $pull: { likes: { $nin: validUserIds } } }),
    Story.updateMany(
      {},
      {
        $pull: {
          likes: { $nin: validUserIds },
          viewers: { user: { $nin: validUserIds } },
          replies: { user: { $nin: validUserIds } },
          mentions: { $nin: validUserIds },
        },
      },
    ),
    Message.updateMany(
      {},
      {
        $pull: {
          reactions: { user: { $nin: validUserIds } },
          seenBy: { user: { $nin: validUserIds } },
          deletedFor: { $nin: validUserIds },
        },
      },
    ),
    LiveSession.updateMany({}, { $pull: { viewers: { $nin: validUserIds } } }),
  ]);

  [
    "posts.engagements",
    "comments.likes",
    "reels.engagements",
    "reelComments.likes",
    "stories.engagements",
    "messages.userReferences",
    "liveSessions.viewers",
  ].forEach((key, index) => addSummary(summary, key, results[index]));

  addSummary(
    summary,
    "liveSessions.viewerCounts",
    await LiveSession.updateMany({}, [{ $set: { viewersCount: { $size: "$viewers" } } }]),
  );
};

const cleanupOrphanContent = async ({ validUserIds, summary }) => {
  const [orphanPosts, orphanReels, postCommentCounts, reelCommentCounts] =
    await Promise.all([
      Post.find({ author: { $nin: validUserIds } }).select("_id tags"),
      Reel.find({ author: { $nin: validUserIds } }).select("_id hashtags"),
      Comment.aggregate([
        {
          $match: {
            author: { $nin: validUserIds },
            isDeleted: false,
          },
        },
        { $group: { _id: "$post", count: { $sum: 1 } } },
      ]),
      ReelComment.aggregate([
        {
          $match: {
            author: { $nin: validUserIds },
            isDeleted: false,
          },
        },
        { $group: { _id: "$reel", count: { $sum: 1 } } },
      ]),
    ]);

  const orphanPostIds = orphanPosts.map((post) => post._id);
  const orphanReelIds = orphanReels.map((reel) => reel._id);

  await Promise.all([
    decrementCounters({ model: Post, counts: postCommentCounts, field: "commentsCount" }),
    decrementCounters({ model: Reel, counts: reelCommentCounts, field: "commentsCount" }),
    decrementHashtagCounters({ posts: orphanPosts, reels: orphanReels }),
  ]);

  const results = await Promise.all([
    Post.deleteMany({ _id: { $in: orphanPostIds } }),
    Reel.deleteMany({ _id: { $in: orphanReelIds } }),
    Story.deleteMany({ author: { $nin: validUserIds } }),
    Comment.deleteMany({
      $or: [{ author: { $nin: validUserIds } }, { post: { $in: orphanPostIds } }],
    }),
    ReelComment.deleteMany({
      $or: [{ author: { $nin: validUserIds } }, { reel: { $in: orphanReelIds } }],
    }),
    Highlight.deleteMany({ owner: { $nin: validUserIds } }),
    Collection.deleteMany({ owner: { $nin: validUserIds } }),
    FollowRequest.deleteMany({
      $or: [{ sender: { $nin: validUserIds } }, { receiver: { $nin: validUserIds } }],
    }),
    Notification.deleteMany({
      $or: [{ sender: { $nin: validUserIds } }, { receiver: { $nin: validUserIds } }],
    }),
    SearchHistory.deleteMany({
      $or: [
        { user: { $nin: validUserIds } },
        { searchedUser: { $exists: true, $ne: null, $nin: validUserIds } },
      ],
    }),
    Analytics.deleteMany({
      $or: [
        { owner: { $nin: validUserIds } },
        { viewer: { $exists: true, $ne: null, $nin: validUserIds } },
      ],
    }),
    Report.deleteMany({
      $or: [
        { reporter: { $nin: validUserIds } },
        { reportedUser: { $exists: true, $ne: null, $nin: validUserIds } },
      ],
    }),
    Session.deleteMany({ user: { $nin: validUserIds } }),
    LiveSession.deleteMany({ host: { $nin: validUserIds } }),
  ]);

  [
    "posts.orphanAuthors",
    "reels.orphanAuthors",
    "stories.orphanAuthors",
    "comments.orphanAuthorsOrPosts",
    "reelComments.orphanAuthorsOrReels",
    "highlights.orphanOwners",
    "collections.orphanOwners",
    "followRequests.orphanUsers",
    "notifications.orphanUsers",
    "searchHistory.orphanUsers",
    "analytics.orphanUsers",
    "reports.orphanUsers",
    "sessions.orphanUsers",
    "liveSessions.orphanHosts",
  ].forEach((key, index) => addSummary(summary, key, results[index]));
};

const cleanupOrphanParentReferences = async ({ validUserIds, summary }) => {
  const [
    existingPostIds,
    existingReelIds,
    existingStoryIds,
    existingCommentIds,
    existingMessageIds,
  ] = await Promise.all([
    Post.distinct("_id"),
    Reel.distinct("_id"),
    Story.distinct("_id"),
    Comment.distinct("_id"),
    Message.distinct("_id"),
  ]);

  const results = await Promise.all([
    Comment.deleteMany({ post: { $nin: existingPostIds } }),
    ReelComment.deleteMany({ reel: { $nin: existingReelIds } }),
    Notification.deleteMany({
      $or: [
        { post: { $exists: true, $ne: null, $nin: existingPostIds } },
        { reel: { $exists: true, $ne: null, $nin: existingReelIds } },
        { story: { $exists: true, $ne: null, $nin: existingStoryIds } },
        { comment: { $exists: true, $ne: null, $nin: existingCommentIds } },
        { message: { $exists: true, $ne: null, $nin: existingMessageIds } },
      ],
    }),
    Report.deleteMany({
      $or: [
        { post: { $exists: true, $ne: null, $nin: existingPostIds } },
        { reel: { $exists: true, $ne: null, $nin: existingReelIds } },
        { comment: { $exists: true, $ne: null, $nin: existingCommentIds } },
      ],
    }),
    Analytics.deleteMany({
      $or: [
        { post: { $exists: true, $ne: null, $nin: existingPostIds } },
        { reel: { $exists: true, $ne: null, $nin: existingReelIds } },
        { story: { $exists: true, $ne: null, $nin: existingStoryIds } },
      ],
    }),
    Collection.updateMany(
      {},
      {
        $pull: {
          items: { post: { $exists: true, $ne: null, $nin: existingPostIds } },
        },
      },
    ),
    Collection.updateMany(
      {},
      {
        $pull: {
          items: { reel: { $exists: true, $ne: null, $nin: existingReelIds } },
        },
      },
    ),
    Highlight.updateMany({}, { $pull: { stories: { $nin: existingStoryIds } } }),
    Message.updateMany(
      { "shared.post": { $exists: true, $ne: null, $nin: existingPostIds } },
      { $set: { "shared.post": null } },
    ),
    Message.updateMany(
      { "shared.reel": { $exists: true, $ne: null, $nin: existingReelIds } },
      { $set: { "shared.reel": null } },
    ),
    Message.updateMany(
      { "shared.story": { $exists: true, $ne: null, $nin: existingStoryIds } },
      { $set: { "shared.story": null } },
    ),
    Message.updateMany(
      { "shared.profile": { $exists: true, $ne: null, $nin: validUserIds } },
      { $set: { "shared.profile": null } },
    ),
  ]);

  [
    "comments.orphanPosts",
    "reelComments.orphanReels",
    "notifications.orphanParents",
    "reports.orphanParents",
    "analytics.orphanParents",
    "collections.orphanPostItems",
    "collections.orphanReelItems",
    "highlights.orphanStories",
    "messages.sharedPostCleanup",
    "messages.sharedReelCleanup",
    "messages.sharedStoryCleanup",
    "messages.sharedProfileCleanup",
  ].forEach((key, index) => addSummary(summary, key, results[index]));
};

const cleanupOrphanMessages = async ({ validUserIds, summary }) => {
  const conversations = await Conversation.find().select("participants");
  const validUserIdSet = new Set(validUserIds.map(toId));
  const conversationsWithoutValidParticipants = [];
  const conversationsWithMissingParticipants = [];

  conversations.forEach((conversation) => {
    const participantIds = (conversation.participants || []).map(toId).filter(Boolean);
    const validParticipantCount = participantIds.filter((id) => validUserIdSet.has(id)).length;
    const hasMissingParticipant = participantIds.some((id) => !validUserIdSet.has(id));

    if (validParticipantCount === 0) {
      conversationsWithoutValidParticipants.push(conversation._id);
      return;
    }

    if (hasMissingParticipant) {
      conversationsWithMissingParticipants.push(conversation._id);
    }
  });

  const senderOrphanConversationIds = await Message.distinct("conversation", {
    sender: { $nin: validUserIds },
  });

  addSummary(
    summary,
    "messages.orphanSenders",
    await Message.updateMany(
      { sender: { $nin: validUserIds } },
      {
        text: "",
        media: null,
        isDeletedForEveryone: true,
      },
    ),
  );

  addSummary(
    summary,
    "messages.conversationsWithoutUsers",
    await Message.deleteMany({ conversation: { $in: conversationsWithoutValidParticipants } }),
  );

  addSummary(
    summary,
    "conversations.withoutUsers",
    await Conversation.deleteMany({ _id: { $in: conversationsWithoutValidParticipants } }),
  );

  const conversationIdsToRecalculate = Array.from(
    new Set(
      [...conversationsWithMissingParticipants, ...senderOrphanConversationIds]
        .map(toId)
        .filter(Boolean),
    ),
  );

  await recalculateConversationLastMessages(conversationIdsToRecalculate);

  const existingConversationIds = await Conversation.distinct("_id");

  addSummary(
    summary,
    "messages.orphanConversations",
    await Message.deleteMany({ conversation: { $nin: existingConversationIds } }),
  );
};

export const cleanupOrphanedDatabaseData = async () => {
  const validUserIds = await User.distinct("_id");
  const summary = {};

  await cleanupUserReferenceArrays({ validUserIds, summary });
  await cleanupEngagementReferences({ validUserIds, summary });
  await cleanupOrphanContent({ validUserIds, summary });
  await cleanupOrphanParentReferences({ validUserIds, summary });
  await cleanupOrphanMessages({ validUserIds, summary });

  return {
    validUsers: validUserIds.length,
    summary,
  };
};
