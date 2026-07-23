import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { loginWithGoogle } from "./api/authApi";
import { loginUser } from "./api/userApi";
import AuthLayout from "./components/AuthLayout";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (serverError) setServerError("");
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = await loginUser(formData);
      if (data.error) setServerError(data.error);
      else navigate("/drive");
    } catch (err) {
      console.error("Login error:", err);
      setServerError(err.response?.data?.error || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasError = Boolean(serverError);

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Log in to Cirro"
      subtitle="Pick up right where you left off."
    >
      <form className="flex flex-col" onSubmit={handleSubmit}>
        <div className="relative mb-4">
          <label htmlFor="email" className="block mb-1.5 text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-3.5 py-2.5 border rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors ${
              hasError ? "border-red-400" : "border-slate-300"
            }`}
          />
        </div>

        <div className="relative mb-5">
          <label htmlFor="password" className="block mb-1.5 text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full px-3.5 py-2.5 border rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors ${
              hasError ? "border-red-400" : "border-slate-300"
            }`}
          />
          {serverError && (
            <span className="block text-red-500 text-xs mt-1.5">
              {serverError}
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 text-white py-2.5 rounded-lg w-full text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p className="text-center text-sm text-slate-600 mt-5">
        Don't have an account?{" "}
        <Link className="text-blue-600 font-medium hover:underline" to="/register">
          Register
        </Link>
      </p>

      <div className="relative text-center my-5">
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-slate-200" />
        <span className="relative bg-white px-3 text-xs text-slate-400 uppercase tracking-wide">
          Or
        </span>
      </div>

      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={async (credentialResponse) => {
            try {
              const data = await loginWithGoogle(credentialResponse.credential);
              if (!data.error) navigate("/drive");
            } catch (err) {
              console.error("Google login failed:", err);
            }
          }}
          onError={() => console.log("Login Failed")}
          theme="filled_blue"
          text="continue_with"
        />
      </div>
    </AuthLayout>
  );
};

export default Login;
