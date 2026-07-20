import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const ScalesIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v18M3 6l4.5 9M3 6h18M20.5 15l-4.5-9M7.5 15h9M3 21h18" />
    <circle cx="12" cy="3" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const logout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/auth");
  };

  const navLinks = [
    { to: "/", label: "Home" },
    ...(isLoggedIn ? [{ to: "/chatbot", label: "Case Analysis" }] : []),
    ...(isLoggedIn ? [] : [{ to: "/auth", label: "Sign In" }]),
  ];

  return (
    <>
      <nav className={`sticky top-0 z-50 border-b border-slate-200/80 backdrop-blur ${isScrolled ? "bg-white/95" : "bg-white/80"}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0F172A] text-white">
              <ScalesIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-wider text-[#0F172A]">LEX AI</div>
              <div className="text-[10px] uppercase tracking-widest text-slate-500">BNS Research</div>
            </div>
          </Link>

          <div className="hidden items-center gap-2 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${location.pathname === link.to ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}
              >
                {link.label}
              </Link>
            ))}
            {isLoggedIn && (
              <button
                onClick={logout}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
              >
                Sign Out
              </button>
            )}
          </div>

          <button
            className="rounded-full border border-slate-200 p-2 text-slate-700 md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className="block h-0.5 w-5 bg-current"></span>
            <span className="mt-1 block h-0.5 w-5 bg-current"></span>
            <span className="mt-1 block h-0.5 w-5 bg-current"></span>
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`rounded-2xl px-3 py-2 text-sm font-medium ${location.pathname === link.to ? "bg-slate-900 text-white" : "text-slate-600"}`}
                >
                  {link.label}
                </Link>
              ))}
              {isLoggedIn && (
                <button
                  onClick={logout}
                  className="rounded-2xl border border-slate-200 px-3 py-2 text-left text-sm font-medium text-slate-600"
                >
                  Sign Out
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      <main>{children}</main>
    </>
  );
}