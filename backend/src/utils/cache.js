const cacheStore = new Map();

const getDefaultTtl = () => Number(process.env.CACHE_TTL_SECONDS) || 60;

const isExpired = (entry) => entry.expiresAt <= Date.now();

const escapeRegex = (value) => value.replace(/[|\\{}()[\]^$+?.]/g, "\\$&");

const getPatternRegex = (pattern) => {
  const source = pattern.split("*").map(escapeRegex).join(".*");

  return new RegExp(`^${source}$`);
};

const cleanupExpiredCache = () => {
  for (const [key, entry] of cacheStore.entries()) {
    if (isExpired(entry)) {
      cacheStore.delete(key);
    }
  }
};

export const getCache = async (key) => {
  try {
    const cachedData = cacheStore.get(key);

    if (!cachedData) {
      return null;
    }

    if (isExpired(cachedData)) {
      cacheStore.delete(key);
      return null;
    }

    return JSON.parse(cachedData.value);
  } catch {
    return null;
  }
};

export const setCache = async (key, data, ttl = getDefaultTtl()) => {
  try {
    cacheStore.set(key, {
      value: JSON.stringify(data),
      expiresAt: Date.now() + ttl * 1000,
    });

    if (cacheStore.size > 1000) {
      cleanupExpiredCache();
    }
  } catch {
    // Cache is an optimization; requests should still work without it.
  }
};

export const deleteCache = async (key) => {
  try {
    cacheStore.delete(key);
  } catch {
    // Cache is an optimization; requests should still work without it.
  }
};

export const deleteCacheByPattern = async (pattern) => {
  try {
    const patternRegex = getPatternRegex(pattern);

    for (const key of cacheStore.keys()) {
      if (patternRegex.test(key)) {
        cacheStore.delete(key);
      }
    }
  } catch {
    // Cache is an optimization; requests should still work without it.
  }
};
