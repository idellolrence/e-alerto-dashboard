import React, { useContext, useEffect, useRef } from "react";
import { assets } from "../assets/assets";
import axios from "axios";
import { AppContent } from "../context/AppContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const EmailVerify = () => {
  axios.defaults.withCredentials = true;

  const { backendUrl, isLoggedIn, userData, getUserData } =
    useContext(AppContent);
  const navigate = useNavigate();

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
    const paste = e.clipboardData.getData("text");
    const pasteArray = paste.split("");
    pasteArray.forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }
    });
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const otpArray = inputRefs.current.map((el) => el.value);
      const otp = otpArray.join("");

      const { data } = await axios.post(
        `${backendUrl}/api/auth/verify-account`,
        { otp }
      );

      if (data.success) {
        toast.success(data.message);
        getUserData();
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (isLoggedIn && userData?.isAccountVerified) {
      navigate("/");
    }
  }, [isLoggedIn, userData]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white font-sans">
      {/* LEFT PANEL */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gradient-to-br from-slate-800 via-indigo-900 to-slate-800 text-white px-10 py-16">
        <div className="max-w-md text-center md:text-left">
          <img
            src={assets.logo_white}
            alt="E-Alerto Logo"
            className="w-44 mb-8 mx-auto md:mx-0 cursor-pointer transition-transform duration-300 hover:scale-105"
            onClick={() => navigate("/")}
          />
          <h1 className="text-5xl font-bold mb-4 leading-tight tracking-tight drop-shadow-md">
            Verify Your Email
          </h1>
          <p className="text-indigo-100 text-s leading-relaxed">
            A 6-digit code has been sent to your email. Enter the code to verify
            your account and unlock access.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-100 px-6 py-12">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-xl shadow-2xl rounded-2xl px-8 py-10 border border-gray-200 relative">
          {/* Top-left Back Button inside card */}
          <div className="absolute top-5 left-6">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center text-gray-600 hover:text-indigo-900 text-sm font-medium transition"
            >
              <ArrowBackIcon fontSize="large" className="mr-1" />
            </button>
          </div>

          {/* OTP Title & Form */}
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6 mt-4">
            Enter OTP
          </h2>
          <p className="text-center text-gray-500 text-sm mb-6">
            Input the 6-digit code sent to your registered email.
          </p>

          <form onSubmit={onSubmitHandler}>
            <div
              className="flex justify-between gap-2 mb-6"
              onPaste={handlePaste}
            >
              {Array(6)
                .fill(0)
                .map((_, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    required
                    className="w-12 h-12 text-center text-xl border border-gray-300 rounded-lg bg-gray-100 focus:ring-2 focus:ring-indigo-800"
                    ref={(el) => (inputRefs.current[index] = el)}
                    onInput={(e) => handleInput(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                  />
                ))}
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-indigo-900 hover:bg-[#df1d1c] text-white font-semibold rounded-lg shadow-md transition-colors"
            >
              Verify Email
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmailVerify;
