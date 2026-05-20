export const getId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (value._id) return getId(value._id);
  if (value.$oid) return String(value.$oid);

  if (
    typeof value.toString === "function" &&
    value.toString !== Object.prototype.toString
  ) {
    return value.toString();
  }

  return "";
};

const getViewerId = (viewer) => getId(viewer?.user || viewer);

export const isStoryViewedByUser = (story, userId) => {
  const currentUserId = getId(userId);

  if (!story?._id || !currentUserId) return false;

  return (story.viewers || []).some(
    (viewer) => getViewerId(viewer) === currentUserId,
  );
};

export const areAllStoriesViewedByUser = (stories = [], userId) => {
  const activeStories = stories.filter((story) => story?._id);

  if (!activeStories.length) return false;

  return activeStories.every((story) => isStoryViewedByUser(story, userId));
};

export const getStoryRingTone = ({ authorId, currentUserId, stories }) => {
  if (!stories?.length) return "active";
  if (getId(authorId) === getId(currentUserId)) return "active";

  return areAllStoriesViewedByUser(stories, currentUserId)
    ? "viewed"
    : "active";
};
