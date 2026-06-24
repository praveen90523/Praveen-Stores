import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Redux Actions
import { loadUserProfile } from "./redux/slices/authSlice";
import { fetchDBCart } from "./redux/slices/cartSlice";

// Shared Route Guards & Layouts
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";

// Public Pages
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import About from "./pages/About";
import Contact from "./pages/Contact";

// User Pages
import Profile from "./pages/Profile";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";

// Admin Pages
import Dashboard from "./pages/admin/Dashboard";
import ManageProducts from "./pages/admin/ManageProducts";
import ManageCategories from "./pages/admin/ManageCategories";
import ManageOrders from "./pages/admin/ManageOrders";
import AddProduct from "./pages/admin/AddProduct";
import EditProduct from "./pages/admin/EditProduct";
import ManageUsers from "./pages/admin/ManageUsers";

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(loadUserProfile());
    }
  }, [token, dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchDBCart());
    }
  }, [isAuthenticated, dispatch]);

  return (
    <BrowserRouter>
      {/* Toast — Light theme, premium white style */}
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        theme="light"
        toastStyle={{
          background: "#FFFFFF",
          border: "1px solid #E5E7EB",
          borderRadius: "12px",
          color: "#111827",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          fontSize: "13px",
        }}
      />

      <Routes>
        {/* persistent MainLayout for shopping shell */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />

          {/* User Protected Routes wrapped inside MainLayout */}
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
        </Route>

        {/* Guest Auth Pages (No Navbar/Footer) */}
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* persistent AdminLayout for administration workspace */}
        <Route element={<ProtectedRoute><AdminRoute><AdminLayout /></AdminRoute></ProtectedRoute>}>
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/products" element={<ManageProducts />} />
          <Route path="/admin/products/new" element={<AddProduct />} />
          <Route path="/admin/products/edit/:id" element={<EditProduct />} />
          <Route path="/admin/categories" element={<ManageCategories />} />
          <Route path="/admin/orders" element={<ManageOrders />} />
          <Route path="/admin/users" element={<ManageUsers />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;