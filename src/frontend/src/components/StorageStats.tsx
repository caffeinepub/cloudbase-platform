import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Files, HardDrive, TrendingUp, Upload } from "lucide-react";
import { motion } from "motion/react";
import type { UserRecord } from "../backend.d";

export const STORAGE_LIMIT_BYTES = 15 * 1024 * 1024 * 1024; // 15 GB

export function formatBytes(bytes: bigint | number): string {
  const n = typeof bytes === "bigint" ? Number(bytes) : bytes;
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(2)} MB`;
  return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface StorageStatsProps {
  userProfile: UserRecord | null | undefined;
  fileCount: number;
  isLoading: boolean;
  onUploadClick?: () => void;
}

export default function StorageStats({
  userProfile,
  fileCount,
  isLoading,
  onUploadClick,
}: StorageStatsProps) {
  const usedBytes = userProfile ? Number(userProfile.usedStorage) : 0;
  const limitBytes = userProfile
    ? Number(userProfile.storageLimit)
    : STORAGE_LIMIT_BYTES;
  const remainingBytes = Math.max(limitBytes - usedBytes, 0);

  const storagePercent =
    limitBytes > 0 ? Math.min((usedBytes / limitBytes) * 100, 100) : 0;

  const progressColor =
    storagePercent >= 90
      ? "bg-destructive"
      : storagePercent >= 70
        ? "bg-amber-500"
        : "bg-primary";

  const stats = [
    {
      icon: Files,
      label: "Total Files",
      value: isLoading ? null : String(fileCount),
      description: "Files uploaded",
      color: "text-primary",
      bgColor: "bg-primary/15",
      borderColor: "border-primary/25",
    },
    {
      icon: HardDrive,
      label: "Storage Used",
      value: isLoading ? null : formatBytes(usedBytes),
      description: `of ${formatBytes(limitBytes)} total`,
      color: "text-cyan-400",
      bgColor: "bg-cyan-400/10",
      borderColor: "border-cyan-400/20",
    },
    {
      icon: TrendingUp,
      label: "Remaining",
      value: isLoading ? null : formatBytes(remainingBytes),
      description: "Available capacity",
      color: "text-emerald-400",
      bgColor: "bg-emerald-400/10",
      borderColor: "border-emerald-400/20",
    },
    {
      icon: HardDrive,
      label: "Storage Limit",
      value: isLoading ? null : formatBytes(limitBytes),
      description: "Per-account quota",
      color: "text-violet-400",
      bgColor: "bg-violet-400/10",
      borderColor: "border-violet-400/20",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
          >
            <Card className="card-glass border-border/50 hover:border-primary/25 transition-all duration-300 shadow-card">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl ${stat.bgColor} border ${stat.borderColor} flex items-center justify-center`}
                  >
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-7 w-24 bg-secondary/40" />
                    <Skeleton className="h-3 w-32 bg-secondary/30" />
                  </div>
                ) : (
                  <>
                    <p className="font-display font-bold text-xl text-foreground leading-tight">
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.description}
                    </p>
                  </>
                )}
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mt-2">
                  {stat.label}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Storage bar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.36 }}
      >
        <Card className="card-glass border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center">
                  <HardDrive className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Storage Usage
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isLoading
                      ? "Calculating..."
                      : `${formatBytes(usedBytes)} / ${formatBytes(limitBytes)}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-sm font-mono-custom font-semibold ${
                    storagePercent >= 90
                      ? "text-destructive"
                      : storagePercent >= 70
                        ? "text-amber-400"
                        : "text-primary"
                  }`}
                >
                  {isLoading ? "—" : `${storagePercent.toFixed(1)}%`}
                </span>
                {onUploadClick && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onUploadClick}
                    className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 h-7 px-2"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload
                  </Button>
                )}
              </div>
            </div>
            {isLoading ? (
              <Skeleton className="h-3 w-full rounded-full bg-secondary/40" />
            ) : (
              <div className="space-y-1.5">
                <div className="h-3 rounded-full bg-secondary/40 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${progressColor}`}
                    style={{ width: `${storagePercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground/60">
                  <span>0 GB</span>
                  <span>{formatBytes(limitBytes)} limit</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
