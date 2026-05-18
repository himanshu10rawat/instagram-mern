import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import ProfileHeader from "../features/profile/components/ProfileHeader";
import ProfilePostsGrid from "../features/profile/components/ProfilePostsGrid";
import {
  fetchMyProfile,
  fetchUserProfile,
  resetProfile,
} from "../features/profile/profileSlice";

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { username } = useParams();

  const currentUser = useSelector((state) => state.auth.user);
  const { profile, loading, error } = useSelector((state) => state.profile);

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
  }, [dispatch, username, isMyProfile]);

  if (loading) {
    return <p className="text-sm text-slate-500">Loading profile...</p>;
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

  return (
    <section className="space-y-6">
      <ProfileHeader profile={profile} isMyProfile={isMyProfile} />

      <ProfilePostsGrid posts={profile.posts || []} />
    </section>
  );
};

export default ProfilePage;
