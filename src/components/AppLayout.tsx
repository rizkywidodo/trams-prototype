import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  ClipboardCheck,
  CalendarCheck,
  FileText,
  Megaphone,
  GraduationCap,
  Settings,
  LogOut,
  Search,
  Bell,
  ChevronDown,
  ChevronRight,
  Shield,
  BookOpen,
  Store,
} from "lucide-react";

const DAILY_CHECK_ITEMS = [
  { to: "/daily-check/patrol", label: "Form Patrol", icon: Shield },
  { to: "/daily-check/logbook", label: "Logbook", icon: BookOpen },
  { to: "/daily-check/tenant", label: "Daily Check Tenant", icon: Store },
];

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, disabled: true },
  { to: "/daily-check", label: "Daily Check", icon: ClipboardCheck, expandable: true },
  { to: "/scheduling", label: "Scheduling", icon: CalendarCheck },
  { to: "/evaluation", label: "Evaluation", icon: FileText, disabled: true },
  { to: "/broadcast", label: "Broadcast", icon: Megaphone, disabled: true },
  { to: "/training", label: "Training & Simulation", icon: GraduationCap, disabled: true },
  { to: "/master-data", label: "Master Data", icon: Settings, disabled: true },
];

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isDailyCheckActive = location.pathname.startsWith("/daily-check") || location.pathname === "/" || location.pathname.startsWith("/station/");
  const [dailyCheckOpen, setDailyCheckOpen] = useState(isDailyCheckActive);

  const getPageTitle = () => {
    if (location.pathname.startsWith("/daily-check/patrol")) return "Form Patrol";
    if (location.pathname.startsWith("/daily-check/logbook")) return "Logbook";
    if (location.pathname.startsWith("/station/")) return "Daily Check Tenant";
    if (location.pathname.startsWith("/daily-check/tenant") || location.pathname === "/") return "Daily Check Tenant";
    return "Daily Check";
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-56 bg-card border-r border-border flex flex-col shrink-0 sticky top-0 h-screen">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-extrabold text-sm tracking-tight">MJ</span>
            </div>
            <div>
              <p className="font-bold text-sm text-card-foreground tracking-tight">TRAMS</p>
              <p className="text-[10px] text-muted-foreground leading-none">MRT Jakarta</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;

            // Disabled items
            if (item.disabled) {
              return (
                <div
                  key={item.to}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground/50 cursor-not-allowed text-sm"
                >
                  <Icon className="h-[18px] w-[18px]" />
                  <span>{item.label}</span>
                </div>
              );
            }

            // Expandable Daily Check
            if (item.expandable) {
              return (
                <div key={item.to}>
                  <button
                    onClick={() => setDailyCheckOpen(!dailyCheckOpen)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full ${
                      isDailyCheckActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-card-foreground"
                    }`}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {dailyCheckOpen ? (
                      <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 opacity-70" />
                    )}
                  </button>

                  {/* Sub items */}
                  {dailyCheckOpen && (
                    <div className="mt-0.5 ml-4 pl-3 border-l-2 border-border space-y-0.5">
                      {DAILY_CHECK_ITEMS.map((sub) => {
                        const SubIcon = sub.icon;
                        const isSubActive =
                          sub.to === "/daily-check/tenant"
                            ? location.pathname === "/daily-check/tenant" ||
                              location.pathname === "/" ||
                              location.pathname.startsWith("/station/")
                            : location.pathname.startsWith(sub.to);

                        return (
                          <NavLink
                            key={sub.to}
                            to={sub.to}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium transition-colors ${
                              isSubActive
                                ? "bg-accent/15 text-accent"
                                : "text-muted-foreground hover:bg-muted hover:text-card-foreground"
                            }`}
                          >
                            <SubIcon className="h-[15px] w-[15px]" />
                            <span>{sub.label}</span>
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // Normal items
            const isActive = location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-card-foreground"
                }`}
              >
                <Icon className="h-[18px] w-[18px]" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Sign Out */}
        <div className="px-3 pb-4">
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-card-foreground transition-colors w-full">
            <LogOut className="h-[18px] w-[18px]" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 border-b border-border bg-card sticky top-0 z-10 flex items-center justify-between px-6 shrink-0">
          <h1 className="text-lg font-bold text-card-foreground">{getPageTitle()}</h1>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search here..."
                className="w-56 rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
            </button>

            <button className="flex items-center gap-2.5 hover:bg-muted rounded-lg px-2 py-1.5 transition-colors">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">A</span>
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-semibold text-card-foreground leading-tight">Admin</p>
                <p className="text-[11px] text-muted-foreground leading-tight">Officer</p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
