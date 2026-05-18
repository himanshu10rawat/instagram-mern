import { Calendar, Globe, Settings } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Avatar from "../../../components/common/Avatar";
import { followUser, unfollowUser } from "../../follow/followSlice";
import { fetchUserProfile } from "../profileSlice";

const ProfileHeader = ({ profile, isMyProfile }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

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

  const hasRequested = profile?.followRequests?.some((request) => {
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
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="h-48 bg-slate-100">
        {profile?.coverImage?.url || profile?.cover?.url ? (
          <img
            src={profile.coverImage?.url || profile.cover?.url}
            alt="Cover"
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>

      <div className="px-6 pb-6">
        <div className="-mt-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <Avatar
            src={profile?.avatar?.url}
            alt={profile?.username}
            size="lg"
            ring
          />

          <div className="flex gap-3">
            {isMyProfile ? (
              <>
                <Link
                  to="/profile/me/edit"
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                >
                  Edit Profile
                </Link>

                <Link
                  to="/settings"
                  className="rounded-xl border border-slate-300 p-2 hover:bg-slate-50"
                >
                  <Settings size={20} />
                </Link>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleFollowToggle}
                  disabled={actionLoading || hasRequested}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70 ${
                    isFollowing || hasRequested
                      ? "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
                      : "bg-slate-950 text-white hover:bg-slate-800"
                  }`}
                >
                  {getFollowButtonText()}
                </button>

                <button
                  type="button"
                  onClick={handleMessage}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                >
                  Message
                </button>
              </>
            )}
          </div>
        </div>

        <div className="mt-4">
          <h1 className="text-2xl font-bold text-slate-950">
            {profile?.fullName || "User"}
          </h1>

          <p className="text-sm text-slate-500">@{profile?.username}</p>

          {profile?.bio ? (
            <p className="mt-3 max-w-2xl text-sm text-slate-700">
              {profile.bio}
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
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

        <div className="mt-6 grid grid-cols-3 rounded-2xl border border-slate-200 text-center">
          <div className="p-4">
            <p className="font-bold">{postsCount}</p>
            <p className="text-sm text-slate-500">Posts</p>
          </div>

          <div className="border-x border-slate-200 p-4">
            <p className="font-bold">{followersCount}</p>
            <p className="text-sm text-slate-500">Followers</p>
          </div>

          <div className="p-4">
            <p className="font-bold">{followingCount}</p>
            <p className="text-sm text-slate-500">Following</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
