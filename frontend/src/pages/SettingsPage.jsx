import {
  Lock,
  Moon,
  Shield,
  Trash2,
  MonitorSmartphone,
  ShieldAlert,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import {
  changePassword,
  clearAuthStatus,
  logoutLocally,
} from "../features/auth/authSlice";
import {
  clearProfileStatus,
  fetchMyProfile,
  removeAccount,
  updatePrivacySettings,
} from "../features/profile/profileSlice";
import { setTheme } from "../features/theme/themeSlice";
import TwoFactorSettings from "../features/twoFactor/components/TwoFactorSettings";

const SettingsAlerts = ({
  error,
  successMessage,
  authError,
  authSuccessMessage,
}) => {
  return (
    <>
      {error ? (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
          {successMessage}
        </div>
      ) : null}

      {authError ? (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {authError}
        </div>
      ) : null}

      {authSuccessMessage ? (
        <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
          {authSuccessMessage}
        </div>
      ) : null}
    </>
  );
};

const PrivacySettingsForm = ({ initialPrivacyForm, updating }) => {
  const dispatch = useDispatch();

  const [privacyForm, setPrivacyForm] = useState(initialPrivacyForm);

  const handlePrivacyChange = (event) => {
    const { name, value, type, checked } = event.target;

    setPrivacyForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    dispatch(clearProfileStatus());
  };

  const handlePrivacySubmit = async (event) => {
    event.preventDefault();

    await dispatch(
      updatePrivacySettings({
        isPrivate: privacyForm.isPrivate,
        privacySettings: {
          allowMessagesFrom: privacyForm.allowMessagesFrom,
          showActivityStatus: privacyForm.showActivityStatus,
        },
      }),
    );
  };

  return (
    <form
      onSubmit={handlePrivacySubmit}
      className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950"
    >
      <div className="mb-5 flex items-center gap-3">
        <Shield size={22} />
        <h2 className="text-lg font-bold text-slate-950 dark:text-white">
          Privacy
        </h2>
      </div>

      <div className="space-y-4">
        <label className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-800">
          <span>
            <span className="block text-sm font-semibold text-slate-950 dark:text-white">
              Private account
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Only approved followers can see your posts.
            </span>
          </span>

          <input
            type="checkbox"
            name="isPrivate"
            checked={privacyForm.isPrivate}
            onChange={handlePrivacyChange}
            className="h-5 w-5"
          />
        </label>

        <div>
          <label
            htmlFor="allowMessagesFrom"
            className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Allow messages from
          </label>

          <select
            id="allowMessagesFrom"
            name="allowMessagesFrom"
            value={privacyForm.allowMessagesFrom}
            onChange={handlePrivacyChange}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            <option value="everyone">Everyone</option>
            <option value="followers">Followers only</option>
            <option value="none">No one</option>
          </select>
        </div>

        <label className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-800">
          <span>
            <span className="block text-sm font-semibold text-slate-950 dark:text-white">
              Show activity status
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Show when you are online.
            </span>
          </span>

          <input
            type="checkbox"
            name="showActivityStatus"
            checked={privacyForm.showActivityStatus}
            onChange={handlePrivacyChange}
            className="h-5 w-5"
          />
        </label>

        <Button type="submit" disabled={updating}>
          {updating ? "Saving..." : "Save Privacy Settings"}
        </Button>
      </div>
    </form>
  );
};

const PasswordSettingsForm = ({ authLoading }) => {
  const dispatch = useDispatch();

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const passwordMismatch =
    passwordForm.confirmPassword &&
    passwordForm.newPassword !== passwordForm.confirmPassword;

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    dispatch(clearAuthStatus());
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return;
    }

    const result = await dispatch(
      changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      }),
    );

    if (changePassword.fulfilled.match(result)) {
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  };

  return (
    <form
      onSubmit={handlePasswordSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950"
    >
      <div className="mb-5 flex items-center gap-3">
        <Lock size={22} />
        <h2 className="text-lg font-bold text-slate-950 dark:text-white">
          Change Password
        </h2>
      </div>

      <div className="space-y-4">
        <Input
          label="Current password"
          name="currentPassword"
          type="password"
          value={passwordForm.currentPassword}
          onChange={handlePasswordChange}
          placeholder="Enter current password"
        />

        <Input
          label="New password"
          name="newPassword"
          type="password"
          value={passwordForm.newPassword}
          onChange={handlePasswordChange}
          placeholder="Enter new password"
        />

        <Input
          label="Confirm new password"
          name="confirmPassword"
          type="password"
          value={passwordForm.confirmPassword}
          onChange={handlePasswordChange}
          placeholder="Confirm new password"
        />

        {passwordMismatch ? (
          <p className="text-sm text-red-600">Passwords do not match.</p>
        ) : null}

        <Button
          type="submit"
          disabled={
            authLoading ||
            Boolean(passwordMismatch) ||
            !passwordForm.currentPassword ||
            !passwordForm.newPassword ||
            !passwordForm.confirmPassword
          }
        >
          {authLoading ? "Updating..." : "Change Password"}
        </Button>
      </div>
    </form>
  );
};

<div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
  <div className="mb-4 flex items-center gap-3">
    <MonitorSmartphone size={22} />

    <h2 className="text-lg font-bold text-slate-950 dark:text-white">
      Login Activity
    </h2>
  </div>

  <p className="text-sm text-slate-500">
    View active devices and logout sessions you do not recognize.
  </p>

  <Link
    to="/sessions"
    className="mt-4 inline-flex rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white dark:bg-white dark:text-slate-950"
  >
    Manage Sessions
  </Link>
</div>;

const ThemeSettings = ({ theme }) => {
  const dispatch = useDispatch();
  const themes = ["system", "light", "dark"];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
      <div className="mb-5 flex items-center gap-3">
        <Moon size={22} />
        <h2 className="text-lg font-bold text-slate-950 dark:text-white">
          Theme
        </h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {themes.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => dispatch(setTheme(item))}
            className={`rounded-xl border px-4 py-3 text-sm font-semibold capitalize ${
              theme === item
                ? "border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950"
                : "border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
};

const DangerZone = ({ updating }) => {
  const dispatch = useDispatch();
  const [confirmText, setConfirmText] = useState("");
  const [password, setPassword] = useState("");

  const handleRemove = async () => {
    if (confirmText !== "DELETE" || !password) return;

    const result = await dispatch(removeAccount(password));

    if (removeAccount.fulfilled.match(result)) {
      dispatch(logoutLocally());
    }
  };

  return (
    <div className="rounded-2xl border border-red-200 bg-white p-6 dark:bg-slate-950">
      <div className="mb-5 flex items-center gap-3 text-red-600">
        <Trash2 size={22} />
        <h2 className="text-lg font-bold">Danger Zone</h2>
      </div>

      <p className="text-sm text-slate-500 dark:text-slate-400">
        Type <b>DELETE</b> and enter your password to remove your account.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Input
          label="Confirmation"
          name="confirmText"
          value={confirmText}
          onChange={(event) => {
            setConfirmText(event.target.value);
            dispatch(clearProfileStatus());
          }}
          placeholder="DELETE"
        />

        <Input
          label="Password"
          name="password"
          type="password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            dispatch(clearProfileStatus());
          }}
          placeholder="Enter your password"
        />
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={handleRemove}
          disabled={confirmText !== "DELETE" || !password || updating}
          className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          <Trash2 size={18} />
          Delete Account
        </button>
      </div>
    </div>
  );
};

const SettingsPage = () => {
  const dispatch = useDispatch();

  const { profile, loading, updating, error, successMessage } = useSelector(
    (state) => state.profile,
  );

  const {
    loading: authLoading,
    error: authError,
    successMessage: authSuccessMessage,
  } = useSelector((state) => state.auth);

  const { theme } = useSelector((state) => state.theme);

  useEffect(() => {
    dispatch(fetchMyProfile());
  }, [dispatch]);

  const initialPrivacyForm = useMemo(
    () => ({
      isPrivate: Boolean(profile?.isPrivate),
      allowMessagesFrom:
        profile?.privacySettings?.allowMessagesFrom || "everyone",
      showActivityStatus:
        profile?.privacySettings?.showActivityStatus !== false,
    }),
    [
      profile?.isPrivate,
      profile?.privacySettings?.allowMessagesFrom,
      profile?.privacySettings?.showActivityStatus,
    ],
  );

  if (loading && !profile) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Loading settings...
      </p>
    );
  }

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950 dark:text-white">
          Settings
        </h1>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage account privacy, password, theme and account actions.
        </p>
      </div>

      <SettingsAlerts
        error={error}
        successMessage={successMessage}
        authError={authError}
        authSuccessMessage={authSuccessMessage}
      />

      {profile ? (
        <PrivacySettingsForm
          key={profile._id}
          initialPrivacyForm={initialPrivacyForm}
          updating={updating}
        />
      ) : null}

      <PasswordSettingsForm authLoading={authLoading} />

      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-4 flex items-center gap-3">
          <ShieldAlert size={22} />

          <h2 className="text-lg font-bold text-slate-950 dark:text-white">
            Safety
          </h2>
        </div>

        <p className="text-sm text-slate-500">
          Manage blocked users, muted users, and account safety controls.
        </p>

        <Link
          to="/settings/safety"
          className="mt-4 inline-flex rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white dark:bg-white dark:text-slate-950"
        >
          Manage Safety
        </Link>
      </div>

      {profile ? <TwoFactorSettings profile={profile} /> : null}

      <ThemeSettings theme={theme} />

      <DangerZone updating={updating} />
    </section>
  );
};

export default SettingsPage;
