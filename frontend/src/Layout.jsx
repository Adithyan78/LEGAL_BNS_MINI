import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

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
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-lg text-amber-700">
              ⚖
            </div>
            <div>
              <div className="text-lg font-semibold tracking-[0.2em] text-slate-900">LEX AI</div>
              <div className="text-xs uppercase tracking-[0.25em] text-slate-500">BNS Research</div>
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