import { Route, Routes } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import CreatePage from "../pages/CreatePage";
import ExplorePage from "../pages/ExplorePage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import MessagesPage from "../pages/MessagesPage";
import NotificationsPage from "../pages/NotificationsPage";
import ProfilePage from "../pages/ProfilePage";
import ReelsPage from "../pages/ReelsPage";
import RegisterPage from "../pages/RegisterPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import SearchPage from "../pages/SearchPage";
import SettingsPage from "../pages/SettingsPage";
import SuggestionsPage from "../pages/SuggestionsPage";
import VerifyEmailPage from "../pages/VerifyEmailPage";
import VerifyTwoFactorPage from "../pages/VerifyTwoFactorPage";
import ProtectedRoute from "./ProtectedRoute";
import EditProfilePage from "../pages/EditProfilePage";
import FollowRequestsPage from "../pages/FollowRequestsPage";
import PostDetailPage from "../pages/PostDetailPage";
import ReelDetailPage from "../pages/ReelDetailPage";
import ArchivedPostsPage from "../pages/ArchivedPostsPage";
import SavedPostsPage from "../pages/SavedPostsPage";
import StoryViewerPage from "../pages/StoryViewerPage";
import SessionsPage from "../pages/SessionsPage";
import SafetySettingsPage from "../pages/SafetySettingsPage";
import CollectionsPage from "../pages/CollectionsPage";
import CollectionDetailPage from "../pages/CollectionDetailPage";
import AnalyticsPage from "../pages/AnalyticsPage";
import LivePage from "../pages/LivePage";
import LiveRoomPage from "../pages/LiveRoomPage";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
      <Route path="/verify-2fa" element={<VerifyTwoFactorPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/reels" element={<ReelsPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/create" element={<CreatePage />} />
          <Route path="/follow-requests" element={<FollowRequestsPage />} />
          <Route path="/profile/:username" element={<ProfilePage />} />
          <Route path="/profile/me/edit" element={<EditProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/suggestions" element={<SuggestionsPage />} />
          <Route path="/posts/:postId" element={<PostDetailPage />} />
          <Route path="/reels/:reelId" element={<ReelDetailPage />} />
          <Route path="/saved" element={<SavedPostsPage />} />
          <Route path="/archive" element={<ArchivedPostsPage />} />
          <Route path="/stories/:storyId" element={<StoryViewerPage />} />
          <Route path="/sessions" element={<SessionsPage />} />
          <Route path="/settings/safety" element={<SafetySettingsPage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route
            path="/collections/:collectionId"
            element={<CollectionDetailPage />}
          />
          <Route path="/live" element={<LivePage />} />
          <Route path="/live/:liveId" element={<LiveRoomPage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
