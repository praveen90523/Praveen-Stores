import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateProfile, updatePassword, clearAuthErrors } from "../redux/slices/authSlice";
import { User, Phone, Lock, Edit2, Shield, Camera } from "lucide-react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const Profile = () => {
  const dispatch = useDispatch();
  const { user, loading, error, success, message } = useSelector((state) => state.auth);

  const [profileData, setProfileData] = useState({ name: "", phone: "", avatar: "" });
  const [passwordData, setPasswordData] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    if (user) {
      setProfileData({ name: user.name || "", phone: user.phone || "", avatar: user.avatar || "" });
    }
  }, [user]);

  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearAuthErrors()); }
    if (success && message) {
      toast.success(message);
      dispatch(clearAuthErrors());
      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    }
  }, [error, success, message, dispatch]);

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    if (!profileData.name) { toast.error("Name is required"); return; }
    dispatch(updateProfile(profileData));
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!passwordData.oldPassword || !passwordData.newPassword) { toast.error("Please fill all password fields"); return; }
    if (passwordData.newPassword !== passwordData.confirmPassword) { toast.error("New passwords do not match"); return; }
    dispatch(updatePassword({ oldPassword: passwordData.oldPassword, newPassword: passwordData.newPassword }));
  };

  return (
    <>
      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Account
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your profile and security settings
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* Left - Profile card */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full lg:w-72 flex-shrink-0"
          >
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col items-center text-center">
              {/* Avatar */}
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-cyan-200 dark:border-cyan-700 bg-slate-100 dark:bg-slate-700 flex items-center justify-center shadow-md">
                  {profileData.avatar ? (
                    <img src={profileData.avatar} alt="profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-cyan-600 flex items-center justify-center border-2 border-white dark:border-slate-800">
                  <Camera size={12} className="text-white" />
                </div>
              </div>

              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{user?.name}</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{user?.email}</p>
              <span className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${user?.role === "admin"
                ? "bg-cyan-50 dark:bg-cyan-950/20 border-cyan-200 dark:border-cyan-700 text-cyan-600 dark:text-cyan-400"
                : "bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300"
                }`}>
                {user?.role || "user"}
              </span>

              {/* Quick stats */}
              <div className="mt-6 w-full border-t border-slate-100 dark:border-slate-700 pt-5 grid grid-cols-2 gap-3">
                <div className="text-center">
                  <p className="text-lg font-bold text-cyan-600 dark:text-cyan-400">0</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Orders</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-cyan-600 dark:text-cyan-400">0</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Reviews</p>
                </div>
              </div>

              {/* Tab nav */}
              <div className="mt-6 w-full space-y-1">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-2.5 ${activeTab === "profile"
                    ? "bg-cyan-50 dark:bg-cyan-950/20 text-cyan-600 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-900"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                    }`}
                >
                  <Edit2 size={14} />
                  Edit Profile
                </button>
                <button
                  onClick={() => setActiveTab("password")}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-2.5 ${activeTab === "password"
                    ? "bg-cyan-50 dark:bg-cyan-955/20 text-cyan-600 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-900"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                    }`}
                >
                  <Shield size={14} />
                  Security
                </button>
              </div>
            </div>
          </motion.div>

          {/* Right - Forms */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="flex-1"
          >
            {/* Edit Profile Tab */}
            {activeTab === "profile" && (
              <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-950/20 flex items-center justify-center">
                    <Edit2 size={14} className="text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">Update Information</h3>
                    <p className="text-[10px] text-gray-400">Keep your profile up to date</p>
                  </div>
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-5">
                  {/* Full Name */}
                  <div>
                    <label className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">
                      Full Name
                    </label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Enter full name"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="w-full glass-input py-3 pl-10 pr-4 rounded-xl text-sm"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="e.g. +91 99999 88888"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        className="w-full glass-input py-3 pl-10 pr-4 rounded-xl text-sm"
                      />
                    </div>
                  </div>

                  {/* Avatar URL */}
                  <div>
                    <label className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">
                      Profile Picture
                    </label>

                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-sky-500 transition-all duration-300 bg-white/50 dark:bg-slate-900/30">

                      {profileData.avatar ? (
                        <div className="flex flex-col items-center gap-3">
                          <img
                            src={profileData.avatar}
                            alt="Profile Preview"
                            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                          />

                          <div className="flex gap-2">
                            <label className="cursor-pointer bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition">
                              Change Photo
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files[0];

                                  if (file) {
                                    const preview = URL.createObjectURL(file);

                                    setProfileData({
                                      ...profileData,
                                      avatar: preview,
                                      avatarFile: file,
                                    });
                                  }
                                }}
                              />
                            </label>

                            <button
                              type="button"
                              onClick={() =>
                                setProfileData({
                                  ...profileData,
                                  avatar: "",
                                  avatarFile: null,
                                })
                              }
                              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="cursor-pointer flex flex-col items-center gap-3">
                          <div className="w-20 h-20 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-10 h-10 text-sky-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 15a4 4 0 014-4h.586A2 2 0 009 10.586l.707-.707A2 2 0 0111.121 9H13a4 4 0 014 4m-4 4h4m0 0v-4m0 4l-4-4"
                              />
                            </svg>
                          </div>

                          <div>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                              Upload Profile Image
                            </p>
                            <p className="text-xs text-slate-500">
                              PNG, JPG, JPEG up to 5MB
                            </p>
                          </div>

                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files[0];

                              if (file) {
                                const preview = URL.createObjectURL(file);

                                setProfileData({
                                  ...profileData,
                                  avatar: preview,
                                  avatarFile: file,
                                });
                              }
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-600 hover:to-sky-700 disabled:opacity-60 text-white font-semibold px-8 py-3 rounded-xl transition duration-200 flex items-center gap-2 shadow-sm"
                  >
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : null}
                    Save Changes
                  </button>
                </form>
              </div>
            )}

            {/* Security / Password Tab */}
            {activeTab === "password" && (
              <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-950/20 flex items-center justify-center">
                    <Shield size={14} className="text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">Change Password</h3>
                    <p className="text-[10px] text-gray-400">Keep your account secure</p>
                  </div>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-5">
                  {[
                    { label: "Current Password", key: "oldPassword", placeholder: "Enter current password" },
                    { label: "New Password", key: "newPassword", placeholder: "Enter new password" },
                    { label: "Confirm New Password", key: "confirmPassword", placeholder: "Repeat new password" }
                  ].map(({ label, key, placeholder }) => (
                    <div key={key}>
                      <label className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">
                        {label}
                      </label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                        <input
                          type="password"
                          placeholder={placeholder}
                          value={passwordData[key]}
                          onChange={(e) => setPasswordData({ ...passwordData, [key]: e.target.value })}
                          className="w-full glass-input py-3 pl-10 pr-4 rounded-xl text-sm"
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-600 hover:to-sky-700 disabled:opacity-60 text-white font-semibold px-8 py-3 rounded-xl transition duration-200 flex items-center gap-2 shadow-sm"
                  >
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : null}
                    Update Password
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Profile;
