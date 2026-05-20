import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { Lock } from "lucide-react";

import EmptyState from "../components/ui/EmptyState";
import { ProfilePageSkeleton } from "../components/ui/Skeleton";
import ProfileHeader from "../features/profile/components/ProfileHeader";
import ProfilePostsGrid from "../features/profile/components/ProfilePostsGrid";
import ProfileTabs from "../features/profile/components/ProfileTabs";
import ProfileHighlights from "../features/highlights/components/ProfileHighlights";
import { fetchUserStories } from "../features/stories/storySlice";
import { getStoryRingTone } from "../features/stories/storyViewStatus";
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

const getStoryGroupAuthorId = (storyGroup) => {
  const user = storyGroup?.user || storyGroup?.author || storyGroup?.stories?.[0]?.author;

  return user?._id || user || "";
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
  const storyGroups = useSelector((state) => state.stories.storyGroups);

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

    dispatch(fetchUserStories(profile._id));

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
    return <ProfilePageSkeleton />;
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
  const hasActiveStory = storyGroups.some(
    (storyGroup) =>
      getStoryGroupAuthorId(storyGroup) === profile._id &&
      storyGroup.stories?.length > 0,
  );
  const profileStoryGroup = storyGroups.find(
    (storyGroup) => getStoryGroupAuthorId(storyGroup) === profile._id,
  );
  const storyRingTone = getStoryRingTone({
    authorId: profile._id,
    currentUserId: currentUser?._id,
    stories: profileStoryGroup?.stories || [],
  });

  return (
    <section className="space-y-6">
      <ProfileHeader
        profile={profile}
        isMyProfile={isMyProfile}
        hasActiveStory={hasActiveStory}
        storyRingTone={storyRingTone}
      />

      <ProfileHighlights profile={profile} isMyProfile={isMyProfile} />

      {isPrivateAndLocked ? (
        <EmptyState
          icon={Lock}
          iconTone="slate"
          title="This account is private"
          description="Follow this account to see their photos and videos."
        />
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
