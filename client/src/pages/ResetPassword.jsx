import React, { useContext, useState, useRef } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const ResetPassword = () => {
  const { backendUrl, isLoggedIn } = useContext(AppContent);
  axios.defaults.withCredentials = true;
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otp, setOtp] = useState(0);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isOtpSubmitted, setIsOtpSubmitted] = useState(false);

  const inputRefs = useRef([]);

  const handleInput = (e, index) => {
    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && e.target.value === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text").split("");
    paste.forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }
    });
  };

  const onSubmitEmail = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/auth/send-reset-otp`,
        { email }
      );
      if (data.success) {
        toast.success(data.message);
        setIsEmailSent(true);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const onSubmitOTP = async (e) => {
    e.preventDefault();
    const otpArray = inputRefs.current.map((el) => el.value);
    setOtp(otpArray.join(""));
    setIsOtpSubmitted(true);
  };

  const onSubmitNewPassword = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/auth/reset-password`,
        {
          email,
          otp,
          newPassword,
        }
      );
      if (data.success) {
        toast.success(data.message);
        navigate("/login");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white font-sans">
      {/* LEFT COLUMN */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gradient-to-br from-slate-800 via-indigo-900 to-slate-800 text-white px-10 py-16">
        <div className="max-w-md text-center md:text-left">
          <img
            src={assets.logo_white}
            alt="E-Alerto Logo"
            className="w-44 mb-8 mx-auto md:mx-0 cursor-pointer transition-transform duration-300 hover:scale-105"
            onClick={() => navigate("/")}
          />
          <h1 className="text-5xl font-bold mb-4 leading-tight tracking-tight drop-shadow-md">
            Reset Password
          </h1>
          <p className="text-indigo-100 text-s leading-relaxed">
            No worries! Enter your email and follow the steps to securely reset
            your password.
          </p>
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-100 px-6 py-12">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-xl shadow-2xl rounded-2xl px-8 py-10 border border-gray-200 relative pt-14">
          {/* MUI Return Button */}
          <button
            onClick={() => navigate(isLoggedIn ? "/dashboard" : "/login")}
            className="absolute top-5 left-6 flex items-center text-gray-600 hover:text-indigo-900 text-sm font-medium transition"
          >
            <ArrowBackIcon fontSize="large" className="mr-1" />
          </button>

          {/* STEP 1: EMAIL */}
          {!isEmailSent && (
            <form onSubmit={onSubmitEmail} className="space-y-6">
              <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
                Enter Your Email
              </h2>
              <p className="text-center text-gray-500 text-sm">
                We’ll send you a one-time code to reset your password.
              </p>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-800 transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                className="w-full py-2 bg-indigo-900 hover:bg-[#df1d1c] text-white font-semibold rounded-lg shadow-md transition-colors"
              >
                Send OTP
              </button>
            </form>
          )}

          {/* STEP 2: OTP */}
          {isEmailSent && !isOtpSubmitted && (
            <form onSubmit={onSubmitOTP} className="space-y-6">
              <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
                Enter OTP
              </h2>
              <p className="text-center text-gray-500 text-sm">
                Check your email and input the 6-digit code below.
              </p>
              <div className="flex justify-between gap-2" onPaste={handlePaste}>
                {Array(6)
                  .fill(0)
                  .map((_, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength="1"
                      ref={(el) => (inputRefs.current[index] = el)}
                      onInput={(e) => handleInput(e, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      className="w-10 h-12 text-center text-xl border border-gray-300 rounded-lg bg-gray-100 focus:ring-2 focus:ring-indigo-800"
                      required
                    />
                  ))}
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-indigo-900 hover:bg-[#df1d1c] text-white font-semibold rounded-lg shadow-md transition-colors"
              >
                Submit OTP
              </button>
            </form>
          )}

          {/* STEP 3: NEW PASSWORD */}
          {isEmailSent && isOtpSubmitted && (
            <form onSubmit={onSubmitNewPassword} className="space-y-6">
              <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
                Create New Password
              </h2>
              <p className="text-center text-gray-500 text-sm">
                Choose a strong and secure password.
              </p>
              <input
                type="password"
                placeholder="New password"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-800 transition"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button
                type="submit"
                className="w-full py-2 bg-indigo-900 hover:bg-[#df1d1c] text-white font-semibold rounded-lg shadow-md transition-colors"
              >
                Update Password
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
