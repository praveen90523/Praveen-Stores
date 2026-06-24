import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { HeartOff } from "lucide-react";

const Wishlist = () => {
  const { items } = useSelector((state) => state.wishlist);

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-wider text-slate-900 dark:text-slate-50 uppercase">
            My Wishlist
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Products you have saved for later.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center flex flex-col items-center">
            <HeartOff size={48} className="text-slate-500 mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300">Your wishlist is empty</h3>
            <p className="text-sm text-slate-400 mt-2 max-w-sm">
              Explore products and add items to your wishlist to save them here.
            </p>
            <Link
              to="/products"
              className="mt-6 bg-ocean-primary hover:bg-ocean-secondary text-white font-semibold px-6 py-2.5 rounded-xl transition duration-300 shadow-lg shadow-ocean-primary/20"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Wishlist;
