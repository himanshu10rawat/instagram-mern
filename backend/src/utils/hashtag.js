import Hashtag from "../models/hashtag.model.js";

export const upsertHashtags = async (hashtags = [], type = "post") => {
  if (!hashtags.length) return;

  const incrementField = type === "reel" ? "reelsCount" : "postsCount";

  await Promise.all(
    hashtags.map((tag) =>
      Hashtag.findOneAndUpdate(
        { name: tag },
        {
          $setOnInsert: {
            name: tag,
          },
          $inc: {
            [incrementField]: 1,
          },
        },
        {
          upsert: true,
          new: true,
        },
      ),
    ),
  );
};

export const decrementHashtags = async (hashtags = [], type = "post") => {
  if (!hashtags.length) return;

  const decrementField = type === "reel" ? "reelsCount" : "postsCount";

  await Promise.all(
    hashtags.map((tag) =>
      Hashtag.findOneAndUpdate(
        { name: tag },
        {
          $inc: {
            [decrementField]: -1,
          },
        },
      ),
    ),
  );
};
