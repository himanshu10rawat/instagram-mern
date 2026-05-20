import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { CircleCheck, TriangleAlert } from "lucide-react";

import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { clearAuthError, registerUser } from "../features/auth/authSlice";

const usernamePattern = /^[a-zA-Z0-9._]+$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getPhoneDigits = ({ countryCode, phoneNumber }) => {
  return `${countryCode.replace(/\D/g, "")}${phoneNumber.trim()}`;
};

const getApiFieldName = (error) => {
  if (typeof error !== "string") return error?.field;

  const lowerMessage = error.toLowerCase();

  if (lowerMessage.includes("username")) return "username";
  if (lowerMessage.includes("full name")) return "fullName";
  if (lowerMessage.includes("email")) return "email";
  if (lowerMessage.includes("phone")) return "phoneNumber";
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

const countryOptions = [
  { code: "+1", country: "USA/Canada" },
  { code: "+44", country: "UK" },
  { code: "+91", country: "India" },
  { code: "+86", country: "China" },
  { code: "+81", country: "Japan" },
  { code: "+33", country: "France" },
  { code: "+49", country: "Germany" },
  { code: "+39", country: "Italy" },
  { code: "+34", country: "Spain" },
  { code: "+61", country: "Australia" },
  { code: "+55", country: "Brazil" },
  { code: "+27", country: "South Africa" },
];

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, isAuthenticated } = useSelector(
    (state) => state.auth,
  );

  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    email: "",
    countryCode: "+91",
    phoneNumber: "",
    dateOfBirth: "",
    password: "",
  });

  const [formErrors, setFormErrors] = useState({});

  if (isAuthenticated) {
    return <Navigate to={"/"} replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setFormErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setSuccessMessage("");

    if (error) {
      dispatch(clearAuthError());
    }
  };

  const validateForm = () => {
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

    if (formData.phoneNumber.trim()) {
      const localPhoneNumber = formData.phoneNumber.trim();
      const fullPhoneNumber = getPhoneDigits(formData);

      if (!/^\d+$/.test(localPhoneNumber)) {
        errors.phoneNumber = "Use digits only; country code is already selected";
      } else if (fullPhoneNumber.length < 10 || fullPhoneNumber.length > 15) {
        errors.phoneNumber =
          "Phone number must be 10 to 15 digits including country code";
      }
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

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    const payload = {
      username: formData.username.trim(),
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      password: formData.password,
      dateOfBirth: formData.dateOfBirth,
    };

    if (formData.phoneNumber.trim()) {
      payload.phoneNumber = getPhoneDigits(formData);
    }

    const result = await dispatch(registerUser(payload));

    if (registerUser.fulfilled.match(result)) {
      setSuccessMessage("Account created successfully. Please login now.");

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
      <section className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:rounded-2xl sm:p-8">
        <h1 className="text-center text-2xl font-bold text-slate-950 dark:text-white sm:text-3xl">
          Create Account
        </h1>
        <p className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
          Sign up to start using Instagram Clone
        </p>

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
              <p className="font-semibold">Success!</p>
              <p className="mt-1 text-xs">{successMessage}</p>
            </div>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Phone number (optional)
            </label>
            <div className="flex gap-2">
              <select
                value={formData.countryCode}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    countryCode: e.target.value,
                  }));
                  setFormErrors((prev) => ({
                    ...prev,
                    phoneNumber: "",
                  }));
                  if (error) {
                    dispatch(clearAuthError());
                  }
                }}
                className="shrink-0 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                {countryOptions.map((opt) => (
                  <option key={opt.code} value={opt.code}>
                    {opt.code} {opt.country}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Phone number"
                autoComplete="tel"
                aria-invalid={Boolean(formErrors.phoneNumber)}
                className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm outline-none focus:border-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-white"
              />
            </div>
            {formErrors.phoneNumber ? (
              <p className="mt-1 text-xs text-red-500">
                {formErrors.phoneNumber}
              </p>
            ) : null}
          </div>

          <Input
            label="Date of birth"
            name="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={handleChange}
            error={formErrors.dateOfBirth}
          />

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

          <Button type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
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
