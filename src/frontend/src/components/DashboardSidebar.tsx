import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Cloud,
  Files,
  HardDrive,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Shield,
  Upload,
  UserCircle2,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface SidebarNavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  key: string;
}

const userNavItems: SidebarNavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", key: "dashboard" },
  { icon: Files, label: "My Files", key: "files" },
  { icon: Upload, label: "Upload", key: "upload" },
  { icon: Settings, label: "Settings", key: "settings" },
];

const adminNavItems: SidebarNavItem[] = [
  { icon: LayoutDashboard, label: "Overview", key: "admin-panel" },
  { icon: Users, label: "Users", key: "admin-users" },
  { icon: Files, label: "All Files", key: "admin-files" },
  { icon: HardDrive, label: "Storage Stats", key: "admin-stats" },
];

interface DashboardSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onNavigate: (page: string) => void;
  isAdmin?: boolean;
  userEmail?: string;
}

export default function DashboardSidebar({
  activeTab,
  onTabChange,
  onNavigate,
  isAdmin = false,
  userEmail,
}: DashboardSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { identity, clear } = useInternetIdentity();

  const displayEmail =
    userEmail || localStorage.getItem("cs_user_email") || "User";
  const principal = identity?.getPrincipal().toString() || "";
  const shortPrincipal = principal
    ? `${principal.slice(0, 6)}...${principal.slice(-4)}`
    : "";

  // Determine if we're in admin panel mode
  const isAdminMode = activeTab.startsWith("admin");

  const handleLogout = () => {
    clear();
    onNavigate("landing");
  };

  const handleNavClick = (key: string) => {
    if (key.startsWith("admin-")) {
      // Map admin sidebar keys to the AdminPage tab keys
      const tabMap: Record<string, string> = {
        "admin-panel": "overview",
        "admin-users": "users",
        "admin-files": "files",
        "admin-stats": "stats",
      };
      onTabChange(tabMap[key] ?? "overview");
    } else {
      onTabChange(key);
    }
    setMobileOpen(false);
  };

  const navItems = isAdminMode ? adminNavItems : userNavItems;

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border/50">
        <button
          type="button"
          onClick={() => {
            setMobileOpen(false);
            onNavigate("landing");
          }}
          className="flex items-center gap-2.5 group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center glow-cyan-sm">
            <Cloud className="w-4 h-4 text-primary" />
          </div>
          <span className="font-display font-bold text-lg text-gradient-cyan tracking-tight">
            CloudSphere
          </span>
        </button>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-border/30">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/15">
          <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
            <UserCircle2 className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {displayEmail}
            </p>
            {shortPrincipal && (
              <p className="text-xs text-muted-foreground font-mono-custom truncate">
                {shortPrincipal}
              </p>
            )}
          </div>
          {isAdmin && (
            <Badge className="text-[10px] bg-amber-500/20 text-amber-400 border-amber-500/30 px-1.5 py-0 shrink-0">
              Admin
            </Badge>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {/* Switch between user/admin sections */}
        {isAdmin && (
          <div className="flex gap-1 mb-4 p-1 rounded-xl bg-secondary/30 border border-border/40">
            <button
              type="button"
              onClick={() => {
                onNavigate("dashboard");
                setMobileOpen(false);
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                !isAdminMode
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              User
            </button>
            <button
              type="button"
              onClick={() => {
                onNavigate("admin");
                setMobileOpen(false);
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                isAdminMode
                  ? "bg-amber-500/20 text-amber-400 shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Admin
            </button>
          </div>
        )}

        <p className="text-[10px] font-semibold tracking-wider text-muted-foreground/60 uppercase px-3 mb-2">
          {isAdminMode ? "Admin Menu" : "Main Menu"}
        </p>

        {navItems.map((item) => {
          // Determine if this nav item is active
          const isActive = isAdminMode
            ? activeTab === item.key.replace("admin-", "")
            : activeTab === item.key;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => handleNavClick(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                isActive
                  ? isAdminMode
                    ? "bg-amber-500/15 text-amber-400 border border-amber-500/25"
                    : "bg-primary/15 text-primary border border-primary/25 glow-cyan-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              <item.icon
                className={`w-4 h-4 ${isActive ? (isAdminMode ? "text-amber-400" : "text-primary") : ""}`}
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-border/30">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 font-medium transition-all duration-200 h-10"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-sidebar border-r border-sidebar-border min-h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile: Hamburger */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="fixed top-4 left-4 z-40 p-2.5 rounded-xl bg-sidebar border border-sidebar-border text-foreground/70 hover:text-foreground transition-colors shadow-card"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile overlay */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
                onClick={() => setMobileOpen(false)}
              />
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="fixed left-0 top-0 bottom-0 z-50 w-64 bg-sidebar border-r border-sidebar-border"
              >
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                </button>
                {sidebarContent}
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
