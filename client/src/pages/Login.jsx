import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import { assets } from "../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
  const navigate = useNavigate();
  const { backendUrl, setIsLoggedIn, getUserData } = useContext(AppContent);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    axios.defaults.withCredentials = true;

    try {
      const res = await axios.post(`${backendUrl}/api/auth/login`, {
        email,
        password,
      });

      const data = res.data;

      if (data.success) {
        setIsLoggedIn(true);
        getUserData();
        navigate("/dashboard");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

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
            Welcome Back
          </h1>
          <p className="text-indigo-100 text-s leading-relaxed">
            Sign in to your employee account and help improve public safety in
            Quezon City.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-100 px-6 py-12">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-xl shadow-2xl rounded-2xl px-8 py-10 border border-gray-200">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
            Employee Login
          </h2>

          <form onSubmit={onSubmitHandler} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-800 transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-800 transition"
                required
              />
            </div>

            <div className="text-right">
              <button
                type="button"
                className="text-sm text-indigo-900 hover:underline"
                onClick={() => navigate("/reset-password")}
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-indigo-900 hover:bg-[#df1d1c] text-white font-semibold rounded-lg shadow-md transition-colors"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
