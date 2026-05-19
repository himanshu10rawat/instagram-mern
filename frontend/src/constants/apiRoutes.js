export const API_ROUTES = {
  auth: {
    register: "/auth/register",
    login: "/auth/login",
    logout: "/auth/logout",
    me: "/auth/me",
    refreshToken: "/auth/refresh-token",
    forgotPassword: "/auth/forgot-password",
    resetPassword: (token) => `/auth/reset-password/${token}`,
    changePassword: "/auth/change-password",
    verifyEmail: (token) => `/auth/verify-email/${token}`,
    resendEmailVerification: "/auth/resend-email-verification",
    verifyTwoFactor: "/auth/verify-2fa-login",
    verifyTwoFactorLogin: "/auth/verify-2fa-login",
  },

  profile: {
    me: "/profile/me",
    user: (username) => `/profile/${username}`,
    update: "/profile/me",
    avatar: "/profile/me/avatar",
    cover: "/profile/me/cover",
    privacy: "/profile/me/privacy",
    deactivate: "/profile/me",
  },

  posts: {
    create: "/posts",
    feed: "/posts/feed",
    saved: "/posts/saved",
    archive: "/posts/archived",
    archived: "/posts/archived",
    userPosts: (userId) => `/posts/user/${userId}`,
    detail: (postId) => `/posts/${postId}`,
    update: (postId) => `/posts/${postId}`,
    updateCaption: (postId) => `/posts/${postId}`,
    delete: (postId) => `/posts/${postId}`,
    like: (postId) => `/posts/${postId}/like`,
    save: (postId) => `/posts/${postId}/save`,
    archivePost: (postId) => `/posts/${postId}/archive`,
    unarchivePost: (postId) => `/posts/${postId}/unarchive`,
    comments: (postId) => `/posts/${postId}/comments`,
    deleteComment: (commentId) => `/posts/comments/${commentId}`,
    removeTag: (postId) => `/posts/${postId}/remove-tag`,
  },

  stories: {
    create: "/stories",
    feed: "/stories",
    archive: "/stories/archive",
    userStories: (userId) => `/stories/user/${userId}`,
    detail: (storyId) => `/stories/${storyId}`,
    viewed: (storyId) => `/stories/${storyId}`,
    viewers: (storyId) => `/stories/${storyId}/viewers`,
    like: (storyId) => `/stories/${storyId}/like`,
    reply: (storyId) => `/stories/${storyId}/reply`,
    replies: (storyId) => `/stories/${storyId}/replies`,
    archiveStory: (storyId) => `/stories/${storyId}/archive`,
    delete: (storyId) => `/stories/${storyId}`,
  },

  highlights: {
    create: "/highlights",
    me: "/highlights/me",
    user: (userId) => `/highlights/user/${userId}`,
    update: (highlightId) => `/highlights/${highlightId}`,
    delete: (highlightId) => `/highlights/${highlightId}`,
    addStory: (highlightId) => `/highlights/${highlightId}/stories`,
    removeStory: (highlightId) => `/highlights/${highlightId}/stories`,
  },

  reels: {
    create: "/reels",
    feed: "/reels",
    userReels: (userId) => `/reels/user/${userId}`,
    detail: (reelId) => `/reels/${reelId}`,
    update: (reelId) => `/reels/${reelId}`,
    view: (reelId) => `/reels/${reelId}/view`,
    share: (reelId) => `/reels/${reelId}/share`,
    like: (reelId) => `/reels/${reelId}/like`,
    save: (reelId) => `/reels/${reelId}/save`,
    comments: (reelId) => `/reels/${reelId}/comments`,
    deleteComment: (commentId) => `/reels/comments/${commentId}`,
    delete: (reelId) => `/reels/${reelId}`,
  },

  follow: {
    follow: (userId) => `/follow/${userId}`,
    unfollow: (userId) => `/follow/${userId}`,
    followers: (userId) => `/follow/${userId}/followers`,
    following: (userId) => `/follow/${userId}/following`,
    requests: "/follow/requests/received",
    accept: (requestId) => `/follow/request/${requestId}/accept`,
    reject: (requestId) => `/follow/request/${requestId}/reject`,
    cancel: (userId) => `/follow/request/${userId}`,
  },

  notifications: {
    list: "/notifications",
    markRead: (notificationId) => `/notifications/${notificationId}/read`,
    markAllRead: "/notifications/read-all",
    delete: (notificationId) => `/notifications/${notificationId}`,
  },

  messages: {
    conversations: "/messages/conversations",
    createConversation: (receiverId) => `/messages/conversations/${receiverId}`,
    send: (receiverId) => `/messages/${receiverId}`,
    messages: (conversationId) => `/messages/conversation/${conversationId}`,
    seen: (conversationId) => `/messages/conversation/${conversationId}/seen`,
    deleteConversation: (conversationId) =>
      `/messages/conversation/${conversationId}`,
    deleteForMe: (messageId) => `/messages/${messageId}/me`,
    deleteForEveryone: (messageId) => `/messages/${messageId}/everyone`,
    requests: "/messages/requests",
    acceptRequest: (conversationId) =>
      `/messages/requests/${conversationId}/accept`,
    rejectRequest: (conversationId) =>
      `/messages/requests/${conversationId}/reject`,
    react: (messageId) => `/messages/${messageId}/react`,
    removeReaction: (messageId) => `/messages/${messageId}/react`,
    edit: (messageId) => `/messages/${messageId}/edit`,
    forward: (messageId) => `/messages/${messageId}/forward`,
  },

  search: {
    users: "/explore/search/users",
    posts: "/explore/search/posts",
    reels: "/explore/search/reels",
    hashtags: "/explore/search/hashtags",
    explore: "/explore/feed",
    trendingReels: "/explore/trending/reels",
    trendingHashtags: "/explore/trending/hashtags",
    suggestedUsers: "/explore/suggested/users",
  },

  share: {
    toUser: "/share/to-user",
  },

  sessions: {
    list: "/sessions",
    revoke: (sessionId) => `/sessions/${sessionId}/revoke`,
    revokeAll: "/sessions/revoke-all",
  },

  twoFactor: {
    setup: "/2fa/setup",
    enable: "/2fa/enable",
    disable: "/2fa/disable",
    regenerateBackupCodes: "/2fa/backup-codes/regenerate",
    verifyBackupCode: "/2fa/backup-code/verify",
  },

  safety: {
    blockedUsers: "/safety/blocked-users",
    mutedUsers: "/safety/muted-users",
    block: (userId) => `/safety/block/${userId}`,
    unblock: (userId) => `/safety/block/${userId}`,
    mute: (userId) => `/safety/mute/${userId}`,
    unmute: (userId) => `/safety/mute/${userId}`,
    reportUser: (userId) => `/safety/report/user/${userId}`,
    reportPost: (postId) => `/safety/report/post/${postId}`,
    reportReel: (reelId) => `/safety/report/reel/${reelId}`,
    reportComment: (commentId) => `/safety/report/comment/${commentId}`,
  },

  collections: {
    list: "/collections",
    detail: (collectionId) => `/collections/${collectionId}`,
    create: "/collections",
    update: (collectionId) => `/collections/${collectionId}`,
    delete: (collectionId) => `/collections/${collectionId}`,
    items: (collectionId) => `/collections/${collectionId}/items`,
    addPost: ({ collectionId }) => `/collections/${collectionId}/items`,
    removePost: ({ collectionId }) => `/collections/${collectionId}/items`,
    addReel: ({ collectionId }) => `/collections/${collectionId}/items`,
    removeReel: ({ collectionId }) => `/collections/${collectionId}/items`,
  },

  analytics: {
    dashboard: "/analytics/dashboard",
    profileVisits: "/analytics/profile-visits",
    post: (postId) => `/analytics/posts/${postId}`,
    reel: (reelId) => `/analytics/reels/${reelId}`,
  },

  live: {
    active: "/live",
    start: "/live",
    join: (liveId) => `/live/${liveId}/join`,
    leave: (liveId) => `/live/${liveId}/leave`,
    end: (liveId) => `/live/${liveId}/end`,
  },

  agora: {
    rtcToken: "/agora/rtc-token",
  },

  admin: {
    dashboard: "/admin/dashboard",
    users: "/admin/users",
    blockUser: (userId) => `/admin/users/${userId}/block`,
    unblockUser: (userId) => `/admin/users/${userId}/unblock`,
    reports: "/admin/reports",
    updateReportStatus: (reportId) => `/admin/reports/${reportId}/status`,
    resolveReport: (reportId) => `/admin/reports/${reportId}/status`,
    deleteReport: (reportId) => `/admin/reports/${reportId}`,
    deletePost: (postId) => `/admin/posts/${postId}`,
    deleteReel: (reelId) => `/admin/reels/${reelId}`,
    deleteComment: (commentId) => `/admin/comments/${commentId}`,
  },

  recommendations: {
    users: "/recommendations/users",
    posts: "/recommendations/posts",
    reels: "/recommendations/reels",
  },
};

export const FORM_DATA_FIELDS = {
  profile: {
    avatar: "avatar",
    coverImage: "coverImage",
  },

  post: {
    media: "media",
  },

  story: {
    media: "media",
  },

  reel: {
    video: "video",
    coverImage: "coverImage",
  },

  message: {
    media: "media",
  },
};
