import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";

const LoginPage = lazy(() => import("../pages/LoginPage"));
const RegisterPage = lazy(() => import("../pages/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("../pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("../pages/ResetPasswordPage"));
const VerifyEmailPage = lazy(() => import("../pages/VerifyEmailPage"));
const VerifyTwoFactorPage = lazy(() => import("../pages/VerifyTwoFactorPage"));
const HomePage = lazy(() => import("../pages/HomePage"));
const SearchPage = lazy(() => import("../pages/SearchPage"));
const ExplorePage = lazy(() => import("../pages/ExplorePage"));
const ReelsPage = lazy(() => import("../pages/ReelsPage"));
const MessagesPage = lazy(() => import("../pages/MessagesPage"));
const NotificationsPage = lazy(() => import("../pages/NotificationsPage"));
const CreatePage = lazy(() => import("../pages/CreatePage"));
const FollowRequestsPage = lazy(() => import("../pages/FollowRequestsPage"));
const ProfilePage = lazy(() => import("../pages/ProfilePage"));
const EditProfilePage = lazy(() => import("../pages/EditProfilePage"));
const SettingsPage = lazy(() => import("../pages/SettingsPage"));
const SuggestionsPage = lazy(() => import("../pages/SuggestionsPage"));
const AnalyticsPage = lazy(() => import("../pages/AnalyticsPage"));
const PostDetailPage = lazy(() => import("../pages/PostDetailPage"));
const ReelDetailPage = lazy(() => import("../pages/ReelDetailPage"));
const SavedPostsPage = lazy(() => import("../pages/SavedPostsPage"));
const ArchivedPostsPage = lazy(() => import("../pages/ArchivedPostsPage"));
const StoryViewerPage = lazy(() => import("../pages/StoryViewerPage"));
const SessionsPage = lazy(() => import("../pages/SessionsPage"));
const SafetySettingsPage = lazy(() => import("../pages/SafetySettingsPage"));
const CollectionsPage = lazy(() => import("../pages/CollectionsPage"));
const CollectionDetailPage = lazy(
  () => import("../pages/CollectionDetailPage"),
);
const LivePage = lazy(() => import("../pages/LivePage"));
const LiveRoomPage = lazy(() => import("../pages/LiveRoomPage"));
const AdminDashboardPage = lazy(
  () => import("../features/admin/components/AdminDashboardPage"),
);
const AdminUsersPage = lazy(() => import("../pages/admin/AdminUsersPage"));
const AdminReportsPage = lazy(() => import("../pages/admin/AdminReportsPage"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage"));
const UnauthorizedPage = lazy(() => import("../pages/UnauthorizedPage"));

const LoadingFallback = () => (
  <div className="flex min-h-screen items-center justify-center p-6 text-sm text-slate-500 dark:text-slate-400">
    Loading...
  </div>
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
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
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/reports" element={<AdminReportsPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
