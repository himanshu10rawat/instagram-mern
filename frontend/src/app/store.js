import { configureStore } from "@reduxjs/toolkit";

import authReducer from "../features/auth/authSlice";
import createReducer from "../features/create/createSlice";
import followReducer from "../features/follow/followSlice";
import messageReducer from "../features/messages/messageSlice";
import notificationReducer from "../features/notifications/notificationSlice";
import postReducer from "../features/posts/postSlice";
import profileReducer from "../features/profile/profileSlice";
import recommendationReducer from "../features/profile/recommendationSlice";
import reelReducer from "../features/reels/reelSlice";
import searchReducer from "../features/search/searchSlice";
import storyReducer from "../features/stories/storySlice";
import themeReducer from "../features/theme/themeSlice";
import highlightReducer from "../features/highlights/highlightSlice";
import sessionReducer from "../features/sessions/sessionSlice";
import twoFactorReducer from "../features/twoFactor/twoFactorSlice";
import safetyReducer from "../features/safety/safetySlice";
import collectionReducer from "../features/collections/collectionSlice";
import analyticsReducer from "../features/analytics/analyticsSlice";
import liveReducer from "../features/live/liveSlice";

export const store = configureStore({
  reducer: {
    analytics: analyticsReducer,
    auth: authReducer,
    create: createReducer,
    follow: followReducer,
    messages: messageReducer,
    notifications: notificationReducer,
    posts: postReducer,
    profile: profileReducer,
    recommendations: recommendationReducer,
    reels: reelReducer,
    search: searchReducer,
    stories: storyReducer,
    theme: themeReducer,
    highlights: highlightReducer,
    sessions: sessionReducer,
    twoFactor: twoFactorReducer,
    safety: safetyReducer,
    collections: collectionReducer,
    live: liveReducer,
  },
});
