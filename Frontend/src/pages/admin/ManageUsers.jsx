import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { API_URL } from "../../utils/constants";
import { Users, Trash2, Shield, UserX, UserCheck } from "lucide-react";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";

const ManageUsers = () => {
  const { token, user: currentUser } = useSelector((state) => state.auth);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${token}` },
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/users/admin`, getHeaders());
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load users list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  const handleBlockToggle = async (userId, isBlocked) => {
    if (userId === currentUser?._id) {
      toast.error("Security alert: You cannot block your own admin account.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.put(
        `${API_URL}/users/admin/block/${userId}`,
        {},
        getHeaders()
      );
      if (res.data.success) {
        toast.success(res.data.message);
        fetchUsers();
      }
    } catch (err) {
      setLoading(false);
      toast.error(err.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (userId) => {
    if (userId === currentUser?._id) {
      toast.error("Security alert: You cannot delete your own admin account.");
      return;
    }

    if (!window.confirm("Are you sure you want to permanently delete this user account?")) {
      return;
    }

    try {
      setLoading(true);
      const res = await axios.delete(
        `${API_URL}/users/admin/${userId}`,
        getHeaders()
      );
      if (res.data.success) {
        toast.success(res.data.message);
        fetchUsers();
      }
    } catch (err) {
      setLoading(false);
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <>
      {loading && <Loader />}
      <div className="space-y-6">
        
        {/* Title */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-wider text-gray-900 dark:text-white uppercase">
            Manage Users
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Customer and administrative accounts registry.
          </p>
        </div>

        {/* Users Table */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 dark:divide-gray-800/50 text-xs text-gray-700 dark:text-gray-300">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-gray-400 dark:text-gray-500 flex flex-col items-center justify-center gap-1">
                      <Users size={28} />
                      <span>No users found.</span>
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/20">
                      
                      {/* Name / Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatar || "https://i.pinimg.com/1200x/15/1f/a3/151fa3a0f125064f90044b85b5c4c038.jpg"}
                            alt={u.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-100 dark:border-slate-800"
                          />
                          <span className="font-semibold text-gray-800 dark:text-gray-200">{u.name}</span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4 font-medium text-slate-600 dark:text-slate-400">{u.email}</td>

                      {/* Role */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          u.role === "admin"
                            ? "text-cyan-600 bg-cyan-50 border border-cyan-100 dark:text-cyan-400 dark:bg-cyan-500/10 dark:border-cyan-500/20"
                            : "text-slate-600 bg-slate-105 border border-slate-200 dark:text-slate-400 dark:bg-slate-700/50 dark:border-slate-600"
                        }`}>
                          {u.role}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.isBlocked
                            ? "text-red-600 bg-red-50 border border-red-205 dark:text-pink-400 dark:bg-pink-500/10 dark:border-pink-500/20"
                            : "text-green-600 bg-green-50 border border-green-200 dark:text-green-400 dark:bg-green-500/10 dark:border-green-500/20"
                        }`}>
                          {u.isBlocked ? "Blocked" : "Active"}
                        </span>
                      </td>

                      {/* Joined Date */}
                      <td className="py-3.5 px-4 text-gray-500 dark:text-gray-400">
                        {new Date(u.createdAt).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleBlockToggle(u._id, u.isBlocked)}
                            title={u.isBlocked ? "Unblock User" : "Block User"}
                            className={`p-2 rounded-lg border transition ${
                              u.isBlocked
                                ? "text-green-650 bg-green-50 border-green-200 hover:bg-green-100 dark:text-green-400 dark:bg-green-500/10 dark:border-green-500/20 dark:hover:bg-green-500/20"
                                : "text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20 dark:hover:bg-amber-500/20"
                            }`}
                          >
                            {u.isBlocked ? <UserCheck size={14} /> : <UserX size={14} />}
                          </button>
                          <button
                            onClick={() => handleDelete(u._id)}
                            title="Delete Account"
                            className="p-2 text-slate-400 hover:text-red-600 border border-transparent hover:border-red-100 hover:bg-red-50 dark:hover:bg-pink-500/10 dark:hover:border-pink-500/20 dark:hover:text-pink-400 rounded-lg transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </>
  );
};

export default ManageUsers;
