import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { CircleCheck, MailCheck, ShieldCheck, TriangleAlert } from "lucide-react";

import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import {
  clearAuthError,
  registerUser,
  requestSignupVerification,
} from "../features/auth/authSlice";

const usernamePattern = /^[a-zA-Z0-9._]+$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const otpPattern = /^[0-9]{6}$/;

const getApiFieldName = (error) => {
  if (typeof error !== "string") return error?.field;

  const lowerMessage = error.toLowerCase();

  if (lowerMessage.includes("username")) return "username";
  if (lowerMessage.includes("full name")) return "fullName";
  if (lowerMessage.includes("email code")) return "emailOtp";
  if (lowerMessage.includes("email")) return "email";
  if (lowerMessage.includes("password")) return "password";
  if (lowerMessage.includes("birth") || lowerMessage.includes("age")) {
    return "dateOfBirth";
  }

  return "";
};

const getApiErrorMessage = (error) =>
  typeof error === "string" ? error : error?.message || "";

const getApiFieldErrors = (errors = []) => {
  return errors.reduce((fieldErrors, error) => {
    const field = getApiFieldName(error);
    const message = getApiErrorMessage(error);

    if (field && message) {
      fieldErrors[field] = message;
    }

    return fieldErrors;
  }, {});
};

const getAge = (date) => {
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDifference = today.getMonth() - date.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < date.getDate())
  ) {
    age -= 1;
  }

  return age;
};

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, isAuthenticated } = useSelector(
    (state) => state.auth,
  );

  const [successMessage, setSuccessMessage] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);
  const [devCode, setDevCode] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    email: "",
    dateOfBirth: "",
    password: "",
    emailOtp: "",
  });

  const [formErrors, setFormErrors] = useState({});

  if (isAuthenticated) {
    return <Navigate to={"/"} replace />;
  }

  const clearVerificationState = () => {
    setVerificationSent(false);
    setDevCode("");
    setFormData((prev) => ({
      ...prev,
      emailOtp: "",
    }));
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    const nextValue =
      name === "emailOtp" ? value.replace(/\D/g, "").slice(0, 6) : value;

    setFormData((prev) => ({
      ...prev,
      [name]: nextValue,
    }));

    setFormErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setSuccessMessage("");

    if (name === "email" && verificationSent) {
      clearVerificationState();
    }

    if (error) {
      dispatch(clearAuthError());
    }
  };

  const validateForm = ({ requireOtp = false } = {}) => {
    const errors = {};

    if (!formData.username.trim()) {
      errors.username = "Username is required";
    } else if (formData.username.trim().length < 3) {
      errors.username = "Username must be at least 3 characters";
    } else if (formData.username.trim().length > 30) {
      errors.username = "Username cannot exceed 30 characters";
    } else if (!usernamePattern.test(formData.username.trim())) {
      errors.username =
        "Username can only contain letters, numbers, dots and underscores";
    }

    if (!formData.fullName.trim()) {
      errors.fullName = "Full name is required";
    } else if (formData.fullName.trim().length > 60) {
      errors.fullName = "Full name cannot exceed 60 characters";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!emailPattern.test(formData.email.trim())) {
      errors.email = "Enter a valid email address";
    }

    if (!formData.password.trim()) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    } else if (formData.password.length > 64) {
      errors.password = "Password cannot exceed 64 characters";
    }

    if (!formData.dateOfBirth) {
      errors.dateOfBirth = "Date of birth is required";
    } else {
      const dateOfBirth = new Date(formData.dateOfBirth);

      if (Number.isNaN(dateOfBirth.getTime())) {
        errors.dateOfBirth = "Enter a valid date of birth";
      } else if (getAge(dateOfBirth) < 13) {
        errors.dateOfBirth = "You must be at least 13 years old";
      }
    }

    if (requireOtp && !otpPattern.test(formData.emailOtp.trim())) {
      errors.emailOtp = "Enter the 6 digit email code";
    }

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const getSignupPayload = () => ({
    username: formData.username.trim(),
    fullName: formData.fullName.trim(),
    email: formData.email.trim(),
    password: formData.password,
    dateOfBirth: formData.dateOfBirth,
  });

  const handleSendVerification = async () => {
    if (!validateForm()) return;

    setDevCode("");

    const result = await dispatch(requestSignupVerification(getSignupPayload()));

    if (requestSignupVerification.fulfilled.match(result)) {
      setVerificationSent(true);
      setSuccessMessage("Verification code sent to your email.");
      setFormData((prev) => ({
        ...prev,
        emailOtp: "",
      }));

      if (result.payload?.emailOtp) {
        setDevCode(result.payload.emailOtp);
      }
    } else if (requestSignupVerification.rejected.match(result)) {
      setFormErrors((prev) => ({
        ...prev,
        ...getApiFieldErrors(result.payload?.errors),
      }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!verificationSent) {
      await handleSendVerification();
      return;
    }

    if (!validateForm({ requireOtp: true })) return;

    const result = await dispatch(
      registerUser({
        ...getSignupPayload(),
        emailOtp: formData.emailOtp.trim(),
      }),
    );

    if (registerUser.fulfilled.match(result)) {
      setSuccessMessage("Verified account created successfully. Please login.");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } else if (registerUser.rejected.match(result)) {
      setFormErrors((prev) => ({
        ...prev,
        ...getApiFieldErrors(result.payload?.errors),
      }));
    }
  };

  return (
    <main className="flex min-h-dvh items-center justify-center bg-slate-50 px-3 py-6 dark:bg-slate-950 sm:px-4 sm:py-8">
      <section className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:rounded-2xl sm:p-8">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-950">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-slate-950 dark:text-white sm:text-3xl">
            Create Verified Account
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Email verification is required before signup.
          </p>
        </div>

        {error ? (
          <div className="mt-6 flex items-start gap-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-300">
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Registration failed</p>
              <p className="mt-1 text-xs">{error}</p>
            </div>
          </div>
        ) : null}

        {successMessage ? (
          <div className="mt-6 flex items-start gap-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-300">
            <CircleCheck className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Success</p>
              <p className="mt-1 text-xs">{successMessage}</p>
            </div>
          </div>
        ) : null}

        {devCode ? (
          <div className="mt-4 rounded-xl bg-slate-100 px-4 py-3 text-xs text-slate-600 dark:bg-slate-900 dark:text-slate-300">
            Dev email code: {devCode}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose username"
              error={formErrors.username}
              autoComplete="username"
            />

            <Input
              label="Full name"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter full name"
              error={formErrors.fullName}
              autoComplete="name"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
              error={formErrors.email}
              autoComplete="email"
            />

            <Input
              label="Date of birth"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleChange}
              error={formErrors.dateOfBirth}
            />
          </div>

          <Input
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create password"
            error={formErrors.password}
            autoComplete="new-password"
          />

          {verificationSent ? (
            <div className="border-t border-slate-200 pt-5 dark:border-slate-800">
              <label className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                <MailCheck className="h-4 w-4" />
                Email code
              </label>
              <input
                name="emailOtp"
                value={formData.emailOtp}
                onChange={handleChange}
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                autoComplete="one-time-code"
                className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-center text-lg font-semibold text-slate-950 outline-none transition placeholder:text-slate-300 focus:border-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-600 dark:focus:border-white"
              />
              {formErrors.emailOtp ? (
                <p className="mt-1 text-xs text-red-500">
                  {formErrors.emailOtp}
                </p>
              ) : null}

              <button
                type="button"
                onClick={handleSendVerification}
                disabled={loading}
                className="mt-3 text-sm font-semibold text-slate-900 disabled:opacity-60 dark:text-white"
              >
                Resend code
              </button>
            </div>
          ) : null}

          <Button type="submit" disabled={loading}>
            {loading
              ? verificationSent
                ? "Creating account..."
                : "Sending code..."
              : verificationSent
                ? "Create Verified Account"
                : "Send Email Code"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-slate-900 dark:text-white"
          >
            Login
          </Link>
        </p>
      </section>
    </main>
  );
};

export default RegisterPage;
