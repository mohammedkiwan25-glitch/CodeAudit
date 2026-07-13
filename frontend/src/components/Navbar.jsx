import { Link, useLocation } from "react-router";
import { BarChart3Icon, BookOpenIcon, CalendarDaysIcon, LayoutDashboardIcon, ShieldCheckIcon, SparklesIcon } from "lucide-react";
import { UserButton } from "@clerk/clerk-react";
import { useCurrentUser } from "../hooks/useCurrentUser";

function Navbar() {
  const location = useLocation();
  const { data: currentUserData } = useCurrentUser();

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);
  const links = [
    { to: "/dashboard", label: "Dashboard", icon: <LayoutDashboardIcon className="size-4" /> },
    { to: "/interviews", label: "Interviews", icon: <CalendarDaysIcon className="size-4" /> },
    { to: "/problems", label: "Problems", icon: <BookOpenIcon className="size-4" /> },
    { to: "/analytics", label: "Analytics", icon: <BarChart3Icon className="size-4" /> },
    ...(currentUserData?.user?.role === "supervisor"
      ? [{ to: "/supervisor", label: "Supervisor", icon: <ShieldCheckIcon className="size-4" /> }]
      : []),
  ];

  return (
    <nav className="bg-base-100/80 backdrop-blur-md border-b border-primary/20 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-3 py-3 sm:p-4 flex items-center justify-between gap-3">
        {/* LOGO */}
        <Link
          to="/"
          className="group flex items-center gap-2 sm:gap-3 hover:scale-105 transition-transform duration-200 min-w-0"
        >
          <div className="size-9 sm:size-10 rounded-xl bg-gradient-to-r from-primary via-secondary to-accent flex items-center justify-center shadow-lg shrink-0">
            <SparklesIcon className="size-5 sm:size-6 text-white" />
          </div>

          <div className="flex flex-col min-w-0">
            <span className="font-black text-lg sm:text-xl bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent font-mono tracking-wider truncate">
              CodeAudit
            </span>
            <span className="text-xs text-base-content/60 font-medium -mt-1 hidden sm:block">
              Code Together
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-1 shrink-0">
          {links.map(({ to, label, icon }) => (
            <Link key={to} to={to} title={label} className={`px-2.5 lg:px-3 py-2.5 rounded-lg transition-all duration-200 ${isActive(to) ? "bg-primary text-primary-content" : "hover:bg-base-200 text-base-content/70 hover:text-base-content"}`}>
              <div className="flex items-center gap-2">{icon}<span className="font-medium hidden lg:inline">{label}</span></div>
            </Link>
          ))}

          <div className="ml-1 sm:ml-4 mt-1 sm:mt-2">
            <UserButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
export default Navbar;
