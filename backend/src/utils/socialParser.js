export const extractHashtags = (text = "") => {
  const hashtagRegex = /#([a-zA-Z0-9_]+)/g;

  const hashtags = [];
  let match;

  while ((match = hashtagRegex.exec(text)) !== null) {
    hashtags.push(match[1].toLowerCase());
  }

  return [...new Set(hashtags)];
};

export const extractMentions = (text = "") => {
  const mentionRegex = /@([a-zA-Z0-9._]+)/g;

  const mentions = [];
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1].toLowerCase());
  }

  return [...new Set(mentions)];
};
