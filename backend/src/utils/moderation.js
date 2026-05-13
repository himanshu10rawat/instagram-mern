const badWords = ["abuseword1", "abuseword2", "spamword", "scam", "fraud"];

const suspiciousDomains = ["bit.ly", "tinyurl.com", "t.me", "wa.me"];

const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;

export const containsBadWords = (text = "") => {
  const normalizedText = text.toLowerCase();

  return badWords.some((word) => normalizedText.includes(word));
};

export const containsSuspiciousLinks = (text = "") => {
  const links = text.match(urlRegex) || [];

  return links.some((link) =>
    suspiciousDomains.some((domain) => link.toLowerCase().includes(domain)),
  );
};

export const isSpamText = (text = "") => {
  const normalizedText = text.trim().toLowerCase();

  if (!normalizedText) return false;

  const repeatedCharacters = /(.)\1{8,}/.test(normalizedText);

  const words = normalizedText.split(/\s+/);
  const uniqueWords = new Set(words);

  const repeatedWords = words.length >= 8 && uniqueWords.size <= Math.ceil(words.length / 3);

  const tooManyLinks = (normalizedText.match(urlRegex) || []).length >= 3;

  return repeatedCharacters || repeatedWords || tooManyLinks;
};

export const moderateText = (text = "") => {
  const reasons = [];

  if (containsBadWords(text)) {
    reasons.push("bad_words");
  }

  if (containsSuspiciousLinks(text)) {
    reasons.push("suspicious_links");
  }

  if (isSpamText(text)) {
    reasons.push("spam");
  }

  return {
    isFlagged: reasons.length > 0,
    reasons,
  };
};
