import { Camera } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import {
  clearProfileStatus,
  fetchMyProfile,
  updateAvatar,
  updateCover,
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

  const handleCoverChange = async (event) => {
    const file = event.target.files?.[0];

    if (file) {
      await dispatch(updateCover(file));
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
      <div className="mt-6 space-y-6">
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Cover photo</p>

          <label className="relative flex h-44 cursor-pointer items-center justify-center overflow-hidden rounded-2xl bg-slate-100">
            {profile?.coverImage?.url || profile?.cover?.url ? (
              <img
                src={profile.coverImage?.url || profile.cover?.url}
                alt="Cover"
                className="h-full w-full object-cover"
              />
            ) : null}

            <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-white">
              <Camera size={24} />
            </div>

            <input
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              className="hidden"
            />
          </label>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Avatar</p>

          <label className="relative block h-24 w-24 cursor-pointer overflow-hidden rounded-full bg-slate-100">
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
            className="mb-1 block text-sm font-medium text-slate-700"
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
            className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900"
          />

          <p className="mt-1 text-xs text-slate-500">
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

        <label className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
          <span>
            <span className="block text-sm font-semibold text-slate-900">
              Private account
            </span>
            <span className="text-xs text-slate-500">
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
    return <p className="text-sm text-slate-500">Loading profile...</p>;
  }

  return (
    <section className="mx-auto max-w-3xl">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-slate-950">Edit Profile</h1>

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
          <p className="mt-6 text-sm text-slate-500">Profile not found.</p>
        )}
      </div>
    </section>
  );
};

export default EditProfilePage;
