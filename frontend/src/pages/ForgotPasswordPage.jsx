import { useState } from "react";
import { Link } from "react-router-dom";

import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import api from "../lib/axios";

const ForgotPasswordPage = () => {
  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccessMessage("");

    if (!identifier.trim()) {
      setError("Email, username or phone number is required");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/forgot-password", {
        identifier: identifier.trim(),
      });

      setSuccessMessage(
        response.data?.message || "Password reset link sent successfully",
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-center text-3xl font-bold text-slate-900">
          Reset Password
        </h1>
        <p className="mt-2 text-center text-sm text-slate-500">
          Enter your account identifier to get a reset link
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
            label="Email, username or phone"
            name="identifier"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            placeholder="Enter email, username or phone"
            autoComplete="username"
          />

          <Button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Remember your password?{" "}
          <Link to="/login" className="font-semibold text-slate-900">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
};

export default ForgotPasswordPage;
