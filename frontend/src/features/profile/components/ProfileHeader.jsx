import {
  BriefcaseBusiness,
  Calendar,
  Globe,
  Lock,
  MapPin,
  Settings,
  Share2,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Avatar from "../../../components/common/Avatar";
import ShareModal from "../../messages/components/ShareModal";
import ProfileSafetyMenu from "../../safety/components/ProfileSafetyMenu";
import {
  acceptFollowRequest,
  cancelFollowRequest,
  followUser,
  rejectFollowRequest,
  unfollowUser,
} from "../../follow/followSlice";
import { fetchUserProfile } from "../profileSlice";
import FollowListModal from "./FollowListModal";

const accountTypeLabels = {
  personal: "Personal",
  creator: "Creator",
  business: "Business",
};

const genderLabels = {
  male: "Male",
  female: "Female",
  other: "Other",
};

const ProfileHeader = ({
  profile,
  isMyProfile,
  hasActiveStory = false,
  storyRingTone = "active",
}) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [optimisticRequested, setOptimisticRequested] = useState(false);
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
  const accountTypeLabel = accountTypeLabels[profile?.accountType];
  const genderLabel =
    profile?.gender && profile.gender !== "prefer_not_to_say"
      ? genderLabels[profile.gender]
      : "";

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
  const incomingFollowRequest = profile?.incomingFollowRequest;
  const hasIncomingFollowRequest =
    incomingFollowRequest?.status === "pending" && incomingFollowRequest?._id;
  const hasOutgoingFollowRequest = hasRequested || optimisticRequested;

  const handleFollowToggle = async () => {
    if (!profile?._id) return;

    let result;

    setIsProcessing(true);

    try {
      if (isFollowing) {
        result = await dispatch(unfollowUser(profile._id));
      } else if (hasOutgoingFollowRequest) {
        result = await dispatch(cancelFollowRequest(profile._id));
      } else {
        // optimistic UI: mark requested immediately
        setOptimisticRequested(true);
        result = await dispatch(followUser(profile._id));
      }

      if (
        followUser.fulfilled.match(result) ||
        unfollowUser.fulfilled.match(result) ||
        cancelFollowRequest.fulfilled.match(result)
      ) {
        if (cancelFollowRequest.fulfilled.match(result)) {
          setOptimisticRequested(false);
        }

        // refresh profile state
        await dispatch(fetchUserProfile(profile.username));
      } else if (
        followUser.rejected.match(result) &&
        result.payload === "Follow request already sent"
      ) {
        setOptimisticRequested(true);
        await dispatch(fetchUserProfile(profile.username));
      } else {
        // revert optimistic on failure
        setOptimisticRequested(false);
      }
    } catch {
      setOptimisticRequested(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleIncomingFollowRequest = async (action) => {
    if (!incomingFollowRequest?._id || !profile?.username) return;

    setIsProcessing(true);

    try {
      const result =
        action === "accept"
          ? await dispatch(acceptFollowRequest(incomingFollowRequest._id))
          : await dispatch(rejectFollowRequest(incomingFollowRequest._id));

      const isFulfilled =
        acceptFollowRequest.fulfilled.match(result) ||
        rejectFollowRequest.fulfilled.match(result);

      if (isFulfilled) {
        await dispatch(fetchUserProfile(profile.username));
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMessage = () => {
    navigate(`/messages?user=${profile._id}`);
  };

  const getFollowButtonText = () => {
    if (actionLoading) return "Please wait...";
    if (isFollowing) return "Following";
    if (hasOutgoingFollowRequest) return "Cancel request";
    return profile?.isPrivate ? "Request" : "Follow";
  };

  return (
    <div className="mobile-edge rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
          <div className="shrink-0">
            <Avatar
              src={profile?.avatar?.url}
              alt={profile?.username}
              size="lg"
              ring={hasActiveStory}
              ringTone={storyRingTone}
            />
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="wrap-break-word text-xl font-bold text-slate-950 dark:text-white sm:text-2xl">
              {profile?.fullName || "User"}
            </h1>

            <div className="mt-1 flex flex-wrap items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400 sm:justify-start">
              <span>@{profile?.username}</span>

              {profile?.isPrivate ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                  <Lock size={12} />
                  Private
                </span>
              ) : null}
            </div>

            {profile?.bio ? (
              <p className="mt-3 max-w-2xl wrap-break-word text-sm text-slate-700 dark:text-slate-300">
                {profile.bio}
              </p>
            ) : null}

            {profile?.profession ||
            profile?.location ||
            accountTypeLabel ||
            genderLabel ? (
              <div className="mt-3 flex flex-wrap justify-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300 sm:justify-start">
                {profile?.profession ? (
                  <span className="inline-flex min-h-7 items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 dark:bg-slate-900">
                    <BriefcaseBusiness size={13} />
                    {profile.profession}
                  </span>
                ) : null}

                {profile?.location ? (
                  <span className="inline-flex min-h-7 items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 dark:bg-slate-900">
                    <MapPin size={13} />
                    {profile.location}
                  </span>
                ) : null}

                {accountTypeLabel ? (
                  <span className="inline-flex min-h-7 items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 dark:bg-slate-900">
                    <Sparkles size={13} />
                    {accountTypeLabel}
                  </span>
                ) : null}

                {genderLabel ? (
                  <span className="inline-flex min-h-7 items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 dark:bg-slate-900">
                    <UserRound size={13} />
                    {genderLabel}
                  </span>
                ) : null}
              </div>
            ) : null}

            <div className="mt-4 flex flex-col items-center gap-2 text-sm text-slate-600 dark:text-slate-400 sm:flex-row sm:flex-wrap sm:items-start sm:gap-4">
              {profile?.website ? (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-w-0 max-w-full items-center gap-1 break-all font-medium text-blue-600"
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
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap lg:justify-end">
          {isMyProfile ? (
            <>
              <Link
                to="/profile/me/edit"
                className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:text-white dark:hover:bg-slate-900"
              >
                Edit Profile
              </Link>

              <Link
                to="/settings"
                className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-300 p-2 text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:text-white dark:hover:bg-slate-900"
                aria-label="Settings"
              >
                <Settings size={20} />
              </Link>

              <button
                type="button"
                onClick={() => setShowShareModal(true)}
                className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-300 p-2 text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:text-white dark:hover:bg-slate-900"
                aria-label="Share profile"
              >
                <Share2 size={20} />
              </button>
            </>
          ) : (
            <>
              {hasIncomingFollowRequest ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleIncomingFollowRequest("accept")}
                    disabled={actionLoading || isProcessing}
                    className={`inline-flex min-h-10 items-center justify-center rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950`}
                  >
                    Accept
                  </button>

                  <button
                    type="button"
                    onClick={() => handleIncomingFollowRequest("reject")}
                    disabled={actionLoading || isProcessing}
                    className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-white dark:hover:bg-slate-900"
                  >
                    Decline
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleFollowToggle}
                  disabled={actionLoading || isProcessing}
                  className={`inline-flex min-h-10 items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                    actionLoading || isProcessing
                      ? "cursor-not-allowed opacity-60"
                      : ""
                  } ${
                    isFollowing || hasRequested || optimisticRequested
                      ? "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:hover:bg-slate-900"
                      : "bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950"
                  }`}
                >
                  {isProcessing ? (
                    <svg
                      className="h-4 w-4 animate-spin mr-2"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                  ) : null}

                  {getFollowButtonText()}
                </button>
              )}

              <button
                type="button"
                onClick={handleMessage}
                className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:text-white dark:hover:bg-slate-900"
              >
                Message
              </button>

              <ProfileSafetyMenu profile={profile} />

              <button
                type="button"
                onClick={() => setShowShareModal(true)}
                className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-300 p-2 text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:text-white dark:hover:bg-slate-900"
                aria-label="Share profile"
              >
                <Share2 size={20} />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 overflow-hidden rounded-xl border border-slate-200 text-center dark:border-slate-800">
        <div className="p-3 sm:p-4">
          <p className="font-bold">{postsCount}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
            Posts
          </p>
        </div>

        <button
          type="button"
          onClick={() => setFollowListType("followers")}
          className="border-x border-slate-200 p-3 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900 sm:p-4"
        >
          <p className="font-bold">{followersCount}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
            Followers
          </p>
        </button>

        <button
          type="button"
          onClick={() => setFollowListType("following")}
          className="p-3 transition hover:bg-slate-50 dark:hover:bg-slate-900 sm:p-4"
        >
          <p className="font-bold">{followingCount}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
            Following
          </p>
        </button>
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
