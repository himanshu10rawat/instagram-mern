import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import api from "../lib/axios";

const VerifyEmailPage = () => {
  const { token } = useParams();
  const hasVerified = useRef(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!token || hasVerified.current) return;

    hasVerified.current = true;

    const verifyEmail = async () => {
      try {
        const response = await api.get(`/auth/verify-email/${token}`);

        setSuccessMessage(
          response.data?.message || "Email verified successfully",
        );
      } catch (err) {
        setError(err.response?.data?.message || "Email verification failed");
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8 dark:bg-slate-950">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Email Verification
        </h1>

        {loading ? (
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Verifying your email...
          </p>
        ) : null}

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

        <Link
          to="/login"
          className="mt-6 inline-block text-sm font-semibold text-slate-900 dark:text-white"
        >
          Go to login
        </Link>
      </section>
    </main>
  );
};

export default VerifyEmailPage;
