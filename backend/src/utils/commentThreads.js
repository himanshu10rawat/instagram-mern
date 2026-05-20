export const getCommentThreads = async ({ model, match, userPublicFields }) => {
  const comments = await model
    .find({
      ...match,
      isDeleted: false,
    })
    .populate("author", userPublicFields)
    .sort({ createdAt: 1 })
    .lean();

  const commentsById = new Map(
    comments.map((comment) => [
      comment._id.toString(),
      {
        ...comment,
        replies: [],
      },
    ]),
  );

  const commentThreads = [];

  commentsById.forEach((comment) => {
    const parentId = comment.parentComment?.toString();

    if (parentId && commentsById.has(parentId)) {
      commentsById.get(parentId).replies.push(comment);
      return;
    }

    commentThreads.push(comment);
  });

  return commentThreads.sort(
    (firstComment, secondComment) =>
      new Date(secondComment.createdAt) - new Date(firstComment.createdAt),
  );
};
