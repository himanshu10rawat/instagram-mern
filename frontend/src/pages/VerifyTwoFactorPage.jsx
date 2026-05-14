import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { setCredentials } from "../features/auth/authSlice";
import api from "../lib/axios";

const VerifyTwoFactorPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { requiresTwoFactor, twoFactorUserId, isAuthenticated } = useSelector(
    (state) => state.auth,
  );

  const [token, setToken] = useState("");
  const [backupCode, setBackupCode] = useState("");
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (!requiresTwoFactor || !twoFactorUserId) {
    return <Navigate to="/login" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const code = useBackupCode ? backupCode.trim() : token.trim();

    if (!code) {
      setError(
        useBackupCode
          ? "Backup code is required"
          : "Authenticator code is required",
      );
      return;
    }

    setLoading(true);

    try {
      const payload = {
        userId: twoFactorUserId,
      };

      if (useBackupCode) {
        payload.backupCode = code;
      } else {
        payload.token = code;
      }

      const response = await api.post("/auth/verify-2fa-login", payload);
      const data = response.data.data;

      dispatch(setCredentials(data));

      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "2FA verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-center text-3xl font-bold text-slate-900">
          Verify 2FA
        </h1>

        <p className="mt-2 text-center text-sm text-slate-500">
          Enter your authenticator code to continue
        </p>

        {error ? (
          <div className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {useBackupCode ? (
            <Input
              label="Backup code"
              name="backupCode"
              value={backupCode}
              onChange={(event) => setBackupCode(event.target.value)}
              placeholder="Enter backup code"
            />
          ) : (
            <Input
              label="Authenticator code"
              name="token"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              placeholder="Enter 6-digit code"
            />
          )}

          <Button type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Verify"}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => {
            setUseBackupCode((prev) => !prev);
            setError("");
          }}
          className="mt-4 w-full text-center text-sm font-medium text-slate-700"
        >
          {useBackupCode ? "Use authenticator code" : "Use backup code"}
        </button>
      </section>
    </main>
  );
};

export default VerifyTwoFactorPage;
