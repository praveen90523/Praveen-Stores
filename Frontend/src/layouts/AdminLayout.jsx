import { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  FolderTree,
  Receipt,
  Users,
  ArrowLeft,
  Menu,
  X,
  Zap,
} from "lucide-react";

const AdminLayout = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Products", path: "/admin/products", icon: ShoppingBag },
    { name: "Categories", path: "/admin/categories", icon: FolderTree },
    { name: "Orders", path: "/admin/orders", icon: Receipt },
    { name: "Users", path: "/admin/users", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#F8FCFD] dark:bg-[#0F172A] flex">

      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm"
      >
        {sidebarOpen ? <X size={20} className="text-slate-700 dark:text-slate-350" /> : <Menu size={20} className="text-slate-700 dark:text-slate-350" />}
      </button>

      {/* Sidebar Backdrop (mobile) */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/20 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 p-6 flex flex-col justify-between transform transition-transform duration-300 md:translate-x-0 md:static md:h-screen shadow-sm ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Logo */}
          <div className="mb-8 mt-2">
            <Link
              to="/admin/dashboard"
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-sky-600 rounded-lg flex items-center justify-center">
                <Zap size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">AG Store</p>
                <p className="text-[10px] text-gray-400 leading-tight">Admin Console</p>
              </div>
            </Link>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-cyan-50 dark:bg-cyan-950/20 text-cyan-600 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-900"
                      : "text-gray-600 dark:text-gray-400 hover:bg-cyan-50/50 dark:hover:bg-slate-700 hover:text-cyan-600 dark:hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Back to Store */}
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition duration-200"
        >
          <ArrowLeft size={18} />
          <span>Exit Admin</span>
        </Link>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen overflow-y-auto">
        <main className="flex-grow p-6 md:p-10"><Outlet /></main>
      </div>
    </div>
  );
};

export default AdminLayout;
