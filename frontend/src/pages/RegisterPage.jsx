import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { clearAuthError, registerUser } from "../features/auth/authSlice";

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

  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    email: "",
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
    }

    if (!formData.fullName.trim()) {
      errors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    }

    if (!formData.password.trim()) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
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
      username: formData.username,
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
      dateOfBirth: formData.dateOfBirth,
    };

    if (formData.phoneNumber.trim()) {
      payload.phoneNumber = formData.phoneNumber.trim();
    }

    const result = await dispatch(registerUser(payload));

    if (registerUser.fulfilled.match(result)) {
      setSuccessMessage("Account created successfully. Please login now.");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-center text-3xl font-bold">Create Account</h1>
        <p className="mt-2 text-center text-sm text-slate-500">
          Sign up to start using Instagram Clone
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

          <Input
            label="Phone number optional"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="Enter phone number"
            autoComplete="tel"
          />

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

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-slate-900">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
};

export default RegisterPage;
