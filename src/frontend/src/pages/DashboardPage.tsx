import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Files, Loader2, RefreshCw, Upload } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import DashboardSidebar from "../components/DashboardSidebar";
import FilesTable from "../components/FilesTable";
import StorageStats from "../components/StorageStats";
import UploadZone from "../components/UploadZone";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useListFiles, useUserProfile } from "../hooks/useQueries";

interface DashboardPageProps {
  onNavigate: (page: string) => void;
}

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAutoRegistering, setIsAutoRegistering] = useState(false);
  const didAutoRegister = useRef(false);

  const { identity, isInitializing } = useInternetIdentity();
  const { actor, isFetching: isActorFetching } = useActor();

  const {
    data: files,
    isLoading: filesLoading,
    isFetching: filesRefetching,
    refetch: refetchFiles,
  } = useListFiles();

  const {
    data: userProfile,
    isLoading: profileLoading,
    refetch: refetchProfile,
  } = useUserProfile();

  const isLoading =
    filesLoading || profileLoading || isActorFetching || isAutoRegistering;

  // Redirect if not authenticated
  useEffect(() => {
    if (!isInitializing && !identity) {
      onNavigate("login");
    }
  }, [identity, isInitializing, onNavigate]);

  // Auto-register: if actor is ready and profile is null (not loading), ensure user is registered
  useEffect(() => {
    if (
      !actor ||
      isActorFetching ||
      profileLoading ||
      didAutoRegister.current ||
      (userProfile !== null && userProfile !== undefined)
    )
      return;

    // userProfile is null/undefined after loading finished — user not in DB
    if (userProfile === null || userProfile === undefined) {
      const savedEmail = localStorage.getItem("cs_user_email");
      if (!savedEmail) return;

      didAutoRegister.current = true;
      setIsAutoRegistering(true);
      console.log(
        "[CloudSphere] Dashboard: auto-registering unregistered session for",
        savedEmail,
      );

      actor
        .registerUser(savedEmail)
        .then((userRecord) => {
          console.log(
            "[CloudSphere] Dashboard: auto-registration success, userId:",
            userRecord.userId.toString(),
          );
          localStorage.setItem("cs_user_email", userRecord.email || savedEmail);
          setIsAutoRegistering(false);
          refetchProfile();
          refetchFiles();
        })
        .catch((err: unknown) => {
          const msg = err instanceof Error ? err.message : String(err);
          console.error(
            "[CloudSphere] Dashboard: auto-registration error:",
            msg,
          );
          setIsAutoRegistering(false);
          // If already registered, just refetch
          if (
            msg.toLowerCase().includes("already") ||
            msg.toLowerCase().includes("exist")
          ) {
            refetchProfile();
            refetchFiles();
          }
        });
    }
  }, [
    actor,
    isActorFetching,
    profileLoading,
    userProfile,
    refetchProfile,
    refetchFiles,
  ]);

  // Check admin status
  useEffect(() => {
    if (actor && !isActorFetching) {
      actor
        .isCallerAdmin()
        .then(setIsAdmin)
        .catch(() => setIsAdmin(false));
    }
  }, [actor, isActorFetching]);

  const handleRefresh = () => {
    refetchFiles();
    refetchProfile();
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span>Loading dashboard…</span>
        </div>
      </div>
    );
  }

  if (!identity) return null;

  const userEmail =
    userProfile?.email || localStorage.getItem("cs_user_email") || "User";

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <DashboardSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onNavigate={onNavigate}
        isAdmin={isAdmin}
        userEmail={userEmail}
      />

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {/* Top header */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50 px-6 py-4 flex items-center justify-between">
          <div className="ml-12 lg:ml-0">
            <h1 className="font-display font-bold text-xl text-foreground">
              {activeTab === "dashboard" && "Dashboard"}
              {activeTab === "files" && "My Files"}
              {activeTab === "upload" && "Upload Files"}
              {activeTab === "settings" && "Settings"}
            </h1>
            <p className="text-xs text-muted-foreground">
              Welcome back, {userEmail}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRefresh}
              disabled={filesRefetching}
              className="text-muted-foreground hover:text-foreground h-8 px-2 gap-1.5"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${filesRefetching ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline text-xs">Refresh</span>
            </Button>
            <Button
              size="sm"
              onClick={() => setActiveTab("upload")}
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 h-8 text-xs font-semibold btn-primary-glow"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload
            </Button>
          </div>
        </header>

        {/* Page content */}
        <div className="p-6">
          {/* Dashboard Overview */}
          {activeTab === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="space-y-6"
            >
              <StorageStats
                userProfile={userProfile}
                fileCount={files?.length ?? 0}
                isLoading={isLoading}
                onUploadClick={() => setActiveTab("upload")}
              />

              {/* Recent files */}
              <Card className="card-glass border-border/50">
                <CardHeader className="pb-3 px-5 pt-5">
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-display font-semibold text-base text-foreground flex items-center gap-2">
                      <Files className="w-4 h-4 text-primary" />
                      Recent Files
                      {files && files.length > 0 && (
                        <span className="text-xs font-mono-custom text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                          {files.length}
                        </span>
                      )}
                    </CardTitle>
                    <button
                      type="button"
                      onClick={() => setActiveTab("files")}
                      className="text-xs text-primary hover:text-primary/80 transition-colors font-medium"
                    >
                      View all →
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  {isLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <Skeleton
                          key={i}
                          className="h-14 rounded-xl bg-secondary/30"
                        />
                      ))}
                    </div>
                  ) : (
                    <FilesTable
                      files={files?.slice(0, 5)}
                      isLoading={false}
                      onUploadClick={() => setActiveTab("upload")}
                      onRefresh={handleRefresh}
                    />
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* My Files */}
          {activeTab === "files" && (
            <motion.div
              key="files"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <Card className="card-glass border-border/50">
                <CardHeader className="pb-3 px-5 pt-5">
                  <CardTitle className="font-display font-semibold text-base text-foreground flex items-center gap-2">
                    <Files className="w-4 h-4 text-primary" />
                    All Files
                    {files && files.length > 0 && (
                      <span className="text-xs font-mono-custom text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                        {files.length}
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <FilesTable
                    files={files}
                    isLoading={filesLoading}
                    onUploadClick={() => setActiveTab("upload")}
                    onRefresh={handleRefresh}
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Upload */}
          {activeTab === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="max-w-2xl"
            >
              <Card className="card-glass border-border/50">
                <CardHeader className="pb-3 px-5 pt-5">
                  <CardTitle className="font-display font-semibold text-base text-foreground flex items-center gap-2">
                    <Upload className="w-4 h-4 text-primary" />
                    Upload Files
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Files are encrypted and stored securely. Max 2 GB per file —
                    PDF, DOCX, JPG, PNG, MP4.
                  </p>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <UploadZone
                    onSuccess={handleRefresh}
                    userProfile={userProfile}
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Settings */}
          {activeTab === "settings" && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="max-w-xl"
            >
              <Card className="card-glass border-border/50">
                <CardHeader className="px-5 pt-5 pb-3">
                  <CardTitle className="font-display font-semibold text-base text-foreground">
                    Account Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5 space-y-5">
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                      Identity
                    </p>
                    <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                      <p className="text-xs text-muted-foreground mb-1">
                        Principal ID
                      </p>
                      <p className="text-sm font-mono-custom text-foreground break-all">
                        {identity?.getPrincipal().toString()}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                      Email
                    </p>
                    <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                      <p className="text-sm text-foreground">{userEmail}</p>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                      Storage Plan
                    </p>
                    <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-foreground font-medium">
                          Free Plan
                        </p>
                        <span className="text-xs bg-primary/15 text-primary border border-primary/25 px-2 py-0.5 rounded-full font-medium">
                          15 GB
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        15 GB secure cloud storage per account.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                      Role
                    </p>
                    <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                      <p className="text-sm text-foreground capitalize">
                        {userProfile?.role ?? "user"}
                      </p>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="pt-2">
                      <Button
                        variant="outline"
                        onClick={() => onNavigate("admin")}
                        className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10 gap-2"
                      >
                        Go to Admin Panel →
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
