import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { clearAuthError, loginUser } from "../features/auth/authSlice";

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, isAuthenticated, requiresTwoFactor } = useSelector(
    (state) => state.auth,
  );

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const [formErrors, setFormErrors] = useState({});

  if (isAuthenticated) {
    return <Navigate to={"/"} replace />;
  }

  if (requiresTwoFactor) {
    return <Navigate to={"/verify-2fa"} replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    setFormErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    if (error) {
      dispatch(clearAuthError());
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.identifier.trim()) {
      errors.identifier = "Email, username or phone number is required";
    }

    if (!formData.password.trim()) {
      errors.password = "Password is required";
    }

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    const result = await dispatch(loginUser(formData));

    if (loginUser.fulfilled.match(result)) {
      if (result.payload?.requiresTwoFactor) {
        navigate("/verify-2fa");
        return;
      }

      navigate("/");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-center text-3xl font-bold">Instagram Clone</h1>
        <p className="mt-2 text-center text-sm text-slate-500">
          Login to continue your social experience
        </p>

        {error ? (
          <div className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input
            label={"Email, username or phone"}
            name={"identifier"}
            value={formData.identifier}
            onChange={handleChange}
            placeholder={"Enter email, username or phone"}
            error={formErrors.identifier}
            autoComplete={"username"}
          />

          <Input
            label={"Password"}
            name={"password"}
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder={"Enter password"}
            error={formErrors.password}
            autoComplete={"current-password"}
          />

          <Button type="submit" disabled={loading}>
            {loading ? "Logging in" : "Login"}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-slate-700"
          >
            Forgot password?
          </Link>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="font-semibold text-slate-900">
            Sign up
          </Link>
        </p>
      </section>
    </main>
  );
};

export default LoginPage;
