import { Copy, KeyRound, QrCode, ShieldCheck, ShieldOff } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { fetchMyProfile } from "../../profile/profileSlice";
import {
  clearTwoFactorStatus,
  disableTwoFactor,
  enableTwoFactor,
  regenerateBackupCodes,
  setupTwoFactor,
} from "../twoFactorSlice";

const BackupCodesBox = ({ backupCodes }) => {
  if (!backupCodes.length) {
    return null;
  }

  const handleCopyCodes = async () => {
    await navigator.clipboard.writeText(backupCodes.join("\n"));
  };

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/60 dark:bg-amber-950/30">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300">
            Save your backup codes
          </h3>

          <p className="mt-1 text-xs text-amber-700 dark:text-amber-200">
            Store these safely. Each code can be used once if you lose your
            authenticator app.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopyCodes}
          className="inline-flex items-center gap-1 rounded-lg bg-amber-900 px-3 py-2 text-xs font-semibold text-white"
        >
          <Copy size={14} />
          Copy
        </button>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {backupCodes.map((code) => (
          <code
            key={code}
            className="rounded-lg bg-white px-3 py-2 text-center text-sm font-semibold text-slate-900 dark:bg-slate-900 dark:text-white"
          >
            {code}
          </code>
        ))}
      </div>
    </div>
  );
};

const TwoFactorSettings = ({ profile }) => {
  const dispatch = useDispatch();

  const {
    setupData,
    backupCodes,
    loading,
    actionLoading,
    error,
    successMessage,
  } = useSelector((state) => state.twoFactor);

  const [enableToken, setEnableToken] = useState("");
  const [disableToken, setDisableToken] = useState("");
  const [regenerateToken, setRegenerateToken] = useState("");

  const isEnabled = Boolean(profile?.twoFactorEnabled);

  const handleSetup = () => {
    dispatch(clearTwoFactorStatus());
    dispatch(setupTwoFactor());
  };

  const handleEnable = async (event) => {
    event.preventDefault();

    if (!enableToken.trim()) return;

    const result = await dispatch(enableTwoFactor(enableToken.trim()));

    if (enableTwoFactor.fulfilled.match(result)) {
      setEnableToken("");
      dispatch(fetchMyProfile());
    }
  };

  const handleDisable = async (event) => {
    event.preventDefault();

    if (!disableToken.trim()) return;

    const result = await dispatch(disableTwoFactor(disableToken.trim()));

    if (disableTwoFactor.fulfilled.match(result)) {
      setDisableToken("");
      dispatch(fetchMyProfile());
    }
  };

  const handleRegenerateCodes = async (event) => {
    event.preventDefault();

    if (!regenerateToken.trim()) return;

    const result = await dispatch(
      regenerateBackupCodes(regenerateToken.trim()),
    );

    if (regenerateBackupCodes.fulfilled.match(result)) {
      setRegenerateToken("");
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
      <div className="mb-5 flex items-center gap-3">
        {isEnabled ? <ShieldCheck size={22} /> : <KeyRound size={22} />}

        <div>
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">
            Two-Factor Authentication
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Protect your account using an authenticator app.
          </p>
        </div>
      </div>

      {error ? (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      {successMessage ? (
        <div className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
          {successMessage}
        </div>
      ) : null}

      <div className="mb-5 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
        <p className="text-sm font-semibold text-slate-950 dark:text-white">
          Status:{" "}
          <span className={isEnabled ? "text-emerald-600" : "text-slate-500"}>
            {isEnabled ? "Enabled" : "Disabled"}
          </span>
        </p>

        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Use Google Authenticator, Microsoft Authenticator, Authy, or any TOTP
          app.
        </p>
      </div>

      {!isEnabled ? (
        <div className="space-y-5">
          {!setupData ? (
            <Button type="button" onClick={handleSetup} disabled={loading}>
              {loading ? "Generating..." : "Setup 2FA"}
            </Button>
          ) : (
            <div className="space-y-5">
              <div className="rounded-xl border border-slate-200 p-4 text-center dark:border-slate-800">
                <div className="mb-3 flex items-center justify-center gap-2 text-sm font-semibold text-slate-950 dark:text-white">
                  <QrCode size={18} />
                  Scan QR Code
                </div>

                <img
                  src={setupData.qrCode}
                  alt="2FA QR Code"
                  className="mx-auto h-52 w-52 rounded-xl bg-white p-2"
                />

                <p className="mt-4 text-xs text-slate-500">
                  Manual secret:{" "}
                  <code className="rounded bg-slate-100 px-2 py-1 dark:bg-slate-900">
                    {setupData.secret}
                  </code>
                </p>
              </div>

              <form onSubmit={handleEnable} className="space-y-4">
                <Input
                  label="Authenticator code"
                  name="enableToken"
                  value={enableToken}
                  onChange={(event) => {
                    setEnableToken(event.target.value);
                    dispatch(clearTwoFactorStatus());
                  }}
                  placeholder="Enter 6-digit code"
                />

                <Button
                  type="submit"
                  disabled={actionLoading || !enableToken.trim()}
                >
                  {actionLoading ? "Enabling..." : "Enable 2FA"}
                </Button>
              </form>
            </div>
          )}

          <BackupCodesBox backupCodes={backupCodes} />
        </div>
      ) : (
        <div className="space-y-5">
          <form onSubmit={handleRegenerateCodes} className="space-y-4">
            <Input
              label="Authenticator code"
              name="regenerateToken"
              value={regenerateToken}
              onChange={(event) => {
                setRegenerateToken(event.target.value);
                dispatch(clearTwoFactorStatus());
              }}
              placeholder="Enter 6-digit code"
            />

            <Button
              type="submit"
              disabled={actionLoading || !regenerateToken.trim()}
            >
              {actionLoading ? "Generating..." : "Regenerate Backup Codes"}
            </Button>
          </form>

          <BackupCodesBox backupCodes={backupCodes} />

          <form
            onSubmit={handleDisable}
            className="rounded-xl border border-red-200 p-4 dark:border-red-900/60"
          >
            <div className="mb-4 flex items-center gap-2 text-red-600">
              <ShieldOff size={18} />
              <h3 className="text-sm font-bold">Disable 2FA</h3>
            </div>

            <Input
              label="Authenticator code"
              name="disableToken"
              value={disableToken}
              onChange={(event) => {
                setDisableToken(event.target.value);
                dispatch(clearTwoFactorStatus());
              }}
              placeholder="Enter 6-digit code"
            />

            <button
              type="submit"
              disabled={actionLoading || !disableToken.trim()}
              className="mt-4 inline-flex rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {actionLoading ? "Disabling..." : "Disable 2FA"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default TwoFactorSettings;
