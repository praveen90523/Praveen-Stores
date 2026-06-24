import React, { useState, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import {
    addToLocalCart,
    updateLocalCartItem,
    removeFromLocalCart,
    addToDBCart,
    updateDBCartItem,
    removeFromDBCart,
    clearLocalCart,
    clearDBCart,
} from "../redux/slices/cartSlice";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, Gift } from "lucide-react";
import { toast } from "react-toastify";

const Cart = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { isAuthenticated } = useSelector((state) => state.auth);
    const { items } = useSelector((state) => state.cart);

    // Settings & Theme Context for Loyalty Rewards & Notifications
    const { loyaltyPoints, addNotification } = useContext(ThemeContext);

    // Coupon and loyalty state
    const [couponInput, setCouponInput] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState("");
    const [couponDiscountPercent, setCouponDiscountPercent] = useState(0);

    const [pointsToRedeem, setPointsToRedeem] = useState(0);
    const [pointsRedeemedInput, setPointsRedeemedInput] = useState("");

    const handleQtyChange = (product, currentQty, action) => {
        let newQty = action === "inc" ? currentQty + 1 : currentQty - 1;

        if (newQty < 1) return;
        if (newQty > product.stock) {
            toast.warning(`Only ${product.stock} items left in stock`);
            return;
        }

        if (isAuthenticated) {
            dispatch(updateDBCartItem({ productId: product._id, quantity: newQty }));
        } else {
            dispatch(updateLocalCartItem({ productId: product._id, quantity: newQty }));
        }
    };

    const handleRemove = (productId) => {
        if (isAuthenticated) {
            dispatch(removeFromDBCart(productId));
        } else {
            dispatch(removeFromLocalCart(productId));
        }
        toast.success("Item removed from cart");
    };

    const handleClearCart = () => {
        if (isAuthenticated) {
            dispatch(clearDBCart());
        } else {
            dispatch(clearLocalCart());
        }
        toast.success("Cart cleared");
    };

    // 1. Calculate base items pricing
    const getCartProduct = (item) => {
      if (!item) return null;
      if (item.product && typeof item.product === "object") return item.product;
      return {
        _id: item.product || item._id || item.id,
        name: item.product?.name || item.name || "Product",
        price: item.product?.price || item.price || 0,
        images: item.product?.images || item.images || [],
        stock: item.product?.stock || item.stock || 1,
      };
    };

    const itemsPrice = items.reduce(
        (sum, item) => sum + (getCartProduct(item)?.price || 0) * item.quantity,
        0
    );

    // 2. Apply Coupon Discount (reduces base items price)
    const couponDiscountAmount = Math.round((itemsPrice * couponDiscountPercent) / 100);
    const priceAfterCoupon = itemsPrice - couponDiscountAmount;

    // 3. Apply Loyalty Points Redemption (10 points = ₹1 discount)
    const maxRedeemableCash = Math.floor(loyaltyPoints / 10);
    const actualPointsRedeemed = Math.min(pointsToRedeem, loyaltyPoints, priceAfterCoupon * 10);
    const pointsDiscountAmount = Math.round(actualPointsRedeemed / 10);

    // 4. Calculate Final Prices
    const finalItemsPrice = Math.max(0, priceAfterCoupon - pointsDiscountAmount);
    const shippingPrice = itemsPrice === 0 || itemsPrice > 2000 ? 0 : 99;
    const taxPrice = Math.round(finalItemsPrice * 0.18); // 18% GST on final price
    const totalAmount = finalItemsPrice + shippingPrice + taxPrice;

    const handleApplyCoupon = (e) => {
        e.preventDefault();
        const code = couponInput.trim().toUpperCase();
        if (code === "OCEAN20") {
            setAppliedCoupon("OCEAN20");
            setCouponDiscountPercent(20);
            toast.success("Promo code OCEAN20 applied! 20% discount verified.");
        } else if (code === "PRAVEEN10") {
            setAppliedCoupon("PRAVEEN10");
            setCouponDiscountPercent(10);
            toast.success("Promo code PRAVEEN10 applied! 10% discount verified.");
        } else {
            toast.error("Invalid coupon code.");
        }
    };

    const handleApplyPoints = (e) => {
        e.preventDefault();
        const pts = parseInt(pointsRedeemedInput, 10);
        if (isNaN(pts) || pts < 0) {
            toast.error("Enter a valid number of points.");
            return;
        }
        if (pts > loyaltyPoints) {
            toast.error(`You only have ${loyaltyPoints} points available.`);
            return;
        }

        setPointsToRedeem(pts);
        toast.success(`Redeemed ${pts} loyalty points for ₹${Math.round(pts / 10)} off!`);
    };

    const handleCheckout = () => {
        if (!isAuthenticated) {
            toast.info("Please login to proceed to checkout");
            navigate("/login?redirect=checkout");
            return;
        }

        // Pass promotion params to Checkout using localStorage
        const checkoutPromo = {
            appliedCoupon,
            couponDiscountPercent,
            couponDiscountAmount,
            pointsToRedeem: actualPointsRedeemed,
            pointsDiscountAmount,
            totalAmount
        };
        localStorage.setItem("checkoutPromo", JSON.stringify(checkoutPromo));
        navigate("/checkout");
    };

    return (
        <>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black tracking-wider text-slate-800 dark:text-slate-100 uppercase">
                            Shopping Cart
                        </h1>
                        <p className="text-xs text-slate-450 dark:text-slate-400 mt-1">
                            Manage your selected items.
                        </p>
                    </div>

                    {items.length > 0 && (
                        <button
                            onClick={handleClearCart}
                            className="text-xs text-rose-500 hover:text-rose-600 font-bold border border-rose-500/20 bg-rose-500/5 px-3.5 py-1.5 rounded-xl transition"
                        >
                            Clear Cart
                        </button>
                    )}
                </div>

                {items.length === 0 ? (
                    <div className="glass-card rounded-3xl p-16 text-center flex flex-col items-center border border-slate-200 dark:border-slate-800">
                        <ShoppingBag size={48} className="text-slate-400 mb-4 animate-bounce" />
                        <h3 className="text-base font-bold text-slate-800 dark:text-slate-350">Your shopping cart is empty</h3>
                        <p className="text-xs text-slate-450 dark:text-slate-400 mt-2 max-w-sm">
                            Add some of our luxury products to fill your cart.
                        </p>
                        <Link
                            to="/products"
                            className="mt-6 bg-ocean-primary hover:bg-ocean-secondary text-white font-bold text-xs px-6 py-3 rounded-xl transition duration-300 shadow-lg shadow-cyan-500/10"
                        >
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-8 select-text">

                        {/* List of items */}
                        <div className="flex-grow space-y-4">
                            {items.map((item) => {
                                const prod = getCartProduct(item);
                                if (!prod) return null;
                                const imgUrl = prod.images?.[0] || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200";

                                return (
                                    <div
                                        key={prod._id}
                                        className="glass-card p-5 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-200 dark:border-slate-850"
                                    >
                                        {/* Image & Title group */}
                                        <div className="flex items-center gap-4 w-full sm:w-auto">
                                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-950 flex-shrink-0 border border-slate-200 dark:border-slate-800">
                                                <img src={imgUrl} alt={prod.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <Link to={`/products/${prod._id}`} className="font-bold text-xs text-slate-800 dark:text-slate-200 hover:text-ocean-primary transition line-clamp-1">
                                                    {prod.name}
                                                </Link>
                                                <p className="text-[10px] text-slate-450 dark:text-slate-500 capitalize mt-0.5">Category: {prod.category?.name || "Generic"}</p>
                                                <p className="text-xs font-bold text-slate-800 dark:text-slate-350 mt-1 sm:hidden">
                                                    ₹{prod.price.toLocaleString("en-IN")}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Price, Qty and action controls */}
                                        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                                            <span className="hidden sm:inline text-xs font-bold text-slate-700 dark:text-slate-300">
                                                ₹{prod.price.toLocaleString("en-IN")}
                                            </span>

                                            {/* Qty count selector */}
                                            <div className="flex items-center glass-card border border-slate-200 dark:border-slate-750 rounded-lg overflow-hidden">
                                                <button
                                                    onClick={() => handleQtyChange(prod, item.quantity, "dec")}
                                                    className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition"
                                                >
                                                    <Minus size={11} />
                                                </button>
                                                <span className="w-8 text-center text-xs font-bold text-slate-800 dark:text-slate-200">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => handleQtyChange(prod, item.quantity, "inc")}
                                                    className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition"
                                                >
                                                    <Plus size={11} />
                                                </button>
                                            </div>

                                            {/* Total cost of item */}
                                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 w-20 text-right">
                                                ₹{(prod.price * item.quantity).toLocaleString("en-IN")}
                                            </span>

                                            <button
                                                onClick={() => handleRemove(prod._id)}
                                                className="text-slate-450 hover:text-rose-500 transition duration-150 p-2"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>

                                    </div>
                                );
                            })}

                            {/* Coupons & Loyalty Redemption forms side by side at bottom of listings */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Coupon Code block */}
                                <div className="glass-card p-5 rounded-3xl border border-slate-200 dark:border-slate-850">
                                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-3">
                                        <Tag size={14} className="text-ocean-primary" /> Apply Promo Code
                                    </h4>
                                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="e.g. OCEAN20"
                                            value={couponInput}
                                            onChange={(e) => setCouponInput(e.target.value)}
                                            className="flex-grow py-2 px-3 rounded-lg text-xs glass-input focus:ring-1 focus:ring-ocean-primary"
                                        />
                                        <button
                                            type="submit"
                                            className="bg-ocean-primary hover:bg-ocean-secondary text-white text-xs font-bold px-4 py-2 rounded-lg transition"
                                        >
                                            Apply
                                        </button>
                                    </form>
                                    {appliedCoupon && (
                                        <p className="text-[10px] text-emerald-500 font-bold mt-2">
                                            Active Code: {appliedCoupon} ({couponDiscountPercent}% discount applied)
                                        </p>
                                    )}
                                </div>

                                {/* Loyalty points block */}
                                <div className="glass-card p-5 rounded-3xl border border-slate-200 dark:border-slate-850">
                                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-2">
                                        <Gift size={14} className="text-ocean-primary animate-bounce" /> Wave loyalty Rewards
                                    </h4>
                                    <p className="text-[10px] text-slate-450 dark:text-slate-400 mb-2">
                                        You have <strong className="text-ocean-primary">{loyaltyPoints}</strong> loyalty points available (Redeem value: ₹{maxRedeemableCash} off).
                                    </p>
                                    <form onSubmit={handleApplyPoints} className="flex gap-2">
                                        <input
                                            type="number"
                                            placeholder={`Max ${loyaltyPoints}`}
                                            value={pointsRedeemedInput}
                                            onChange={(e) => setPointsRedeemedInput(e.target.value)}
                                            className="flex-grow py-2 px-3 rounded-lg text-xs glass-input focus:ring-1 focus:ring-ocean-primary"
                                        />
                                        <button
                                            type="submit"
                                            className="bg-ocean-primary hover:bg-ocean-secondary text-white text-xs font-bold px-4 py-2 rounded-lg transition"
                                        >
                                            Redeem
                                        </button>
                                    </form>
                                    {pointsToRedeem > 0 && (
                                        <p className="text-[10px] text-emerald-500 font-bold mt-2">
                                            Points applied: {actualPointsRedeemed} (₹{pointsDiscountAmount} discount applied)
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Cart Summary Sidecard */}
                        <div className="w-full lg:w-96 flex-shrink-0">
                            <div className="glass-card p-6 rounded-3xl space-y-5 border border-slate-200 dark:border-slate-850">
                                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Order Summary</h3>

                                <div className="space-y-3 text-xs text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-850 pb-4">
                                    <div className="flex justify-between">
                                        <span>Base Subtotal</span>
                                        <span className="text-slate-800 dark:text-slate-200 font-semibold">₹{itemsPrice.toLocaleString("en-IN")}</span>
                                    </div>

                                    {couponDiscountAmount > 0 && (
                                        <div className="flex justify-between text-emerald-500">
                                            <span>Promo Discount ({couponDiscountPercent}%)</span>
                                            <span>-₹{couponDiscountAmount.toLocaleString("en-IN")}</span>
                                        </div>
                                    )}

                                    {pointsDiscountAmount > 0 && (
                                        <div className="flex justify-between text-emerald-500">
                                            <span>Loyalty Deduction</span>
                                            <span>-₹{pointsDiscountAmount.toLocaleString("en-IN")}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between">
                                        <span>Shipping Cost</span>
                                        <span className="text-slate-800 dark:text-slate-200">
                                            {shippingPrice === 0 ? (
                                                <span className="text-emerald-500 font-semibold">Free</span>
                                            ) : (
                                                `₹${shippingPrice}`
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>GST (18%)</span>
                                        <span className="text-slate-800 dark:text-slate-200">₹{taxPrice.toLocaleString("en-IN")}</span>
                                    </div>
                                </div>

                                <div className="flex justify-between text-xs font-bold text-slate-855 dark:text-slate-200">
                                    <span>Grand Total</span>
                                    <span className="text-ocean-primary text-base font-black">₹{totalAmount.toLocaleString("en-IN")}</span>
                                </div>

                                {shippingPrice > 0 && (
                                    <p className="text-[10px] text-slate-450 dark:text-slate-400 leading-normal text-center bg-slate-100/50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-850">
                                        Add items worth <span className="font-semibold text-slate-800 dark:text-slate-350">₹{2000 - itemsPrice}</span> more for Free Shipping!
                                    </p>
                                )}

                                <button
                                    onClick={handleCheckout}
                                    className="w-full bg-ocean-primary hover:bg-ocean-secondary text-white font-bold py-3.5 rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 text-xs"
                                >
                                    <span>Proceed to Checkout</span>
                                    <ArrowRight size={14} />
                                </button>
                            </div>
                        </div>

                    </div>
                )}

            </div>
        </>
    );
};

export default Cart;
