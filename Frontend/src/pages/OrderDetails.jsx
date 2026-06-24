import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrderDetails } from "../redux/slices/orderSlice";
import { ArrowLeft, Clock, PackageCheck, Truck, CheckCircle2, XCircle } from "lucide-react";
import Loader from "../components/Loader";

const OrderDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { order, loading } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchOrderDetails(id));
  }, [id, dispatch]);

  if (loading || !order) {
    return <Loader />;
  }

  const getStatusStep = (status) => {
    const steps = ["Pending", "Processing", "Shipped", "Delivered"];
    return steps.indexOf(status);
  };

  const currentStep = getStatusStep(order.orderStatus);

  const getStepStatusClass = (stepIndex) => {
    if (order.orderStatus === "Cancelled") return "text-slate-600 bg-slate-900 border-slate-800";
    if (currentStep >= stepIndex) {
      return "text-cyan-400 bg-cyan-500/10 border-cyan-500/30";
    }
    return "text-slate-500 bg-slate-950 border-slate-900";
  };

  const stepsList = [
    { title: "Ordered", desc: "Order confirmation received", icon: Clock },
    { title: "Processing", desc: "Item being inspected & packed", icon: LoaderIcon },
    { title: "Shipped", desc: "Item out for shipping", icon: Truck },
    { title: "Delivered", desc: "Order completed", icon: PackageCheck },
  ];

  return (
    <>
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Back Link */}
        <Link to="/orders" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6">
          <ArrowLeft size={16} /> Back to My Purchases
        </Link>

        {/* Top Header Card */}
        <div className="glass-card p-6 rounded-2xl mb-8 flex flex-wrap justify-between items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-100">Order #{order._id}</h2>
            <p className="text-xs text-slate-500 mt-1">Placed on {new Date(order.createdAt).toLocaleString("en-IN")}</p>
          </div>
          <span className={`text-xs font-bold px-3.5 py-1.5 rounded-full border ${
            order.orderStatus === "Cancelled"
              ? "text-pink-400 bg-pink-500/10 border-pink-500/20"
              : order.orderStatus === "Delivered"
              ? "text-green-400 bg-green-500/10 border-green-500/20"
              : "text-cyan-400 bg-cyan-500/10 border-cyan-500/20"
          }`}>

            {order.orderStatus}
          </span>
        </div>

        {/* Order Tracking Progress Line */}
        <div className="glass-card p-8 rounded-2xl mb-8">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest mb-8">Delivery Track</h3>
          
          {order.orderStatus === "Cancelled" ? (
            <div className="flex gap-4 items-center bg-pink-950/10 border border-pink-900/20 p-5 rounded-2xl">
              <XCircle size={28} className="text-pink-500" />
              <div>
                <h4 className="text-sm font-semibold text-pink-400">Cancelled</h4>
                <p className="text-xs text-slate-500 mt-0.5">This transaction was cancelled.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
              {stepsList.map((step, idx) => {
                const StepIcon = step.icon;
                const active = currentStep >= idx;
                return (
                  <div key={idx} className="flex flex-row md:flex-col items-center md:text-center gap-4 relative">
                    {/* Circle icon marker */}
                    <div className={`w-12 h-12 rounded-full border flex items-center justify-center flex-shrink-0 z-10 ${getStepStatusClass(idx)}`}>
                      <StepIcon size={20} className={active ? "animate-pulse" : ""} />
                    </div>

                    {/* Step texts */}
                    <div>
                      <h4 className={`text-sm font-semibold ${active ? "text-slate-100" : "text-slate-500"}`}>{step.title}</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-normal max-w-[150px]">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Details Grid: Address, payment, and sums */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          
          {/* Shipping details */}
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h4 className="font-bold text-slate-200 border-b border-slate-800/60 pb-2.5">Shipping Details</h4>
            <div className="text-sm text-slate-400 space-y-2 leading-relaxed">
              <p className="text-slate-200 font-semibold">{order.user?.name}</p>
              <p>{order.shippingAddress?.address}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pinCode}</p>
              <p>{order.shippingAddress?.country}</p>
              <p className="text-xs mt-3 flex items-center gap-1.5"><span className="font-semibold text-slate-300">Phone:</span> {order.shippingAddress?.phoneNo}</p>
            </div>
          </div>

          {/* Payment Details */}
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h4 className="font-bold text-slate-200 border-b border-slate-800/60 pb-2.5">Payment Receipt</h4>
            <div className="text-sm text-slate-400 space-y-3">
              <div className="flex justify-between">
                <span>Method</span>
                <span className="text-slate-200 font-medium">
                  {order.paymentInfo?.id?.startsWith("COD_")
                    ? "Cash on Delivery"
                    : order.paymentInfo?.id?.startsWith("pay_upi_")
                    ? "UPI Payment"
                    : order.paymentInfo?.id?.startsWith("pay_sim_card_")
                    ? "Card Payment"
                    : "Razorpay Online"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Payment ID</span>
                <span className="text-slate-300 font-mono text-xs">{order.paymentInfo?.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Status</span>
                <span className={`font-bold px-2 py-0.5 rounded border text-xs ${
                  order.paymentInfo?.status === "Succeeded"
                    ? "text-green-400 bg-green-500/10 border-green-500/20"
                    : order.paymentInfo?.status === "Pending"
                    ? "text-amber-450 bg-amber-500/10 border-amber-500/20 animate-pulse text-amber-400"
                    : "text-red-400 bg-red-500/10 border-red-500/20"
                }`}>
                  {order.paymentInfo?.status === "Pending" ? "Awaiting COD Delivery" : order.paymentInfo?.status}
                </span>
              </div>
              {order.paymentInfo?.status === "Succeeded" && order.paidAt && (
                <div className="flex justify-between">
                  <span>Paid Date</span>
                  <span className="text-slate-200">{new Date(order.paidAt).toLocaleDateString("en-IN")}</span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Ordered items Table/List */}
        <div className="glass-card p-6 rounded-2xl space-y-4 mb-8">
          <h4 className="font-bold text-slate-200 border-b border-slate-800/60 pb-2.5">Ordered Items</h4>
          <div className="space-y-4">
            {order.orderItems?.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-950 border border-slate-800 flex-shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-900"></div>
                    )}
                  </div>
                  <div>
                    <h5 className="font-semibold text-slate-200 line-clamp-1">{item.name}</h5>
                    <span className="text-xs text-slate-500">₹{item.price.toLocaleString("en-IN")} × {item.quantity}</span>
                  </div>
                </div>

                <span className="font-bold text-slate-300">
                  ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing calculations */}
          <div className="border-t border-slate-800/80 pt-4 space-y-2 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Items Total</span>
              <span className="text-slate-200">₹{order.itemsPrice?.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping Fee</span>
              <span className="text-slate-200">₹{order.shippingPrice?.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (18%)</span>
              <span className="text-slate-200">₹{order.taxPrice?.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-200 border-t border-slate-800/40 pt-2">
              <span>Paid Total</span>
              <span className="text-cyan-400">₹{order.totalAmount?.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

// Mini icons
const LoaderIcon = ({ size, className }) => (
  <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25"/><path d="M4 12a8 8 0 0 1 8-8"/></svg>
);

export default OrderDetails;
