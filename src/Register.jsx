import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { loginWithGoogle, sendOtp, verifyOtp } from "./api/authApi";
import { registerUser } from "./api/userApi";
import AuthLayout from "./components/AuthLayout";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [serverError, setServerError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "email") {
      setServerError("");
      setOtpError("");
      setOtpSent(false);
      setOtpVerified(false);
      setCountdown(0);
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSendOtp = async () => {
    if (!formData.email) return setOtpError("Please enter your email first.");
    try {
      setIsSending(true);
      await sendOtp(formData.email);
      setOtpSent(true);
      setCountdown(60);
      setOtpError("");
    } catch (err) {
      setOtpError(err.response?.data?.error || "Failed to send OTP.");
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return setOtpError("Please enter OTP.");
    try {
      setIsVerifying(true);
      await verifyOtp(formData.email, otp);
      setOtpVerified(true);
      setOtpError("");
    } catch (err) {
      setOtpError(err.response?.data?.error || "Invalid or expired OTP.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otpVerified) return setOtpError("Please verify your email with OTP.");
    try {
      await registerUser({ ...formData, otp });
      setIsSuccess(true);
      setTimeout(() => navigate("/drive"), 2000);
    } catch (err) {
      setServerError(err.response?.data?.error || "Something went wrong.");
    }
  };

  return (
    <AuthLayout
      eyebrow="Get started"
      title="Create your account"
      subtitle="Free to start. 10 GB included."
    >
      <form className="flex flex-col" onSubmit={handleSubmit}>
        <div className="relative mb-4">
          <label className="block mb-1.5 text-sm font-medium text-slate-700">Name</label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="Your full name"
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="relative mb-4">
          <label className="block mb-1.5 text-sm font-medium text-slate-700">Email</label>
          <div className="relative">
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className={`w-full px-3.5 py-2.5 pr-24 border rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors ${serverError ? "border-red-400" : "border-slate-300"
                }`}
            />
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={isSending || countdown > 0}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-2.5 py-1.5 text-xs font-medium rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {isSending
                ? "Sending..."
                : countdown > 0
                  ? `${countdown}s`
                  : "Send OTP"}
            </button>
          </div>
          {serverError && (
            <span className="block text-xs text-red-500 mt-1.5">
              {serverError}
            </span>
          )}
        </div>

        {otpSent && (
          <div className="relative mb-4">
            <label className="block mb-1.5 text-sm font-medium text-slate-700">Enter OTP</label>
            <div className="relative">
              <input
                type="text"
                maxLength={4}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="4-digit code"
                className="w-full px-3.5 py-2.5 pr-24 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
              />
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={isVerifying || otpVerified}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-2.5 py-1.5 text-xs font-medium rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {isVerifying
                  ? "Verifying..."
                  : otpVerified
                    ? "Verified"
                    : "Verify OTP"}
              </button>
            </div>
            {otpError && (
              <span className="block text-xs text-red-500 mt-1.5">
                {otpError}
              </span>
            )}
          </div>
        )}

        <div className="relative mb-5">
          <label className="block mb-1.5 text-sm font-medium text-slate-700">Password</label>
          <input
            type="password"
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a password"
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
          />
        </div>

        <button
          type="submit"
          className={`bg-blue-600 text-white py-2.5 rounded-lg w-full text-sm font-semibold hover:opacity-90 transition-opacity ${!otpVerified || isSuccess ? "opacity-50 cursor-not-allowed" : ""
            }`}
          disabled={!otpVerified || isSuccess}
        >
          {isSuccess ? "Registration successful" : "Create account"}
        </button>
      </form>

      <p className="text-center text-sm text-slate-600 mt-5">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-600 font-medium hover:underline">
          Log in
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
              console.error("Google sign-up failed:", err);
              setServerError(err.response?.data?.error || "Google sign-up failed.");
            }
          }}
          onError={() => console.log("Login Failed")}
          theme="filled_blue"
          text="continue_with"
          useOneTap
        />
      </div>
    </AuthLayout>
  );
};

export default Register;