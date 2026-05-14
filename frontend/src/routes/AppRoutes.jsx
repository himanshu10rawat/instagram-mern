import { Route, Routes } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import CreatePage from "../pages/CreatePage";
import ExplorePage from "../pages/ExplorePage";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import MessagesPage from "../pages/MessagesPage";
import NotificationsPage from "../pages/NotificationsPage";
import ProfilePage from "../pages/ProfilePage";
import ReelsPage from "../pages/ReelsPage";
import RegisterPage from "../pages/RegisterPage";
import SearchPage from "../pages/SearchPage";
import SettingsPage from "../pages/SettingsPage";
import VerifyTwoFactorPage from "../pages/VerifyTwoFactorPage";
import ProtectedRoute from "./ProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
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
          <Route path="/profile/:username" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
