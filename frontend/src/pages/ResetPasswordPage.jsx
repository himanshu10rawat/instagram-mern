import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import api from "../lib/axios";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { token } = useParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccessMessage("");

    if (!token) {
      setError("Reset token is missing");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post(`/auth/reset-password/${token}`, {
        password,
      });

      setSuccessMessage(
        response.data?.message || "Password reset successfully",
      );

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-center text-3xl font-bold text-slate-900">
          Create New Password
        </h1>
        <p className="mt-2 text-center text-sm text-slate-500">
          Choose a new password for your account
        </p>

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

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input
            label="New password"
            name="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter new password"
            autoComplete="new-password"
          />

          <Input
            label="Confirm password"
            name="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Confirm new password"
            autoComplete="new-password"
          />

          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Password"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Back to{" "}
          <Link to="/login" className="font-semibold text-slate-900">
            login
          </Link>
        </p>
      </section>
    </main>
  );
};

export default ResetPasswordPage;
