import { Camera } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import Input from "../components/ui/Input";
import { SkeletonBlock } from "../components/ui/Skeleton";
import {
  clearProfileStatus,
  fetchMyProfile,
  updateAvatar,
  updateProfile,
} from "../features/profile/profileSlice";

const EditProfileForm = ({ profile, updating }) => {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState(() => ({
    fullName: profile?.fullName || "",
    bio: profile?.bio || "",
    website: profile?.website || "",
    isPrivate: Boolean(profile?.isPrivate),
  }));

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    dispatch(clearProfileStatus());
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];

    if (file) {
      await dispatch(updateAvatar(file));
      event.target.value = "";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    await dispatch(
      updateProfile({
        fullName: formData.fullName.trim(),
        bio: formData.bio.trim(),
        website: formData.website.trim(),
        isPrivate: formData.isPrivate,
      }),
    );
  };

  return (
    <>
      <div className="mt-6 rounded-xl border border-slate-200 p-4 dark:border-slate-800 sm:rounded-2xl">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <label className="relative block h-24 w-24 shrink-0 cursor-pointer overflow-hidden rounded-full bg-slate-100 dark:bg-slate-900">
            {profile?.avatar?.url ? (
              <img
                src={profile.avatar.url}
                alt="Avatar"
                className="h-full w-full object-cover"
              />
            ) : null}

            <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-white">
              <Camera size={22} />
            </div>

            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </label>

          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              Profile photo
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Click the photo to upload a new avatar.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <Input
          label="Full name"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="Enter full name"
        />

        <div>
          <label
            htmlFor="bio"
            className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Bio
          </label>

          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={4}
            maxLength={150}
            placeholder="Write your bio"
            className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none transition focus:border-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-white sm:text-sm"
          />

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {formData.bio.length}/150
          </p>
        </div>

        <Input
          label="Website"
          name="website"
          value={formData.website}
          onChange={handleChange}
          placeholder="https://example.com"
        />

        <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-800">
          <span>
            <span className="block text-sm font-semibold text-slate-900 dark:text-white">
              Private account
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Only approved followers can see your posts.
            </span>
          </span>

          <input
            type="checkbox"
            name="isPrivate"
            checked={formData.isPrivate}
            onChange={handleChange}
            className="h-5 w-5"
          />
        </label>

        <Button type="submit" disabled={updating}>
          {updating ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </>
  );
};

const EditProfilePage = () => {
  const dispatch = useDispatch();

  const { profile, loading, updating, error, successMessage } = useSelector(
    (state) => state.profile,
  );

  useEffect(() => {
    dispatch(fetchMyProfile());
  }, [dispatch]);

  if (loading && !profile) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <SkeletonBlock className="h-24 w-24 rounded-full" />
        <SkeletonBlock className="h-12 rounded-xl" />
        <SkeletonBlock className="h-28 rounded-xl" />
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-3xl">
      <div className="mobile-edge rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 sm:rounded-2xl sm:p-6">
        <h1 className="text-2xl font-bold text-slate-950 dark:text-white">
          Edit Profile
        </h1>

        {error ? (
          <div className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        {successMessage ? (
          <div className="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
            {successMessage}
          </div>
        ) : null}

        {profile ? (
          <EditProfileForm
            key={profile._id}
            profile={profile}
            updating={updating}
          />
        ) : (
          <EmptyState
            icon={Camera}
            title="Profile not found"
            description="We could not load your editable profile details."
            variant="subtle"
            className="mt-6"
          />
        )}
      </div>
    </section>
  );
};

export default EditProfilePage;
