const Loader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-sm">
      <div className="relative w-16 h-16">
        {/* Outer glowing ring */}
        <div className="absolute inset-0 rounded-full border-4 border-t-cyan-500 border-r-sky-500 border-b-cyan-300 border-l-transparent animate-spin"></div>
        {/* Inner static glow */}
        <div className="absolute inset-2 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm">
          <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping"></div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
