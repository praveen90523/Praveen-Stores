import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { fetchProducts, fetchCategories } from "../redux/slices/productSlice";
import { SlidersHorizontal, Search, RefreshCw } from "lucide-react";

const Products = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const { products, loading, categories, resPerPage, filteredProductsCount, page, pages, totalProducts } =
    useSelector((state) => state.products);

  // Parse initial query params from URL
  const query = new URLSearchParams(location.search);
  const keywordParam = query.get("keyword") || "";
  const categoryParam = query.get("category") || "";
  const minPriceParam = query.get("price[gte]") || "";
  const maxPriceParam = query.get("price[lte]") || "";
  const sortParam = query.get("sort") || "";
  const pageParam = query.get("page") || "1";

  // Filter States
  const [keyword, setKeyword] = useState(keywordParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [minPrice, setMinPrice] = useState(minPriceParam);
  const [maxPrice, setMaxPrice] = useState(maxPriceParam);
  const [sortBy, setSortBy] = useState(sortParam);
  const [currentPage, setCurrentPage] = useState(Number(pageParam));

  // Sync state if URL changes
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    setKeyword(q.get("keyword") || "");
    setSelectedCategory(q.get("category") || "");
    setMinPrice(q.get("price[gte]") || "");
    setMaxPrice(q.get("price[lte]") || "");
    setSortBy(q.get("sort") || "");
    setCurrentPage(Number(q.get("page") || "1"));

    dispatch(fetchProducts(location.search));
  }, [location.search, dispatch]);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Apply filters and navigate to updated URL query
  const applyFilters = (page = 1) => {
    const params = new URLSearchParams();

    if (keyword.trim()) params.append("keyword", keyword.trim());
    if (selectedCategory) params.append("category", selectedCategory);
    if (minPrice) params.append("price[gte]", minPrice);
    if (maxPrice) params.append("price[lte]", maxPrice);
    if (sortBy) params.append("sort", sortBy);
    if (page) params.append("page", page.toString());

    navigate(`/products?${params.toString()}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    applyFilters(1);
  };

  const handleResetFilters = () => {
    setKeyword("");
    setSelectedCategory("");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("");
    setCurrentPage(1);
    navigate("/products");
  };

  // Pagination count
  const totalPages = pages || 1;

  const handlePageChange = (page) => {
    setCurrentPage(page);
    applyFilters(page);
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 select-text">

        {/* Title */}
        <div className="mb-8 flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Browse Products
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Showing {products.length} of {filteredProductsCount} items
            </p>
          </div>

          {/* Sorting Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wider">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                const params = new URLSearchParams(location.search);
                if (e.target.value) {
                  params.set("sort", e.target.value);
                } else {
                  params.delete("sort");
                }
                params.set("page", "1");
                navigate(`/products?${params.toString()}`);
              }}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-sm text-slate-700 dark:text-slate-350 focus:outline-none focus:border-cyan-500 transition"
            >
              <option value="">Default (Newest)</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
              <option value="-rating">Rating: High to Low</option>
            </select>
          </div>
        </div>

        {/* Layout: Sidebar + Grid */}
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Filters Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 sticky top-24 space-y-6 border border-slate-100 dark:border-slate-700 shadow-sm">

              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                  <SlidersHorizontal size={15} /> Filters
                </h3>
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline font-semibold flex items-center gap-0.5"
                >
                  <RefreshCw size={10} /> Reset
                </button>
              </div>

              <hr className="border-slate-100 dark:border-slate-700" />

              {/* Keyword Search */}
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Keyword..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full glass-input py-2 pl-3 pr-8 rounded-xl text-xs outline-none"
                />
                <button type="submit" className="absolute right-2.5 top-2.5 text-slate-400">
                  <Search size={14} />
                </button>
              </form>

              {/* Category selector */}
              <div>
                <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2.5">Category</h4>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setSelectedCategory("");
                      const params = new URLSearchParams(location.search);
                      params.delete("category");
                      params.set("page", "1");
                      navigate(`/products?${params.toString()}`);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition ${!selectedCategory
                        ? "bg-cyan-50 dark:bg-cyan-950/20 text-cyan-600 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-900"
                        : "text-gray-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                      }`}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat._id}
                      onClick={() => {
                        setSelectedCategory(cat._id);
                        const params = new URLSearchParams(location.search);
                        params.set("category", cat._id);
                        params.set("page", "1");
                        navigate(`/products?${params.toString()}`);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition line-clamp-1 ${selectedCategory === cat._id
                          ? "bg-cyan-50 dark:bg-cyan-950/20 text-cyan-600 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-900"
                          : "text-gray-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                        }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price range */}
              <div>
                <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2.5">Price Range (₹)</h4>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full glass-input py-2 px-2 rounded-xl text-sm text-center"
                  />
                  <span className="text-gray-400 text-xs">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full glass-input py-2 px-2 rounded-xl text-sm text-center"
                  />
                </div>
                <button
                  onClick={() => applyFilters(1)}
                  className="w-full mt-3 bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-600 hover:to-sky-700 text-white text-sm font-semibold py-2.5 rounded-xl transition shadow-sm"
                >
                  Apply Filter
                </button>
              </div>

            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-grow flex flex-col justify-between min-h-[500px]">
            {loading ? (
              <div
                className="grid gap-6 w-full justify-center"
                style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}
              >
                {[...Array(6)].map((_, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-800 rounded-2xl p-5 flex flex-col gap-4 border border-slate-100 dark:border-slate-700">
                    <div className="w-full h-48 skeleton rounded-xl"></div>
                    <div className="w-1/3 h-3 skeleton rounded"></div>
                    <div className="w-3/4 h-5 skeleton rounded"></div>
                    <div className="w-1/2 h-3 skeleton rounded"></div>
                    <div className="flex justify-between items-center mt-4">
                      <div className="w-1/3 h-6 skeleton rounded"></div>
                      <div className="w-10 h-10 skeleton rounded-xl"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-16 text-center flex flex-col items-center justify-center h-full border border-slate-100 dark:border-slate-700">
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">No products match your selection.</p>
                <button
                  onClick={handleResetFilters}
                  className="bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-600 hover:to-sky-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div>
                <div
                  className="grid gap-6 w-full justify-center"
                  style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}
                >
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-12">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 text-sm font-medium text-slate-600 dark:text-slate-400 hover:border-cyan-400 disabled:opacity-30 disabled:pointer-events-none transition border border-slate-200 dark:border-slate-700"
                    >
                      Prev
                    </button>
                    {[...Array(totalPages)].map((_, idx) => {
                      const pageNum = idx + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-9 h-9 rounded-xl text-sm font-medium transition border ${currentPage === pageNum
                              ? "bg-cyan-600 border-cyan-600 text-white shadow-sm"
                              : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-cyan-400 border-slate-200 dark:border-slate-700"
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 text-sm font-medium text-slate-600 dark:text-slate-400 hover:border-cyan-400 disabled:opacity-30 disabled:pointer-events-none transition border border-slate-200 dark:border-slate-700"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

      </div>
    </>
  );
};

export default Products;