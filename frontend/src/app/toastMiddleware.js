import { showToast } from "../features/toasts/toastSlice";

const fulfilledToasts = {
  "auth/loginUser/fulfilled": (action) =>
    action.payload?.requiresTwoFactor
      ? {
          type: "info",
          title: "Verification needed",
          message: "Enter your 2FA code to continue.",
        }
      : {
          type: "success",
          title: "Signed in",
          message: "Welcome back.",
        },
  "auth/registerUser/fulfilled": {
    type: "success",
    title: "Account created",
    message: "Your account is ready.",
  },
  "auth/logoutUser/fulfilled": {
    type: "success",
    title: "Signed out",
    message: "You have been logged out.",
  },
  "auth/changePassword/fulfilled": {
    type: "success",
    title: "Password updated",
    message: "Your password was changed successfully.",
  },
  "auth/forgotPassword/fulfilled": {
    type: "success",
    title: "Reset link sent",
    message: "Check your email for the password reset link.",
  },
  "auth/resetPassword/fulfilled": {
    type: "success",
    title: "Password reset",
    message: "You can sign in with your new password.",
  },
  "twoFactor/setupTwoFactor/fulfilled": {
    type: "info",
    title: "2FA setup ready",
    message: "Scan the QR code with your authenticator app.",
  },
  "twoFactor/enableTwoFactor/fulfilled": {
    type: "success",
    title: "2FA enabled",
    message: "Your account has extra protection now.",
  },
  "twoFactor/disableTwoFactor/fulfilled": {
    type: "success",
    title: "2FA disabled",
    message: "Two-factor authentication has been turned off.",
  },
  "twoFactor/regenerateBackupCodes/fulfilled": {
    type: "success",
    title: "Backup codes refreshed",
    message: "Save your new backup codes securely.",
  },
  "create/createPost/fulfilled": {
    type: "success",
    title: "Post shared",
    message: "Your post is live.",
  },
  "create/createReel/fulfilled": {
    type: "success",
    title: "Reel shared",
    message: "Your reel is live.",
  },
  "create/createStory/fulfilled": {
    type: "success",
    title: "Story shared",
    message: "Your story is live.",
  },
  "profile/updateProfile/fulfilled": {
    type: "success",
    title: "Profile updated",
    message: "Your profile changes were saved.",
  },
  "profile/updateAvatar/fulfilled": {
    type: "success",
    title: "Avatar updated",
    message: "Your profile photo was updated.",
  },
  "profile/updatePrivacySettings/fulfilled": {
    type: "success",
    title: "Privacy saved",
    message: "Your privacy settings were updated.",
  },
  "profile/removeAccount/fulfilled": {
    type: "success",
    title: "Account removed",
    message: "Your account has been removed.",
  },
  "posts/commentPost/fulfilled": {
    type: "success",
    title: "Comment posted",
    message: "Your comment was added.",
    duration: 2500,
  },
  "posts/archivePost/fulfilled": {
    type: "success",
    title: "Post archived",
    message: "Moved to your archive.",
  },
  "posts/unarchivePost/fulfilled": {
    type: "success",
    title: "Post restored",
    message: "Moved back from archive.",
  },
  "posts/updatePostCaption/fulfilled": {
    type: "success",
    title: "Caption updated",
    message: "Your post caption was saved.",
  },
  "posts/deletePost/fulfilled": {
    type: "success",
    title: "Post deleted",
    message: "The post was removed.",
  },
  "reels/commentReel/fulfilled": {
    type: "success",
    title: "Comment posted",
    message: "Your reel comment was added.",
    duration: 2500,
  },
  "stories/replyStory/fulfilled": {
    type: "success",
    title: "Reply sent",
    message: "Your story reply was sent.",
    duration: 2500,
  },
  "follow/followUser/fulfilled": {
    type: "success",
    title: "Followed",
    message: "Follow request updated.",
    duration: 2500,
  },
  "follow/unfollowUser/fulfilled": {
    type: "success",
    title: "Unfollowed",
    message: "You are no longer following this user.",
    duration: 2500,
  },
  "follow/acceptFollowRequest/fulfilled": {
    type: "success",
    title: "Request accepted",
    message: "The follow request was accepted.",
  },
  "follow/rejectFollowRequest/fulfilled": {
    type: "success",
    title: "Request declined",
    message: "The follow request was removed.",
  },
  "collections/createCollection/fulfilled": {
    type: "success",
    title: "Collection created",
    message: "Your collection is ready.",
  },
  "collections/updateCollection/fulfilled": {
    type: "success",
    title: "Collection updated",
    message: "Your collection changes were saved.",
  },
  "collections/deleteCollection/fulfilled": {
    type: "success",
    title: "Collection deleted",
    message: "The collection was removed.",
  },
  "collections/addPostToCollection/fulfilled": {
    type: "success",
    title: "Saved to collection",
    message: "Post added to your collection.",
    duration: 2500,
  },
  "collections/removePostFromCollection/fulfilled": {
    type: "success",
    title: "Removed from collection",
    message: "Post removed from this collection.",
  },
  "highlights/createHighlight/fulfilled": {
    type: "success",
    title: "Highlight created",
    message: "Your highlight was created.",
  },
  "highlights/updateHighlight/fulfilled": {
    type: "success",
    title: "Highlight updated",
    message: "Your highlight changes were saved.",
  },
  "highlights/deleteHighlight/fulfilled": {
    type: "success",
    title: "Highlight deleted",
    message: "The highlight was removed.",
  },
  "highlights/addStoryToHighlight/fulfilled": {
    type: "success",
    title: "Story added",
    message: "Story added to highlight.",
  },
  "highlights/removeStoryFromHighlight/fulfilled": {
    type: "success",
    title: "Story removed",
    message: "Story removed from highlight.",
  },
  "safety/blockUser/fulfilled": {
    type: "success",
    title: "User blocked",
    message: "This user can no longer interact with you.",
  },
  "safety/unblockUser/fulfilled": {
    type: "success",
    title: "User unblocked",
    message: "This user can interact with you again.",
  },
  "safety/muteUser/fulfilled": {
    type: "success",
    title: "User muted",
    message: "You will see fewer updates from this user.",
  },
  "safety/unmuteUser/fulfilled": {
    type: "success",
    title: "User unmuted",
    message: "Updates from this user are visible again.",
  },
  "safety/reportUser/fulfilled": {
    type: "success",
    title: "Report submitted",
    message: "Thanks for helping keep the community safe.",
  },
  "safety/reportPost/fulfilled": {
    type: "success",
    title: "Report submitted",
    message: "Thanks for helping keep the community safe.",
  },
  "safety/reportReel/fulfilled": {
    type: "success",
    title: "Report submitted",
    message: "Thanks for helping keep the community safe.",
  },
  "safety/reportComment/fulfilled": {
    type: "success",
    title: "Report submitted",
    message: "Thanks for helping keep the community safe.",
  },
  "sessions/revokeSession/fulfilled": {
    type: "success",
    title: "Session revoked",
    message: "That device session was signed out.",
  },
  "sessions/revokeAllSessions/fulfilled": {
    type: "success",
    title: "Sessions revoked",
    message: "All other sessions were signed out.",
  },
  "notifications/markAllNotificationsRead/fulfilled": {
    type: "success",
    title: "Notifications read",
    message: "All notifications were marked as read.",
    duration: 2500,
  },
  "notifications/deleteNotification/fulfilled": {
    type: "success",
    title: "Notification deleted",
    message: "The notification was removed.",
    duration: 2500,
  },
  "messages/acceptMessageRequest/fulfilled": {
    type: "success",
    title: "Request accepted",
    message: "The conversation is now in your inbox.",
  },
  "messages/rejectMessageRequest/fulfilled": {
    type: "success",
    title: "Request declined",
    message: "The message request was removed.",
  },
  "messages/shareToMessage/fulfilled": {
    type: "success",
    title: "Shared",
    message: "Content sent in chat.",
    duration: 2500,
  },
  "live/startLive/fulfilled": {
    type: "success",
    title: "Live started",
    message: "Your live session is running.",
  },
  "live/endLive/fulfilled": {
    type: "success",
    title: "Live ended",
    message: "Your live session has ended.",
  },
  "admin/blockAdminUser/fulfilled": {
    type: "success",
    title: "User blocked",
    message: "Admin block was applied.",
  },
  "admin/unblockAdminUser/fulfilled": {
    type: "success",
    title: "User unblocked",
    message: "Admin block was removed.",
  },
  "admin/resolveAdminReport/fulfilled": {
    type: "success",
    title: "Report resolved",
    message: "The report was marked resolved.",
  },
  "admin/deleteAdminReport/fulfilled": {
    type: "success",
    title: "Report deleted",
    message: "The report was removed.",
  },
  "admin/deleteAdminPost/fulfilled": {
    type: "success",
    title: "Post removed",
    message: "The reported post was removed.",
  },
  "admin/deleteAdminReel/fulfilled": {
    type: "success",
    title: "Reel removed",
    message: "The reported reel was removed.",
  },
  "admin/deleteAdminComment/fulfilled": {
    type: "success",
    title: "Comment removed",
    message: "The reported comment was removed.",
  },
};

const silentRejectedBases = new Set([
  "auth/getCurrentUser",
  "messages/markConversationSeen",
  "notifications/markNotificationRead",
  "stories/markStoryViewed",
]);

const getToastMessage = (action) => {
  if (typeof action.payload === "string") return action.payload;
  if (action.payload?.message) return action.payload.message;

  return action.error?.message || "Something went wrong. Please try again.";
};

const getBaseActionType = (type, status) => type.replace(`/${status}`, "");

const isQuietReadAction = (action) => {
  const baseType = getBaseActionType(action.type, "rejected");
  const actionName = baseType.split("/").at(-1) || "";

  return (
    silentRejectedBases.has(baseType) ||
    actionName.startsWith("fetch") ||
    actionName.startsWith("get") ||
    actionName === "searchAll"
  );
};

const getFulfilledToast = (action) => {
  const toastConfig = fulfilledToasts[action.type];

  if (!toastConfig) return null;

  return typeof toastConfig === "function" ? toastConfig(action) : toastConfig;
};

export const toastMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  if (action.type?.endsWith("/fulfilled")) {
    const toast = getFulfilledToast(action);

    if (toast) {
      store.dispatch(showToast(toast));
    }
  }

  if (
    action.type?.endsWith("/rejected") &&
    !action.meta?.aborted &&
    !action.meta?.condition &&
    !isQuietReadAction(action)
  ) {
    store.dispatch(
      showToast({
        type: "error",
        title: "Action failed",
        message: getToastMessage(action),
        duration: 5000,
      }),
    );
  }

  return result;
};
