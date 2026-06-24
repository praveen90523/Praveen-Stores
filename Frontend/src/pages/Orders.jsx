import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchMyOrders, cancelUserOrder, clearOrderErrors } from "../redux/slices/orderSlice";
import { Receipt, Calendar, Eye, XOctagon } from "lucide-react";
import { toast } from "react-toastify";
import Loader from "../components/Loader";

const Orders = () => {
  const dispatch = useDispatch();
  const { orders, loading, error, success } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearOrderErrors());
    }
    if (success) {
      toast.success("Order status updated successfully!");
      dispatch(clearOrderErrors());
      dispatch(fetchMyOrders());
    }
  }, [error, success, dispatch]);

  const handleCancelOrder = (id) => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      dispatch(cancelUserOrder(id));
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":    return "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800";
      case "Processing": return "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800";
      case "Shipped":    return "bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800";
      case "Delivered":  return "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
      case "Cancelled":  return "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800";
      default:           return "bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600";
    }
  };

  return (
    <>
      {loading && <Loader />}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Orders</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track and manage your purchases.
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-16 text-center flex flex-col items-center border border-gray-100 dark:border-gray-700 shadow-sm">
            <Receipt size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">No orders found</h3>
            <p className="text-sm text-gray-400 mt-2 max-w-sm">
              You haven't placed any orders yet. Start shopping to fill this page.
            </p>
            <Link
              to="/products"
              className="mt-6 bg-ocean-primary hover:bg-ocean-secondary text-white font-semibold px-6 py-2.5 rounded-xl transition duration-200 shadow-sm"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-cyan-100 dark:hover:border-cyan-800 transition-all duration-200"
              >
                {/* Header */}
                <div className="flex flex-wrap justify-between items-center gap-4 border-b border-gray-50 dark:border-gray-700 pb-4 mb-4">
                  <div className="flex flex-wrap items-center gap-6">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold block mb-0.5">Order ID</span>
                      <span className="text-xs font-mono text-gray-600 dark:text-gray-400 font-semibold">{order._id.slice(-12)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold block mb-0.5">Date Placed</span>
                      <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1.5 font-medium">
                        <Calendar size={13} className="text-cyan-500" />
                        {new Date(order.createdAt).toLocaleDateString("en-IN")}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold block mb-0.5">Total Paid</span>
                      <span className="text-sm text-cyan-600 dark:text-cyan-400 font-bold">
                        ₹{order.totalAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${getStatusBadge(order.orderStatus)}`}>
                    {order.orderStatus}
                  </span>
                </div>

                {/* Items + Actions */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
                  <div className="flex flex-col gap-2 flex-grow">
                    {order.orderItems.slice(0, 2).map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 flex-shrink-0">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-100 dark:bg-gray-700" />
                          )}
                        </div>
                        <div className="text-xs">
                          <p className="font-medium text-gray-700 dark:text-gray-300">{item.name}</p>
                          <p className="text-gray-400">₹{item.price.toLocaleString("en-IN")} × {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                    {order.orderItems.length > 2 && (
                      <p className="text-xs text-gray-400">+{order.orderItems.length - 2} more items</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 w-full md:w-auto flex-shrink-0">
                    <Link
                      to={`/orders/${order._id}`}
                      className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 transition duration-150"
                    >
                      <Eye size={15} />
                      <span>Details</span>
                    </Link>

                    {order.orderStatus === "Pending" && (
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-medium px-4 py-2.5 rounded-xl border border-red-100 dark:border-red-800 transition duration-150"
                      >
                        <XOctagon size={15} />
                        <span>Cancel</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Orders;
