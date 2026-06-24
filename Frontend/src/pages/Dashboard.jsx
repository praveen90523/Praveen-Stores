import React from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="p-10">
      <h1 className="text-4xl font-bold">
        Dashboard
      </h1>

      <button
        onClick={logout}
        className="bg-red-600 text-white px-5 py-2 rounded mt-5"
      >
        Logout
      </button>
    </div>
  );
};

export default Dashboard;