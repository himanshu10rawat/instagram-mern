import { Calendar, Globe, Lock, Settings, Share2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Avatar from "../../../components/common/Avatar";
import ShareModal from "../../messages/components/ShareModal";
import ProfileSafetyMenu from "../../safety/components/ProfileSafetyMenu";
import { followUser, unfollowUser } from "../../follow/followSlice";
import { fetchUserProfile } from "../profileSlice";
import FollowListModal from "./FollowListModal";

const ProfileHeader = ({ profile, isMyProfile }) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [followListType, setFollowListType] = useState(null);

  const currentUser = useSelector((state) => state.auth.user);
  const { actionLoading } = useSelector((state) => state.follow);

  const followersCount =
    profile?.followers?.length || profile?.followersCount || 0;
  const followingCount =
    profile?.following?.length || profile?.followingCount || 0;
  const postsCount = profile?.postsCount || profile?.posts?.length || 0;

  const isFollowing = profile?.followers?.some((follower) => {
    if (typeof follower === "string") {
      return follower === currentUser?._id;
    }

    return follower?._id === currentUser?._id;
  });

  const hasRequested =
    profile?.hasPendingFollowRequest ||
    profile?.followRequests?.some((request) => {
      if (typeof request === "string") {
        return request === currentUser?._id;
      }

      return request?._id === currentUser?._id;
    });

  const handleFollowToggle = async () => {
    if (!profile?._id) return;

    let result;

    if (isFollowing) {
      result = await dispatch(unfollowUser(profile._id));
    } else {
      result = await dispatch(followUser(profile._id));
    }

    if (
      followUser.fulfilled.match(result) ||
      unfollowUser.fulfilled.match(result)
    ) {
      dispatch(fetchUserProfile(profile.username));
    }
  };

  const handleMessage = () => {
    navigate(`/messages?user=${profile._id}`);
  };

  const getFollowButtonText = () => {
    if (actionLoading) return "Please wait...";
    if (isFollowing) return "Following";
    if (hasRequested) return "Requested";
    return profile?.isPrivate ? "Request" : "Follow";
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="h-48 bg-slate-100 dark:bg-slate-900">
        {profile?.coverImage?.url || profile?.cover?.url ? (
          <img
            src={profile.coverImage?.url || profile.cover?.url}
            alt="Cover"
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>

      <div className="px-6 pb-6">
        <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="-mt-14">
            <Avatar
              src={profile?.avatar?.url}
              alt={profile?.username}
              size="lg"
              ring
            />
          </div>

          <div className="flex flex-wrap gap-3">
            {isMyProfile ? (
              <>
                <Link
                  to="/profile/me/edit"
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:text-white dark:hover:bg-slate-900"
                >
                  Edit Profile
                </Link>

                <Link
                  to="/settings"
                  className="rounded-xl border border-slate-300 p-2 text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:text-white dark:hover:bg-slate-900"
                  aria-label="Settings"
                >
                  <Settings size={20} />
                </Link>

                <button
                  type="button"
                  onClick={() => setShowShareModal(true)}
                  className="rounded-xl border border-slate-300 p-2 text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:text-white dark:hover:bg-slate-900"
                  aria-label="Share profile"
                >
                  <Share2 size={20} />
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleFollowToggle}
                  disabled={actionLoading || hasRequested}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70 ${
                    isFollowing || hasRequested
                      ? "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:hover:bg-slate-900"
                      : "bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950"
                  }`}
                >
                  {getFollowButtonText()}
                </button>

                <button
                  type="button"
                  onClick={handleMessage}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:text-white dark:hover:bg-slate-900"
                >
                  Message
                </button>

                <ProfileSafetyMenu profile={profile} />

                <button
                  type="button"
                  onClick={() => setShowShareModal(true)}
                  className="rounded-xl border border-slate-300 p-2 text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:text-white dark:hover:bg-slate-900"
                  aria-label="Share profile"
                >
                  <Share2 size={20} />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="mt-4">
          <h1 className="text-2xl font-bold text-slate-950 dark:text-white">
            {profile?.fullName || "User"}
          </h1>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <span>@{profile?.username}</span>

            {profile?.isPrivate ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                <Lock size={12} />
                Private
              </span>
            ) : null}
          </div>

          {profile?.bio ? (
            <p className="mt-3 max-w-2xl text-sm text-slate-700 dark:text-slate-300">
              {profile.bio}
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
            {profile?.website ? (
              <a
                href={profile.website}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 font-medium text-blue-600"
              >
                <Globe size={16} />
                {profile.website}
              </a>
            ) : null}

            {profile?.createdAt ? (
              <span className="flex items-center gap-1">
                <Calendar size={16} />
                Joined {new Date(profile.createdAt).toLocaleDateString()}
              </span>
            ) : null}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 overflow-hidden rounded-2xl border border-slate-200 text-center dark:border-slate-800">
          <div className="p-4">
            <p className="font-bold">{postsCount}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Posts</p>
          </div>

          <button
            type="button"
            onClick={() => setFollowListType("followers")}
            className="border-x border-slate-200 p-4 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
          >
            <p className="font-bold">{followersCount}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Followers
            </p>
          </button>

          <button
            type="button"
            onClick={() => setFollowListType("following")}
            className="p-4 transition hover:bg-slate-50 dark:hover:bg-slate-900"
          >
            <p className="font-bold">{followingCount}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Following
            </p>
          </button>
        </div>
      </div>

      {followListType ? (
        <FollowListModal
          profileId={profile._id}
          type={followListType}
          onClose={() => setFollowListType(null)}
        />
      ) : null}

      <ShareModal
        open={showShareModal}
        onClose={() => setShowShareModal(false)}
        sharePayload={{
          type: "profile",
          profileId: profile._id,
        }}
      />
    </div>
  );
};

export default ProfileHeader;
