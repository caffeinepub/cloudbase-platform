import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  Files,
  HardDrive,
  LayoutDashboard,
  Loader2,
  RefreshCw,
  Shield,
  UserCheck,
  UserMinus,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { UserRecord } from "../backend.d";
import DashboardSidebar from "../components/DashboardSidebar";
import FilesTable from "../components/FilesTable";
import { formatBytes } from "../components/StorageStats";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAllFiles,
  useAllUsers,
  useBlockUser,
  useStorageStats,
  useUserProfile,
} from "../hooks/useQueries";

interface AdminPageProps {
  onNavigate: (page: string) => void;
}

type AdminTab = "overview" | "users" | "files" | "stats";

function StorageBar({
  usedBytes,
  limitBytes,
}: {
  usedBytes: number;
  limitBytes: number;
}) {
  const pct =
    limitBytes > 0 ? Math.min((usedBytes / limitBytes) * 100, 100) : 0;
  const color =
    pct >= 90 ? "bg-destructive" : pct >= 70 ? "bg-amber-500" : "bg-primary";
  return (
    <div className="w-full">
      <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
        <span>{formatBytes(usedBytes)}</span>
        <span>{pct.toFixed(0)}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-secondary/50 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function AdminPage({ onNavigate }: AdminPageProps) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [blockConfirm, setBlockConfirm] = useState<{
    user: UserRecord;
    action: "block" | "unblock";
  } | null>(null);

  const { identity, isInitializing } = useInternetIdentity();
  const { actor, isFetching: isActorFetching } = useActor();

  const {
    data: allFiles,
    isLoading: filesLoading,
    isFetching: filesRefetching,
    refetch: refetchFiles,
  } = useAllFiles();

  const {
    data: allUsers,
    isLoading: usersLoading,
    refetch: refetchUsers,
  } = useAllUsers();

  const { data: storageStats, refetch: refetchStats } = useStorageStats();
  const { data: userProfile } = useUserProfile();
  const blockUser = useBlockUser();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isInitializing && !identity) {
      onNavigate("login");
    }
  }, [identity, isInitializing, onNavigate]);

  // Check admin status
  useEffect(() => {
    if (actor && !isActorFetching) {
      setCheckingAdmin(true);
      actor
        .isCallerAdmin()
        .then((result) => {
          setIsAdmin(result);
          setCheckingAdmin(false);
        })
        .catch(() => {
          setIsAdmin(false);
          setCheckingAdmin(false);
        });
    }
  }, [actor, isActorFetching]);

  const handleRefresh = () => {
    refetchFiles();
    refetchUsers();
    refetchStats();
  };

  const handleBlockToggle = (user: UserRecord) => {
    setBlockConfirm({
      user,
      action: user.isBlocked ? "unblock" : "block",
    });
  };

  const handleBlockConfirm = () => {
    if (!blockConfirm) return;
    blockUser.mutate(
      {
        userId: blockConfirm.user.userId,
        blocked: blockConfirm.action === "block",
      },
      {
        onSuccess: () => {
          const msg =
            blockConfirm.action === "block"
              ? `User "${blockConfirm.user.email}" blocked`
              : `User "${blockConfirm.user.email}" unblocked`;
          toast.success(msg);
          setBlockConfirm(null);
          refetchUsers();
        },
        onError: (err) => {
          toast.error(`Failed: ${err.message}`);
          setBlockConfirm(null);
        },
      },
    );
  };

  // Computed stats
  const totalStorageUsed = storageStats
    ? Number(storageStats.totalStorageUsed)
    : allUsers
      ? allUsers.reduce((acc, u) => acc + Number(u.usedStorage), 0)
      : 0;

  const totalFiles = storageStats
    ? Number(storageStats.totalFiles)
    : (allFiles?.length ?? 0);

  const totalUsers = storageStats
    ? Number(storageStats.totalUsers)
    : (allUsers?.length ?? 0);

  const userEmail =
    userProfile?.email || localStorage.getItem("cs_user_email") || "Admin";

  if (isInitializing || checkingAdmin || isActorFetching) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span>Verifying admin access…</span>
        </div>
      </div>
    );
  }

  if (!identity) return null;

  if (isAdmin === false) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="card-glass rounded-2xl p-10 max-w-sm w-full text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-destructive/15 border border-destructive/25 flex items-center justify-center mx-auto mb-5">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="font-display font-bold text-2xl text-foreground mb-2">
            Access Denied
          </h1>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            You don't have admin privileges to access this panel.
          </p>
          <Button
            onClick={() => onNavigate("dashboard")}
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
          >
            Back to Dashboard
          </Button>
        </motion.div>
      </div>
    );
  }

  const adminNavItems: {
    key: AdminTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    { key: "users", label: "Users", icon: Users },
    { key: "files", label: "All Files", icon: Files },
    { key: "stats", label: "Storage Stats", icon: HardDrive },
  ];

  const adminStats = [
    {
      icon: Users,
      label: "Total Users",
      value: String(totalUsers),
      description: "Registered accounts",
      color: "text-emerald-400",
      bgColor: "bg-emerald-400/10",
      borderColor: "border-emerald-400/20",
    },
    {
      icon: Files,
      label: "Total Files",
      value: String(totalFiles),
      description: "Files in system",
      color: "text-primary",
      bgColor: "bg-primary/15",
      borderColor: "border-primary/25",
    },
    {
      icon: HardDrive,
      label: "Total Storage",
      value: formatBytes(totalStorageUsed),
      description: "Storage consumed",
      color: "text-cyan-400",
      bgColor: "bg-cyan-400/10",
      borderColor: "border-cyan-400/20",
    },
    {
      icon: Shield,
      label: "Admin Status",
      value: "Active",
      description: "System access level",
      color: "text-amber-400",
      bgColor: "bg-amber-400/10",
      borderColor: "border-amber-400/20",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar — admin variant */}
      <DashboardSidebar
        activeTab="admin-panel"
        onTabChange={() => {}}
        onNavigate={onNavigate}
        isAdmin={true}
        userEmail={userEmail}
      />

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {/* Top header */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50 px-6 py-4 flex items-center justify-between">
          <div className="ml-12 lg:ml-0">
            <div className="flex items-center gap-2">
              <h1 className="font-display font-bold text-xl text-foreground">
                Admin Panel
              </h1>
              <Badge className="text-[10px] bg-amber-500/20 text-amber-400 border-amber-500/30">
                Admin
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              System-wide overview — manage users and files
            </p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRefresh}
            disabled={filesRefetching}
            className="text-muted-foreground hover:text-foreground h-8 px-3 gap-1.5"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${filesRefetching ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline text-xs">Refresh</span>
          </Button>
        </header>

        <div className="p-6">
          {/* Tab switcher */}
          <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1">
            {adminNavItems.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveTab(item.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  activeTab === item.key
                    ? "bg-primary/15 text-primary border border-primary/25"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </div>

          {/* Overview tab */}
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="space-y-6"
            >
              {/* Stats cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {adminStats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.07 }}
                  >
                    <Card className="card-glass border-border/50 shadow-card">
                      <CardContent className="p-5">
                        <div
                          className={`w-10 h-10 rounded-xl ${stat.bgColor} border ${stat.borderColor} flex items-center justify-center mb-3`}
                        >
                          <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <p className="font-display font-bold text-xl text-foreground">
                          {stat.value}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {stat.description}
                        </p>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50 mt-2">
                          {stat.label}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Quick shortcuts */}
              <div className="grid sm:grid-cols-2 gap-4">
                <Card
                  className="card-glass border-border/50 cursor-pointer hover:border-primary/30 transition-all duration-200"
                  onClick={() => setActiveTab("users")}
                >
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center shrink-0">
                      <Users className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-display font-semibold text-foreground">
                        Manage Users
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {usersLoading
                          ? "Loading…"
                          : `${totalUsers} registered user${totalUsers !== 1 ? "s" : ""}`}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card
                  className="card-glass border-border/50 cursor-pointer hover:border-primary/30 transition-all duration-200"
                  onClick={() => setActiveTab("files")}
                >
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
                      <Files className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-display font-semibold text-foreground">
                        All System Files
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {filesLoading
                          ? "Loading…"
                          : `${totalFiles} file${totalFiles !== 1 ? "s" : ""} · ${formatBytes(totalStorageUsed)}`}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {/* Users tab */}
          {activeTab === "users" && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <Card className="card-glass border-border/50">
                <CardHeader className="px-5 pt-5 pb-3">
                  <CardTitle className="font-display font-semibold text-base text-foreground flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    All Users
                    {allUsers && (
                      <span className="text-xs font-mono-custom text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                        {allUsers.length}
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  {usersLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <Skeleton
                          key={i}
                          className="h-16 rounded-xl bg-secondary/30"
                        />
                      ))}
                    </div>
                  ) : !allUsers || allUsers.length === 0 ? (
                    <div className="flex flex-col items-center py-12 text-center">
                      <Users className="w-10 h-10 text-muted-foreground/30 mb-3" />
                      <p className="text-sm text-muted-foreground">
                        No users registered yet
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-border/50 hover:bg-transparent">
                            <TableHead className="text-muted-foreground/70 text-xs font-semibold uppercase tracking-wider">
                              Email / Principal
                            </TableHead>
                            <TableHead className="text-muted-foreground/70 text-xs font-semibold uppercase tracking-wider">
                              Role
                            </TableHead>
                            <TableHead className="text-muted-foreground/70 text-xs font-semibold uppercase tracking-wider min-w-[180px]">
                              Storage Used
                            </TableHead>
                            <TableHead className="text-muted-foreground/70 text-xs font-semibold uppercase tracking-wider">
                              Status
                            </TableHead>
                            <TableHead className="text-muted-foreground/70 text-xs font-semibold uppercase tracking-wider text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {allUsers.map((user, i) => {
                            const usedBytes = Number(user.usedStorage);
                            const limitBytes =
                              Number(user.storageLimit) ||
                              15 * 1024 * 1024 * 1024;
                            return (
                              <motion.tr
                                key={user.userId.toString()}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.04 }}
                                className="border-border/40 hover:bg-secondary/20 transition-colors"
                              >
                                <TableCell className="py-3">
                                  <p className="text-sm font-medium text-foreground">
                                    {user.email || "—"}
                                  </p>
                                  <p className="text-xs text-muted-foreground font-mono-custom truncate max-w-[180px]">
                                    {user.userId.toString().slice(0, 20)}…
                                  </p>
                                </TableCell>
                                <TableCell className="py-3">
                                  <Badge
                                    variant="outline"
                                    className={
                                      user.role === "admin"
                                        ? "bg-amber-500/15 text-amber-400 border-amber-500/25 text-xs"
                                        : "bg-primary/10 text-primary border-primary/20 text-xs"
                                    }
                                  >
                                    {user.role}
                                  </Badge>
                                </TableCell>
                                <TableCell className="py-3">
                                  <StorageBar
                                    usedBytes={usedBytes}
                                    limitBytes={limitBytes}
                                  />
                                </TableCell>
                                <TableCell className="py-3">
                                  <Badge
                                    variant="outline"
                                    className={
                                      user.isBlocked
                                        ? "bg-destructive/15 text-destructive border-destructive/25 text-xs"
                                        : "bg-emerald-400/10 text-emerald-400 border-emerald-400/20 text-xs"
                                    }
                                  >
                                    {user.isBlocked ? "Blocked" : "Active"}
                                  </Badge>
                                </TableCell>
                                <TableCell className="py-3 text-right">
                                  {user.role !== "admin" && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleBlockToggle(user)}
                                      disabled={blockUser.isPending}
                                      className={`h-7 px-2.5 text-xs gap-1.5 ${
                                        user.isBlocked
                                          ? "text-emerald-400 hover:bg-emerald-400/10"
                                          : "text-destructive hover:bg-destructive/10"
                                      }`}
                                    >
                                      {user.isBlocked ? (
                                        <>
                                          <UserCheck className="w-3.5 h-3.5" />
                                          Unblock
                                        </>
                                      ) : (
                                        <>
                                          <UserMinus className="w-3.5 h-3.5" />
                                          Block
                                        </>
                                      )}
                                    </Button>
                                  )}
                                </TableCell>
                              </motion.tr>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Files tab */}
          {activeTab === "files" && (
            <motion.div
              key="files"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <Card className="card-glass border-border/50">
                <CardHeader className="px-5 pt-5 pb-3">
                  <CardTitle className="font-display font-semibold text-base text-foreground flex items-center gap-2">
                    <Files className="w-4 h-4 text-primary" />
                    All System Files
                    {allFiles && allFiles.length > 0 && (
                      <span className="text-xs font-mono-custom text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                        {allFiles.length}
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <FilesTable
                    files={allFiles}
                    isLoading={filesLoading}
                    showOwner={true}
                    isAdminMode={true}
                    onRefresh={handleRefresh}
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Stats tab */}
          {activeTab === "stats" && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="space-y-4"
            >
              <Card className="card-glass border-border/50">
                <CardHeader className="px-5 pt-5 pb-3">
                  <CardTitle className="font-display font-semibold text-base text-foreground flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-primary" />
                    Server Storage Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5 space-y-6">
                  {/* Total storage */}
                  <div className="p-4 rounded-xl bg-secondary/20 border border-border/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">
                        Total Storage Used
                      </p>
                      <span className="text-sm font-mono-custom text-primary font-bold">
                        {formatBytes(totalStorageUsed)}
                      </span>
                    </div>
                    <div className="h-2.5 rounded-full bg-secondary/60 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-700"
                        style={{
                          width: `${Math.min((totalStorageUsed / (Number(totalUsers || 1) * 15 * 1024 * 1024 * 1024)) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Across {totalUsers} user{totalUsers !== 1 ? "s" : ""} ·{" "}
                      {totalFiles} file{totalFiles !== 1 ? "s" : ""}
                    </p>
                  </div>

                  {/* Per-user breakdown */}
                  {allUsers && allUsers.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 mb-3">
                        Per-User Breakdown
                      </p>
                      <div className="space-y-3">
                        {allUsers.map((user) => {
                          const used = Number(user.usedStorage);
                          const limit =
                            Number(user.storageLimit) ||
                            15 * 1024 * 1024 * 1024;
                          return (
                            <div
                              key={user.userId.toString()}
                              className="p-3 rounded-xl bg-secondary/20 border border-border/40"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-foreground truncate max-w-[200px]">
                                  {user.email ||
                                    `${user.userId.toString().slice(0, 16)}…`}
                                </p>
                                <span className="text-xs text-muted-foreground font-mono-custom">
                                  {formatBytes(used)} / {formatBytes(limit)}
                                </span>
                              </div>
                              <StorageBar usedBytes={used} limitBytes={limit} />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </main>

      {/* Block/Unblock confirm dialog */}
      <Dialog
        open={!!blockConfirm}
        onOpenChange={(open) => !open && setBlockConfirm(null)}
      >
        <DialogContent className="card-glass border-border/60 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-foreground">
              {blockConfirm?.action === "block"
                ? "Block User?"
                : "Unblock User?"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {blockConfirm?.action === "block"
                ? `This will prevent "${blockConfirm?.user.email}" from accessing their account.`
                : `This will restore access for "${blockConfirm?.user.email}".`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setBlockConfirm(null)}
              className="border-border/60"
            >
              Cancel
            </Button>
            <Button
              variant={
                blockConfirm?.action === "block" ? "destructive" : "default"
              }
              onClick={handleBlockConfirm}
              disabled={blockUser.isPending}
              className="gap-2"
            >
              {blockUser.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Processing…
                </>
              ) : blockConfirm?.action === "block" ? (
                <>
                  <UserMinus className="w-3.5 h-3.5" />
                  Block User
                </>
              ) : (
                <>
                  <UserCheck className="w-3.5 h-3.5" />
                  Unblock User
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
