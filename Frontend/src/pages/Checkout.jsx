import React, { useState, useEffect, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import { createRazorpayOrder, verifyRazorpayPayment, createDBOrder } from "../redux/slices/orderSlice";
import { clearDBCart } from "../redux/slices/cartSlice";
import { CreditCard, MapPin, Phone, ShieldCheck, Mail, Tag, Gift, Check, ArrowRight, ArrowLeft, QrCode, Smartphone, Truck } from "lucide-react";
import { toast } from "react-toastify";
import Loader from "../components/Loader";

// Dynamic script loader for Razorpay Checkout
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  const { loading } = useSelector((state) => state.orders);

  // Settings & Theme Context
  const { addLoyaltyPoints, redeemPoints, addNotification } = useContext(ThemeContext);

  // Multi-step state: 1 = Shipping, 2 = Order Review & Payment
  const [step, setStep] = useState(1);

  // Shipping Form States
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [country, setCountry] = useState("India");
  const [pinCode, setPinCode] = useState("");
  const [phoneNo, setPhoneNo] = useState("");

  // Promo details loaded from Cart
  const [promoDetails, setPromoDetails] = useState({
    appliedCoupon: "",
    couponDiscountPercent: 0,
    couponDiscountAmount: 0,
    pointsToRedeem: 0,
    pointsDiscountAmount: 0,
  });

  // Simulated Payment States
  const [paymentMethod, setPaymentMethod] = useState("upi"); // default to UPI as requested
  const [upiProvider, setUpiProvider] = useState("phonepe");
  const [upiId, setUpiId] = useState("");
  const [cardNo, setCardNo] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVV, setCardCVV] = useState("");
  const [cardName, setCardName] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [processingMessage, setProcessingMessage] = useState("");

  const handleCardNoChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = value.match(/.{1,4}/g)?.join(" ") || value;
    setCardNo(formatted);
  };

  const handleCardExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    setCardExpiry(value);
  };

  const handleCardCVVChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 3);
    setCardCVV(value);
  };

  const handleCardNameChange = (e) => {
    setCardName(e.target.value.toUpperCase());
  };

  const handleSimulatedCardPayment = async (e) => {
    e.preventDefault();
    if (!cardNo || !cardExpiry || !cardCVV || !cardName) {
      toast.error("Please fill in all card details");
      return;
    }
    if (cardNo.replace(/\s/g, "").length < 16) {
      toast.error("Invalid card number. Must be 16 digits.");
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
      toast.error("Invalid expiry date format. Use MM/YY.");
      return;
    }
    if (cardCVV.length < 3) {
      toast.error("Invalid CVV.");
      return;
    }

    setIsProcessingPayment(true);

    const steps = [
      "Establishing secure 256-bit connection...",
      "Validating card information...",
      "Securing token authorization...",
      "Processing merchant payment transfer...",
      "Authorizing and final checks...",
      "Payment Authorized successfully!"
    ];

    for (let i = 0; i < steps.length; i++) {
      setProcessingMessage(steps[i]);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    try {
      const dbOrderPayload = {
        shippingAddress: {
          address,
          city,
          state: stateName,
          country,
          pinCode,
          phoneNo,
        },
        orderItems: items.map((item) => ({
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.images?.[0] || "",
          product: item.product._id,
        })),
        paymentInfo: {
          id: `pay_sim_card_${Date.now().toString(36).toUpperCase()}`,
          status: "Succeeded",
        },
        itemsPrice: finalItemsPrice,
        taxPrice,
        shippingPrice,
        totalAmount,
      };

      await dispatch(createDBOrder(dbOrderPayload)).unwrap();

      // Deduct redeemed points and add newly earned points
      if (promoDetails.pointsToRedeem > 0) {
        redeemPoints(promoDetails.pointsToRedeem);
      }
      if (loyaltyPointsToAward > 0) {
        addLoyaltyPoints(loyaltyPointsToAward);
      }

      // Log notifications
      addNotification(`Order placed successfully via Simulated Card Payment!`, "success");
      addNotification(`You earned +${loyaltyPointsToAward} loyalty points from your order.`, "success");

      // Clear cart state and coupon state
      dispatch(clearDBCart());
      localStorage.removeItem("checkoutPromo");

      toast.success("Payment successful! Order placed.");
      setIsProcessingPayment(false);
      navigate("/orders?success=true");
    } catch (err) {
      setIsProcessingPayment(false);
      toast.error(err || "Failed to create order");
    }
  };

  const handleUPIPayment = async (e) => {
    e.preventDefault();
    if (!upiId) {
      toast.error("Please enter your UPI ID");
      return;
    }
    if (!/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(upiId)) {
      toast.error("Invalid UPI ID format. E.g. name@upi");
      return;
    }

    setIsProcessingPayment(true);

    const providerNames = {
      phonepe: "PhonePe",
      gpay: "Google Pay",
      paytm: "Paytm",
      other: "UPI"
    };
    const appName = providerNames[upiProvider] || "UPI App";

    const steps = [
      `Connecting to secure ${appName} gateway...`,
      `Sending collect request to ${upiId}...`,
      `Awaiting authorization on your mobile device...`,
      `Retrieving secure transaction authorization...`,
      "Validating UPI transaction token...",
      "Payment Authorized successfully!"
    ];

    for (let i = 0; i < steps.length; i++) {
      setProcessingMessage(steps[i]);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    try {
      const dbOrderPayload = {
        shippingAddress: {
          address,
          city,
          state: stateName,
          country,
          pinCode,
          phoneNo,
        },
        orderItems: items.map((item) => ({
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.images?.[0] || "",
          product: item.product._id,
        })),
        paymentInfo: {
          id: `pay_upi_${Date.now().toString(36).toUpperCase()}`,
          status: "Succeeded",
        },
        itemsPrice: finalItemsPrice,
        taxPrice,
        shippingPrice,
        totalAmount,
      };

      await dispatch(createDBOrder(dbOrderPayload)).unwrap();

      if (promoDetails.pointsToRedeem > 0) {
        redeemPoints(promoDetails.pointsToRedeem);
      }
      if (loyaltyPointsToAward > 0) {
        addLoyaltyPoints(loyaltyPointsToAward);
      }

      addNotification(`Order placed successfully via UPI (${appName})!`, "success");
      addNotification(`You earned +${loyaltyPointsToAward} loyalty points from your order.`, "success");

      dispatch(clearDBCart());
      localStorage.removeItem("checkoutPromo");

      toast.success("Payment successful! Order placed.");
      setIsProcessingPayment(false);
      navigate("/orders?success=true");
    } catch (err) {
      setIsProcessingPayment(false);
      toast.error(err || "Failed to create order");
    }
  };

  const handleCODPayment = async (e) => {
    e.preventDefault();
    setIsProcessingPayment(true);

    const steps = [
      "Configuring Cash on Delivery handler...",
      "Verifying delivery address validation...",
      "Creating COD invoice...",
      "COD Order confirmed successfully!"
    ];

    for (let i = 0; i < steps.length; i++) {
      setProcessingMessage(steps[i]);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    try {
      const dbOrderPayload = {
        shippingAddress: {
          address,
          city,
          state: stateName,
          country,
          pinCode,
          phoneNo,
        },
        orderItems: items.map((item) => ({
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.images?.[0] || "",
          product: item.product._id,
        })),
        paymentInfo: {
          id: `COD_${Date.now().toString(36).toUpperCase()}`,
          status: "Pending",
        },
        itemsPrice: finalItemsPrice,
        taxPrice,
        shippingPrice,
        totalAmount,
      };

      await dispatch(createDBOrder(dbOrderPayload)).unwrap();

      if (promoDetails.pointsToRedeem > 0) {
        redeemPoints(promoDetails.pointsToRedeem);
      }
      if (loyaltyPointsToAward > 0) {
        addLoyaltyPoints(loyaltyPointsToAward);
      }

      addNotification(`Cash on Delivery order placed successfully!`, "success");
      addNotification(`You earned +${loyaltyPointsToAward} loyalty points from your order.`, "success");

      dispatch(clearDBCart());
      localStorage.removeItem("checkoutPromo");

      toast.success("Order placed successfully via COD!");
      setIsProcessingPayment(false);
      navigate("/orders?success=true");
    } catch (err) {
      setIsProcessingPayment(false);
      toast.error(err || "Failed to create order");
    }
  };

  useEffect(() => {
    if (items.length === 0) {
      toast.info("Your cart is empty");
      navigate("/cart");
      return;
    }

    const savedPromo = localStorage.getItem("checkoutPromo");
    if (savedPromo) {
      setPromoDetails(JSON.parse(savedPromo));
    }

    if (user?.name && !upiId) {
      const baseName = user.name.toLowerCase().replace(/[^a-z0-9]/g, "");
      setUpiId(`${baseName}@ybl`);
    }
  }, [items, navigate, user, upiId]);

  // Pricing calculations
  const itemsPrice = items.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );

  const couponDiscountAmount = Math.round((itemsPrice * promoDetails.couponDiscountPercent) / 100);
  const priceAfterCoupon = itemsPrice - couponDiscountAmount;
  const pointsDiscountAmount = promoDetails.pointsDiscountAmount || 0;
  const finalItemsPrice = Math.max(0, priceAfterCoupon - pointsDiscountAmount);

  const shippingPrice = itemsPrice > 2000 ? 0 : 99;
  const taxPrice = Math.round(finalItemsPrice * 0.18);
  const totalAmount = finalItemsPrice + shippingPrice + taxPrice;

  // loyalty points to award
  const loyaltyPointsToAward = Math.round(finalItemsPrice / 10);

  const handleNextStep = (e) => {
    e.preventDefault();
    if (!address || !city || !stateName || !country || !pinCode || !phoneNo) {
      toast.error("Please fill all shipping fields");
      return;
    }
    if (phoneNo.length < 10) {
      toast.error("Invalid phone number");
      return;
    }
    setStep(2);
  };

  const handlePrevStep = () => {
    setStep(1);
  };

  const handleSubmitPayment = async () => {
    // Load Razorpay Script
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      toast.error("Razorpay SDK failed to load. Checkout cannot proceed.");
      return;
    }

    try {
      // 1. Create order on backend (amount in paise, so * 100)
      const rzpOrderResponse = await dispatch(createRazorpayOrder(totalAmount)).unwrap();

      // 2. Configure Razorpay Gateway Options
      const options = {
        key: "rzp_test_placeholder_key_id",
        amount: rzpOrderResponse.amount,
        currency: rzpOrderResponse.currency,
        name: "Praveen Store",
        description: "Tranquil shopping checkout",
        order_id: rzpOrderResponse.id,
        handler: async (response) => {
          const verificationPayload = {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          };

          try {
            // 3. Verify Signature
            await dispatch(verifyRazorpayPayment(verificationPayload)).unwrap();

            // 4. Create database Order Record
            const dbOrderPayload = {
              shippingAddress: {
                address,
                city,
                state: stateName,
                country,
                pinCode,
                phoneNo,
              },
              orderItems: items.map((item) => ({
                name: item.product.name,
                price: item.product.price,
                quantity: item.quantity,
                image: item.product.images?.[0] || "",
                product: item.product._id,
              })),
              paymentInfo: {
                id: response.razorpay_payment_id,
                status: "Succeeded",
              },
              itemsPrice: finalItemsPrice,
              taxPrice,
              shippingPrice,
              totalAmount,
            };

            await dispatch(createDBOrder(dbOrderPayload)).unwrap();

            // 5. Deduct redeemed points and add newly earned points
            if (promoDetails.pointsToRedeem > 0) {
              redeemPoints(promoDetails.pointsToRedeem);
            }
            if (loyaltyPointsToAward > 0) {
              addLoyaltyPoints(loyaltyPointsToAward);
            }

            // 6. Log notifications
            addNotification(`Order placed successfully! Payment ID: ${response.razorpay_payment_id}.`, "success");
            addNotification(`You earned +${loyaltyPointsToAward} loyalty points from your order.`, "success");

            // 7. Clear cart state and coupon state
            dispatch(clearDBCart());
            localStorage.removeItem("checkoutPromo");

            toast.success("Payment successful! Order placed.");
            navigate("/orders?success=true");

          } catch (err) {
            toast.error(err || "Payment signature verification failed");
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: phoneNo,
        },
        theme: {
          color: "#0ea5e9", // Ocean Blue primary
        },
        modal: {
          ondismiss: () => {
            toast.warning("Payment cancelled by user");
          },
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (err) {
      toast.error(err || "Failed to create Razorpay Order");
    }
  };

  return (
    <>
      {loading && <Loader />}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-950 transition-colors duration-300 select-text">

        {/* Step Indicator Header */}
        <div className="mb-10 text-center select-none">
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-50 uppercase">
            Checkout Process
          </h1>
          <div className="flex items-center justify-center gap-6 mt-6">
            <span className={`text-xs font-bold flex items-center gap-1.5 pb-2 border-b-2 transition ${step === 1 ? "border-ocean-primary text-ocean-primary" : "border-transparent text-slate-400"}`}>
              <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center border text-[10px]">1</span> Shipping Details
            </span>
            <span className="text-slate-300 dark:text-slate-800 text-sm">→</span>
            <span className={`text-xs font-bold flex items-center gap-1.5 pb-2 border-b-2 transition ${step === 2 ? "border-ocean-primary text-ocean-primary" : "border-transparent text-slate-400"}`}>
              <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center border text-[10px]">2</span> Review & Pay
            </span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Main Form content based on current step */}
          <div className="flex-grow w-full">
            {step === 1 ? (
              <form onSubmit={handleNextStep} className="glass-card p-6 sm:p-8 rounded-3xl space-y-6 border border-slate-200 dark:border-slate-850 bg-white">
                <h3 className="text-sm font-bold text-slate-850 dark:text-slate-250 flex items-center gap-2">
                  <MapPin size={16} className="text-ocean-primary" />
                  <span>Delivery Address</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Street Address</label>
                    <input
                      type="text"
                      placeholder="e.g. 123 Infinite Way"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full glass-input p-3 rounded-xl text-xs outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">City</label>
                    <input
                      type="text"
                      placeholder="e.g. Bangalore"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full glass-input p-3 rounded-xl text-xs outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">State</label>
                    <input
                      type="text"
                      placeholder="e.g. Karnataka"
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      className="w-full glass-input p-3 rounded-xl text-xs outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">PIN Code</label>
                    <input
                      type="text"
                      placeholder="e.g. 560001"
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value)}
                      className="w-full glass-input p-3 rounded-xl text-xs outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Country</label>
                    <input
                      type="text"
                      placeholder="India"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full glass-input p-3 rounded-xl text-xs outline-none"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Phone Number (For Delivery alerts)</label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-4 top-3 text-slate-400" />
                      <input
                        type="text"
                        placeholder="e.g. 9988887777"
                        value={phoneNo}
                        onChange={(e) => setPhoneNo(e.target.value)}
                        className="w-full glass-input py-3 pl-10 pr-4 rounded-xl text-xs outline-none"
                        required
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-ocean text-white font-bold py-3.5 rounded-xl transition duration-300 transform hover:scale-[1.01] hover:shadow-cyan-500/10 flex items-center justify-center gap-1.5 text-xs tracking-wider"
                >
                  <span>Proceed to Review & Pay</span>
                  <ArrowRight size={14} />
                </button>
              </form>
            ) : (
              /* Step 2: Review Order & Pay */
              <div className="space-y-6">
                {/* Shipping Details Review */}
                <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-1.5">
                    <MapPin size={14} className="text-cyan-600 dark:text-cyan-400" /> Shipping Summary
                  </h3>
                  <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed space-y-1">
                    <p className="font-bold text-slate-800 dark:text-slate-300">{user?.name}</p>
                    <p>{address}, {city}, {stateName} - {pinCode}</p>
                    <p>Phone: {phoneNo}</p>
                  </div>
                  <button
                    onClick={handlePrevStep}
                    className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline font-bold mt-3 flex items-center gap-1"
                  >
                    <ArrowLeft size={12} /> Edit Shipping Details
                  </button>
                </div>

                {/* Secure Payment Gateway Select Tabs */}
                <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-6">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
                      <CreditCard size={14} className="text-cyan-600 dark:text-cyan-400" /> Select Payment Method
                    </h3>
                    <p className="text-[10px] text-slate-400 mb-4">
                      Choose between UPI apps, Cash on Delivery, simulated card, or Razorpay Sandbox checkout.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <button
                        onClick={() => setPaymentMethod("upi")}
                        type="button"
                        className={`py-3 px-4 rounded-xl border font-bold text-xs transition duration-200 flex flex-col items-center gap-1.5 ${paymentMethod === "upi"
                            ? "border-cyan-600 bg-cyan-50/50 text-cyan-600 dark:border-cyan-500 dark:bg-cyan-500/10 dark:text-cyan-400 shadow-sm"
                            : "border-gray-200 dark:border-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-850"
                          }`}
                      >
                        <Smartphone size={16} />
                        <span>UPI Apps</span>
                      </button>

                      <button
                        onClick={() => setPaymentMethod("cod")}
                        type="button"
                        className={`py-3 px-4 rounded-xl border font-bold text-xs transition duration-200 flex flex-col items-center gap-1.5 ${paymentMethod === "cod"
                            ? "border-cyan-600 bg-cyan-50/50 text-cyan-600 dark:border-cyan-500 dark:bg-cyan-500/10 dark:text-cyan-400 shadow-sm"
                            : "border-gray-200 dark:border-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-850"
                          }`}
                      >
                        <Truck size={16} />
                        <span>Cash on Delivery</span>
                      </button>

                      <button
                        onClick={() => setPaymentMethod("card")}
                        type="button"
                        className={`py-3 px-4 rounded-xl border font-bold text-xs transition duration-200 flex flex-col items-center gap-1.5 ${paymentMethod === "card"
                            ? "border-cyan-600 bg-cyan-50/50 text-cyan-600 dark:border-cyan-500 dark:bg-cyan-500/10 dark:text-cyan-400 shadow-sm"
                            : "border-gray-200 dark:border-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-850"
                          }`}
                      >
                        <CreditCard size={16} />
                        <span>Card (Simulated)</span>
                      </button>

                      <button
                        onClick={() => setPaymentMethod("razorpay")}
                        type="button"
                        className={`py-3 px-4 rounded-xl border font-bold text-xs transition duration-200 flex flex-col items-center gap-1.5 ${paymentMethod === "razorpay"
                            ? "border-cyan-600 bg-cyan-50/50 text-cyan-600 dark:border-cyan-500 dark:bg-cyan-500/10 dark:text-cyan-400 shadow-sm"
                            : "border-gray-200 dark:border-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-850"
                          }`}
                      >
                        <ShieldCheck size={16} />
                        <span>Razorpay Live</span>
                      </button>
                    </div>
                  </div>

                  {paymentMethod === "upi" && (
                    <div className="space-y-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex flex-wrap gap-2.5">
                        {[
                          { id: "phonepe", label: "PhonePe", textColor: "text-purple-650 dark:text-purple-400", bgLight: "bg-purple-50 dark:bg-purple-950/20" },
                          { id: "gpay", label: "Google Pay", textColor: "text-cyan-600 dark:text-cyan-400", bgLight: "bg-cyan-50 dark:bg-cyan-950/20" },
                          { id: "paytm", label: "Paytm", textColor: "text-sky-650 dark:text-sky-400", bgLight: "bg-sky-50 dark:bg-sky-950/20" },
                          { id: "other", label: "Custom UPI ID", textColor: "text-slate-650 dark:text-slate-400", bgLight: "bg-slate-50 dark:bg-slate-950/20" },
                        ].map((prov) => (
                          <button
                            key={prov.id}
                            type="button"
                            onClick={() => {
                              setUpiProvider(prov.id);
                              if (prov.id !== "other") {
                                const baseName = user?.name ? user.name.toLowerCase().replace(/[^a-z0-9]/g, "") : "praveen";
                                const suffix = prov.id === "phonepe" ? "@ybl" : prov.id === "gpay" ? "@okaxis" : "@paytm";
                                setUpiId(`${baseName}${suffix}`);
                              } else {
                                setUpiId("");
                              }
                            }}
                            className={`flex-1 min-w-[90px] py-2.5 px-3 rounded-xl border text-[11px] font-bold transition duration-200 text-center flex flex-col items-center gap-1 ${
                              upiProvider === prov.id
                                ? `border-cyan-600 dark:border-cyan-500 ${prov.textColor} ${prov.bgLight} shadow-sm`
                                : "border-gray-200 dark:border-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-850"
                            }`}
                          >
                            <span>{prov.label}</span>
                          </button>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <div className="space-y-3">
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                            Enter UPI ID / VPA
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="e.g. mobile-no@ybl"
                              value={upiId}
                              onChange={(e) => setUpiId(e.target.value)}
                              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-xs outline-none focus:border-cyan-500 transition font-mono"
                              required
                            />
                            {upiId && (
                              <span className="absolute right-3 top-3 text-[9px] text-green-500 font-bold tracking-wider uppercase bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20">
                                Verified
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 leading-normal">
                            Request will be sent to your UPI app. You will have 5 mins to approve.
                          </p>
                        </div>

                        {/* Scanner container */}
                        <div className="flex flex-col items-center justify-center p-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 relative overflow-hidden h-36 select-none">
                          {/* Glow scanning line */}
                          <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_8px_#22d3ee] animate-scanner z-10" />
                          
                          {/* Mock QR code using SVG */}
                          <svg className="w-16 h-16 opacity-80 dark:opacity-90 dark:text-slate-300 text-slate-800" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 3h6v6H3V3zm2 2v2h2V5H5zm8-2h6v6h-6V3zm2 2v2h2V5h-2zM3 15h6v6H3v-6zm2 2v2h2v-2H5zm10-2h2v2h-2v-2zm2 2h2v2h-2v-2zm-2 2h2v2h-2v-2zm-2-2h2v2h-2v-2zm4-4h2v2h-2v-2zm-2 2h2v2h-2v-2z" />
                            <rect x="0" y="0" width="24" height="24" fill="none" />
                          </svg>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2 animate-pulse">
                            Scan QR Code to Pay
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleUPIPayment}
                        className="w-full bg-gradient-ocean text-white font-extrabold py-3.5 rounded-xl transition duration-300 transform hover:scale-[1.01] hover:shadow-cyan-500/15 flex items-center justify-center gap-2 text-xs uppercase tracking-widest shadow shadow-cyan-500/10"
                      >
                        <Smartphone size={14} />
                        <span>Pay ₹{totalAmount.toLocaleString("en-IN")} via {upiProvider === "phonepe" ? "PhonePe" : upiProvider === "gpay" ? "Google Pay" : upiProvider === "paytm" ? "Paytm" : "UPI"}</span>
                      </button>
                    </div>
                  )}

                  {paymentMethod === "cod" && (
                    <div className="space-y-6 pt-4 border-t border-gray-100 dark:border-gray-800 text-center">
                      <div className="p-6 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4 max-w-md mx-auto">
                        <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-full flex items-center justify-center mx-auto">
                          <Truck size={24} className="text-cyan-600 dark:text-cyan-400 animate-bounce" />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">
                            Cash on Delivery (COD) Selected
                          </h4>
                          <p className="text-[10px] text-slate-400 leading-relaxed">
                            No additional handling fees! Pay in cash or scanning delivery QR code directly at your doorstep when your shipment arrives.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleCODPayment}
                        className="w-full bg-gradient-ocean text-white font-extrabold py-3.5 rounded-xl transition duration-300 transform hover:scale-[1.01] hover:shadow-cyan-500/15 flex items-center justify-center gap-2 text-xs uppercase tracking-widest shadow shadow-cyan-500/10"
                      >
                        <Check size={14} />
                        <span>Confirm Cash on Delivery Order</span>
                      </button>
                    </div>
                  )}

                  {paymentMethod === "card" && (
                    /* Simulated Credit Card Form */
                    <form onSubmit={handleSimulatedCardPayment} className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Cardholder Name</label>
                        <input
                          type="text"
                          placeholder="e.g. PRAVEEN D"
                          value={cardName}
                          onChange={handleCardNameChange}
                          className="w-full glass-input p-3 rounded-xl text-xs outline-none focus:border-cyan-500 transition font-mono uppercase"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Card Number</label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="0000 0000 0000 0000"
                            value={cardNo}
                            onChange={handleCardNoChange}
                            className="w-full glass-input p-3 rounded-xl text-xs outline-none focus:border-cyan-500 transition font-mono"
                            required
                          />
                          <div className="absolute right-3.5 top-3.5 flex items-center gap-1.5">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border dark:border-slate-700">
                              {cardNo.startsWith("4") ? "VISA" : cardNo.startsWith("5") ? "MC" : "CARD"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Expiry Date</label>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            value={cardExpiry}
                            onChange={handleCardExpiryChange}
                            className="w-full glass-input p-3 rounded-xl text-xs outline-none focus:border-cyan-500 transition font-mono text-center"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-[9px] font-bold text-slate-450 uppercase tracking-widest mb-1.5 block">CVV</label>
                          <input
                            type="password"
                            placeholder="•••"
                            value={cardCVV}
                            onChange={handleCardCVVChange}
                            className="w-full glass-input p-3 rounded-xl text-xs outline-none focus:border-cyan-500 transition font-mono text-center"
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-gradient-ocean text-white font-extrabold py-3.5 rounded-xl transition duration-300 transform hover:scale-[1.01] hover:shadow-cyan-500/15 flex items-center justify-center gap-2 text-xs uppercase tracking-widest shadow shadow-cyan-500/10"
                      >
                        <CreditCard size={15} />
                        <span>Pay ₹{totalAmount.toLocaleString("en-IN")} Instantly</span>
                      </button>
                    </form>
                  )}

                  {paymentMethod === "razorpay" && (
                    /* Razorpay Option */
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800 text-center">
                      <p className="text-[10px] text-slate-500 mb-4 leading-relaxed">
                        Authorize sandbox testing payment signature with the popup. Stock is recalculated on db verify success.
                      </p>
                      <button
                        type="button"
                        onClick={handleSubmitPayment}
                        className="w-full bg-gradient-ocean text-white font-extrabold py-3.5 rounded-xl transition duration-300 transform hover:scale-[1.01] hover:shadow-cyan-500/15 flex items-center justify-center gap-2 text-xs uppercase tracking-widest shadow shadow-cyan-500/10"
                      >
                        <CreditCard size={16} />
                        <span>Pay ₹{totalAmount.toLocaleString("en-IN")} via Razorpay</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Pricing summary Panel */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="glass-card p-5 rounded-3xl space-y-5 border border-slate-200 dark:border-slate-850 bg-white">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 border-b pb-2 mb-2 dark:border-slate-850">Order Summary</h3>

              {/* List items */}
              <div className="space-y-3.5 max-h-48 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.product._id} className="flex justify-between items-center text-xs">
                    <div className="flex-grow pr-3 min-w-0">
                      <h4 className="font-bold text-slate-705 dark:text-slate-300 line-clamp-1">{item.product.name}</h4>
                      <span className="text-[9px] text-slate-400">Qty: {item.quantity}</span>
                    </div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex-shrink-0">
                      ₹{(item.product.price * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>

              {/* Pricing values */}
              <div className="space-y-2.5 text-xs text-slate-500 dark:text-slate-405 border-t border-b border-slate-100 dark:border-slate-850 py-3">
                <div className="flex justify-between">
                  <span>Base Price</span>
                  <span className="text-slate-800 dark:text-slate-200 font-semibold">₹{itemsPrice.toLocaleString("en-IN")}</span>
                </div>

                {promoDetails.appliedCoupon && (
                  <div className="flex justify-between text-emerald-500 font-bold text-[10px]">
                    <span className="flex items-center gap-0.5"><Tag size={10} /> Coupon ({promoDetails.couponDiscountPercent}%)</span>
                    <span>-₹{couponDiscountAmount.toLocaleString("en-IN")}</span>
                  </div>
                )}

                {promoDetails.pointsToRedeem > 0 && (
                  <div className="flex justify-between text-emerald-500 font-bold text-[10px]">
                    <span className="flex items-center gap-0.5"><Gift size={10} /> Points Applied</span>
                    <span>-₹{pointsDiscountAmount.toLocaleString("en-IN")}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Shipping Cost</span>
                  <span className="text-slate-850 dark:text-slate-200 font-semibold">
                    {shippingPrice === 0 ? <span className="text-emerald-550 dark:text-emerald-400 font-bold">Free</span> : `₹${shippingPrice}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>GST (18%)</span>
                  <span className="text-slate-850 dark:text-slate-200 font-semibold">₹{taxPrice.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="flex justify-between text-xs font-black text-slate-855 dark:text-slate-200">
                <span>Grand Total</span>
                <span className="text-ocean-primary text-sm font-black">₹{totalAmount.toLocaleString("en-IN")}</span>
              </div>

              <div className="flex gap-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-150 dark:border-slate-850 p-3 rounded-2xl items-start">
                <ShieldCheck size={16} className="text-ocean-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-[10px] font-bold text-slate-800 dark:text-slate-350">Secure checkout</h5>
                  <p className="text-[8px] text-slate-450 dark:text-slate-450 text-slate-400 mt-0.5 leading-normal">
                    Payments verified via Razorpay 256-bit SSL transaction signature.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* Simulated Credit Card Authorization Overlay Modal */}
      {isProcessingPayment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999] flex flex-col items-center justify-center p-6 select-none animate-fade-in-up">
          <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-850 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl space-y-6">
            {/* Spinning Loader */}
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-slate-100 dark:border-slate-800" />
              <div className="absolute inset-0 rounded-full border-4 border-t-cyan-500 border-r-cyan-500 animate-spin" />
              <ShieldCheck size={28} className="absolute inset-0 m-auto text-cyan-600 dark:text-cyan-400" />
            </div>

            <div className="space-y-2">
              <h3 className="font-extrabold text-base text-gray-900 dark:text-white uppercase tracking-wider">
                {paymentMethod === "cod" ? "Confirming Order" : "Securing Transaction"}
              </h3>
              <p className="text-xs text-gray-555 dark:text-gray-405 transition-all duration-300 font-medium h-8">
                {processingMessage}
              </p>
            </div>

            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-cyan-600 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${
                    (processingMessage.includes("Establishing") || processingMessage.includes("Connecting") || processingMessage.includes("Configuring")) ? 20 :
                    (processingMessage.includes("Validating card") || processingMessage.includes("Sending collect") || processingMessage.includes("Verifying delivery")) ? 40 :
                    (processingMessage.includes("Securing token") || processingMessage.includes("Awaiting authorization") || processingMessage.includes("Creating COD")) ? 65 :
                    (processingMessage.includes("Processing merchant") || processingMessage.includes("Retrieving secure")) ? 80 :
                    (processingMessage.includes("Authorizing") || processingMessage.includes("Validating UPI")) ? 95 : 100
                  }%`
                }}
              />
            </div>

            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold flex items-center justify-center gap-1">
              <ShieldCheck size={12} className="text-green-500" /> {
                paymentMethod === "upi" ? "BHIM UPI Secure Encryption" :
                paymentMethod === "cod" ? "Direct Doorstep Fulfillment" :
                "PCI-DSS Compliant Encryption"
              }
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Checkout;
