import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { API_URL } from "../../utils/constants";
import { Users, ShoppingBag, Receipt, IndianRupee, ArrowRight, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import Loader from "../../components/Loader";

const Dashboard = () => {
  const { token } = useSelector((state) => state.auth);
  
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(`${API_URL}/admin/dashboard`, config);
        if (response.data.success) {
          setStats(response.data.stats);
          setRecentOrders(response.data.recentOrders);
        }
      } catch (err) {
        console.error("Failed to load dashboard statistics", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchStats();
    }
  }, [token]);

  if (loading) {
    return <Loader />;
  }

  const statCards = [
    {
      title: "Total Revenue",
      value: `₹${stats?.totalRevenue?.toLocaleString("en-IN") || "0"}`,
      icon: IndianRupee,
      color: "text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-500/10 dark:border-green-500/20",
    },
    {
      title: "Orders Placed",
      value: stats?.totalOrders || "0",
      icon: Receipt,
      color: "text-cyan-600 bg-cyan-50 border-cyan-200 dark:text-cyan-400 dark:bg-cyan-500/10 dark:border-cyan-500/20",
    },
    {
      title: "Products Inventory",
      value: stats?.totalProducts || "0",
      icon: ShoppingBag,
      color: "text-sky-600 bg-sky-50 border-sky-200 dark:text-sky-400 dark:bg-sky-500/10 dark:border-sky-500/20",
    },
    {
      title: "Registered Users",
      value: stats?.totalUsers || "0",
      icon: Users,
      color: "text-cyan-700 bg-cyan-50 border-cyan-200 dark:text-cyan-400 dark:bg-cyan-500/10 dark:border-cyan-500/20",
    },
  ];

  return (
    <>
      <div className="space-y-8">
        
        {/* Title */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-wider text-gray-900 dark:text-white uppercase">
            Admin Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Store overview statistics.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div key={idx} className="glass-card p-6 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-widest font-bold">{card.title}</span>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100 mt-2">{card.value}</h3>
                </div>
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${card.color}`}>
                  <Icon size={22} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Dashboard bottom half */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Recent Orders table */}
          <div className="lg:col-span-2 glass-card p-6 rounded-2xl space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 uppercase tracking-widest">Recent Orders</h3>
              <Link to="/admin/orders" className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 flex items-center gap-1">
                View All <ArrowRight size={12} />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">
                    <th className="py-3 pr-4">Order ID</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150 dark:divide-gray-800/50 text-xs text-gray-700 dark:text-gray-300">
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-gray-400 dark:text-gray-500">No orders placed yet.</td>
                    </tr>
                  ) : (
                    recentOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/20">
                        <td className="py-3 pr-4 font-mono font-semibold text-gray-500 dark:text-gray-400 select-all">{order._id}</td>
                        <td className="py-3 px-4 font-medium">{order.user?.name || "Customer"}</td>
                        <td className="py-3 px-4 text-right font-semibold text-cyan-600 dark:text-cyan-400">₹{order.totalAmount.toLocaleString("en-IN")}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${
                            order.orderStatus === "Delivered"
                              ? "text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-500/10 dark:border-green-500/20"
                              : order.orderStatus === "Cancelled"
                              ? "text-red-650 bg-red-50 border-red-200 dark:text-pink-400 dark:bg-pink-500/10 dark:border-pink-500/20"
                              : "text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-500/10 dark:border-yellow-500/20"
                          }`}>
                            {order.orderStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 uppercase tracking-widest mb-2">Controls</h3>
            
            <div className="space-y-3">
              <Link
                to="/admin/products"
                className="block text-center bg-ocean-primary hover:bg-ocean-secondary text-white font-semibold py-3 px-4 rounded-xl transition duration-150 shadow-lg shadow-cyan-500/10"
              >
                Manage Catalog
              </Link>
              <Link
                to="/admin/orders"
                className="block text-center bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-700 transition duration-150"
              >
                Update Shipping Orders
              </Link>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-150 dark:border-gray-800 p-4 rounded-xl flex gap-3 mt-6">
              <TrendingUp size={20} className="text-cyan-600 dark:text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-gray-700 dark:text-gray-300">Live Statistics</h5>
                <p className="text-[10px] text-gray-500 leading-relaxed mt-1">
                  Revenue updates automatically upon successful Razorpay signatures. Stock levels automatically reduce on purchase checkout.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </>
  );
};

export default Dashboard;
