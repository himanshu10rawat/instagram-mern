import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import ProfileHeader from "../features/profile/components/ProfileHeader";
import ProfilePostsGrid from "../features/profile/components/ProfilePostsGrid";
import ProfileTabs from "../features/profile/components/ProfileTabs";
import ProfileHighlights from "../features/highlights/components/ProfileHighlights";
import {
  fetchMyProfile,
  fetchProfilePosts,
  fetchProfileReels,
  fetchProfileSavedPosts,
  fetchUserProfile,
  resetProfile,
  setProfileActiveTab,
} from "../features/profile/profileSlice";

const getTabItems = ({ activeTab, profilePosts, profileReels, savedPosts }) => {
  if (activeTab === "reels") return profileReels;
  if (activeTab === "saved") return savedPosts;

  return profilePosts;
};

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { username } = useParams();

  const currentUser = useSelector((state) => state.auth.user);
  const {
    activeTab,
    error,
    loading,
    profile,
    profilePosts,
    profileReels,
    savedPosts,
    tabError,
    tabLoading,
  } = useSelector((state) => state.profile);

  const isMyProfile = username === "me" || username === currentUser?.username;

  useEffect(() => {
    if (isMyProfile) {
      dispatch(fetchMyProfile());
    } else {
      dispatch(fetchUserProfile(username));
    }

    return () => {
      dispatch(resetProfile());
    };
  }, [dispatch, isMyProfile, username]);

  useEffect(() => {
    if (!profile?._id) return;

    if (activeTab === "posts") {
      dispatch(fetchProfilePosts(profile._id));
      return;
    }

    if (activeTab === "reels") {
      dispatch(fetchProfileReels(profile._id));
      return;
    }

    if (activeTab === "saved" && isMyProfile) {
      dispatch(fetchProfileSavedPosts());
    }
  }, [activeTab, dispatch, isMyProfile, profile?._id]);

  const handleTabChange = (tab) => {
    if (tab === "saved" && !isMyProfile) return;

    dispatch(setProfileActiveTab(tab));
  };

  const tabItems = getTabItems({
    activeTab,
    profilePosts,
    profileReels,
    savedPosts,
  });

  if (loading && !profile) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Loading profile...
      </p>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
        {error}
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const isPrivateAndLocked =
    profile.isPrivate && !isMyProfile && !profile.posts;

  return (
    <section className="space-y-6">
      <ProfileHeader profile={profile} isMyProfile={isMyProfile} />

      <ProfileHighlights profile={profile} isMyProfile={isMyProfile} />

      {isPrivateAndLocked ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-950">
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
            This account is private
          </h2>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Follow this account to see their photos and videos.
          </p>
        </div>
      ) : (
        <>
          <ProfileTabs
            activeTab={activeTab}
            isMyProfile={isMyProfile}
            onTabChange={handleTabChange}
          />

          {tabError ? (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {tabError}
            </div>
          ) : null}

          <ProfilePostsGrid
            items={tabItems}
            type={activeTab}
            loading={tabLoading}
          />
        </>
      )}
    </section>
  );
};

export default ProfilePage;
