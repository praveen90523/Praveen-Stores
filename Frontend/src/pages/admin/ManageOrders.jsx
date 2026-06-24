import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllOrdersAdmin, updateOrderStatusAdmin, clearOrderErrors } from "../../redux/slices/orderSlice";
import { Receipt, Calendar, User, Eye, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";

const ManageOrders = () => {
  const dispatch = useDispatch();
  const { orders, loading, error, success } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchAllOrdersAdmin());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearOrderErrors());
    }
    if (success) {
      toast.success("Order status updated successfully!");
      dispatch(clearOrderErrors());
      dispatch(fetchAllOrdersAdmin());
    }
  }, [error, success, dispatch]);

  const handleStatusChange = (id, status) => {
    dispatch(updateOrderStatusAdmin({ id, status }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-500/10 dark:border-yellow-500/20";
      case "Processing":
        return "text-cyan-600 bg-cyan-50 border-cyan-200 dark:text-cyan-400 dark:bg-cyan-500/10 dark:border-cyan-500/20";
      case "Shipped":
        return "text-sky-600 bg-sky-50 border-sky-200 dark:text-sky-400 dark:bg-sky-500/10 dark:border-sky-500/20";
      case "Delivered":
        return "text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-500/10 dark:border-green-500/20";
      case "Cancelled":
        return "text-red-655 bg-red-50 border-red-200 dark:text-pink-400 dark:bg-pink-500/10 dark:border-pink-500/20";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200 dark:text-slate-400 dark:bg-slate-500/10 dark:border-slate-500/20";
    }
  };

  return (
    <>
      {loading && <Loader />}
      <div className="space-y-6">
        
        {/* Title */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-wider text-gray-900 dark:text-white uppercase">
            Manage Orders
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Update shipment stages and review sales receipts.
          </p>
        </div>

        {/* Table of orders */}
        <div className="glass-card rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold text-gray-450 dark:text-gray-500 tracking-wider">
                  <th className="py-4 px-4">Order ID</th>
                  <th className="py-4 px-4">Customer</th>
                  <th className="py-4 px-4">Date</th>
                  <th className="py-4 px-4 text-right">Paid Total</th>
                  <th className="py-4 px-4 text-center">Status</th>
                  <th className="py-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 dark:divide-slate-800/50 text-xs text-gray-700 dark:text-gray-300">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-400 dark:text-slate-500 flex flex-col items-center justify-center gap-2">
                      <Receipt size={32} />
                      <span>No client orders found in DB.</span>
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20">
                      <td className="py-4 px-4 font-mono font-semibold text-slate-500 dark:text-slate-400 select-all">{order._id}</td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-semibold text-slate-850 dark:text-slate-200">{order.user?.name || "Customer"}</p>
                          <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-0.5">{order.user?.email || "N/A"}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-medium text-slate-500 dark:text-slate-400">
                        {new Date(order.createdAt).toLocaleDateString("en-IN")}
                      </td>
                      <td className="py-4 px-4 text-right font-bold text-cyan-600 dark:text-cyan-400">
                        ₹{order.totalAmount.toLocaleString("en-IN")}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <select
                          value={order.orderStatus}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          disabled={order.orderStatus === "Delivered" || order.orderStatus === "Cancelled"}
                          className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700 focus:outline-none focus:border-cyan-500 transition cursor-pointer ${getStatusColor(order.orderStatus)}`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled" disabled>Cancelled</option>
                        </select>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <Link
                            to={`/orders/${order._id}`}
                            className="p-2 text-gray-450 hover:text-gray-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                          >
                            <Eye size={14} />
                          </Link>
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

export default ManageOrders;
