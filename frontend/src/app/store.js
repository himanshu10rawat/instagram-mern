import { configureStore } from "@reduxjs/toolkit";

import authReducer from "../features/auth/authSlice";
import postReducer from "../features/posts/postSlice";
import recommendationReducer from "../features/profile/recommendationSlice";
import storyReducer from "../features/stories/storySlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postReducer,
    stories: storyReducer,
    recommendations: recommendationReducer,
  },
});
