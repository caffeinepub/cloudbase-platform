import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Archive,
  Download,
  File,
  FileText,
  Film,
  ImageIcon,
  Loader2,
  Music,
  Trash2,
  Upload,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { FileRecord } from "../backend.d";
import { useAdminDeleteFile, useDeleteFile } from "../hooks/useQueries";
import { formatBytes, formatDate } from "./StorageStats";

export function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return ImageIcon;
  if (mimeType.startsWith("video/")) return Film;
  if (mimeType.startsWith("audio/")) return Music;
  if (
    mimeType.startsWith("text/") ||
    mimeType.includes("document") ||
    mimeType.includes("pdf") ||
    mimeType.includes("word")
  )
    return FileText;
  if (
    mimeType.includes("zip") ||
    mimeType.includes("archive") ||
    mimeType.includes("tar")
  )
    return Archive;
  return File;
}

function getFileBadgeColor(mimeType: string): string {
  if (mimeType.startsWith("image/"))
    return "bg-violet-400/15 text-violet-300 border-violet-400/25";
  if (mimeType.startsWith("video/"))
    return "bg-rose-400/15 text-rose-300 border-rose-400/25";
  if (mimeType.startsWith("audio/"))
    return "bg-amber-400/15 text-amber-300 border-amber-400/25";
  if (mimeType.includes("pdf"))
    return "bg-red-400/15 text-red-300 border-red-400/25";
  if (mimeType.startsWith("text/"))
    return "bg-emerald-400/15 text-emerald-300 border-emerald-400/25";
  if (mimeType.includes("word") || mimeType.includes("document"))
    return "bg-blue-400/15 text-blue-300 border-blue-400/25";
  return "bg-primary/15 text-primary border-primary/25";
}

function getFileTypeLabel(mimeType: string): string {
  if (mimeType.includes("pdf")) return "PDF";
  if (mimeType.includes("word") || mimeType.includes("officedocument"))
    return "DOCX";
  if (mimeType === "image/jpeg" || mimeType === "image/jpg") return "JPG";
  if (mimeType === "image/png") return "PNG";
  if (mimeType === "video/mp4") return "MP4";
  const parts = mimeType.split("/");
  if (parts.length > 1) {
    const sub = parts[1].split(";")[0].toUpperCase();
    return sub.length > 8 ? sub.slice(0, 8) : sub;
  }
  return mimeType.toUpperCase().slice(0, 8);
}

function truncatePrincipal(principal: string): string {
  if (principal.length <= 16) return principal;
  return `${principal.slice(0, 8)}…${principal.slice(-6)}`;
}

interface FilesTableProps {
  files: FileRecord[] | undefined;
  isLoading: boolean;
  onUploadClick?: () => void;
  showOwner?: boolean;
  isAdminMode?: boolean;
  onRefresh?: () => void;
}

export default function FilesTable({
  files,
  isLoading,
  onUploadClick,
  showOwner = false,
  isAdminMode = false,
  onRefresh,
}: FilesTableProps) {
  const [confirmFile, setConfirmFile] = useState<FileRecord | null>(null);
  const deleteFile = useDeleteFile();
  const adminDeleteFile = useAdminDeleteFile();

  const handleDownload = (file: FileRecord) => {
    const url = file.blob.getDirectURL();
    window.open(url, "_blank", "noopener,noreferrer");
    toast.success(`Downloading "${file.name}"`);
  };

  const handleDeleteConfirm = () => {
    if (!confirmFile) return;
    const deleteAction = isAdminMode ? adminDeleteFile : deleteFile;

    deleteAction.mutate(confirmFile.id, {
      onSuccess: () => {
        toast.success(`"${confirmFile.name}" deleted successfully`);
        setConfirmFile(null);
        onRefresh?.();
      },
      onError: (err) => {
        toast.error(`Delete failed: ${err.message}`);
        setConfirmFile(null);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3">
            <Skeleton className="w-8 h-8 rounded-lg bg-secondary/40" />
            <Skeleton className="flex-1 h-4 bg-secondary/40" />
            <Skeleton className="w-16 h-4 bg-secondary/30" />
            <Skeleton className="w-16 h-4 bg-secondary/30" />
            <Skeleton className="w-20 h-7 rounded-md bg-secondary/30" />
          </div>
        ))}
      </div>
    );
  }

  if (!files || files.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
          <Upload className="w-8 h-8 text-primary/50" />
        </div>
        <h3 className="font-display font-semibold text-lg text-foreground mb-2">
          No files yet
        </h3>
        <p className="text-sm text-muted-foreground max-w-xs mb-5">
          Upload your first file to get started. All files are encrypted and
          stored securely.
        </p>
        {onUploadClick && (
          <Button
            size="sm"
            onClick={onUploadClick}
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 btn-primary-glow"
          >
            <Upload className="w-4 h-4" />
            Upload File
          </Button>
        )}
      </motion.div>
    );
  }

  const isPending = deleteFile.isPending || adminDeleteFile.isPending;

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="text-muted-foreground/70 text-xs font-semibold uppercase tracking-wider w-12" />
              <TableHead className="text-muted-foreground/70 text-xs font-semibold uppercase tracking-wider">
                File Name
              </TableHead>
              <TableHead className="text-muted-foreground/70 text-xs font-semibold uppercase tracking-wider">
                Type
              </TableHead>
              <TableHead className="text-muted-foreground/70 text-xs font-semibold uppercase tracking-wider">
                Size
              </TableHead>
              {showOwner && (
                <TableHead className="text-muted-foreground/70 text-xs font-semibold uppercase tracking-wider">
                  Owner
                </TableHead>
              )}
              <TableHead className="text-muted-foreground/70 text-xs font-semibold uppercase tracking-wider">
                Upload Date
              </TableHead>
              <TableHead className="text-muted-foreground/70 text-xs font-semibold uppercase tracking-wider text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((file, i) => {
              const Icon = getFileIcon(file.mimeType);
              const badgeClass = getFileBadgeColor(file.mimeType);
              const typeLabel = getFileTypeLabel(file.mimeType);
              const ownerStr = file.owner?.toString?.() ?? "Unknown";
              return (
                <motion.tr
                  key={file.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  className="border-border/40 hover:bg-secondary/20 transition-colors group"
                >
                  <TableCell className="py-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/12 border border-primary/20 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono-custom truncate max-w-[200px]">
                      {file.id.slice(0, 12)}…
                    </p>
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-mono-custom ${badgeClass}`}
                    >
                      {typeLabel}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3">
                    <span className="text-sm text-muted-foreground font-mono-custom">
                      {formatBytes(file.size)}
                    </span>
                  </TableCell>
                  {showOwner && (
                    <TableCell className="py-3">
                      <span className="text-xs text-muted-foreground font-mono-custom">
                        {truncatePrincipal(ownerStr)}
                      </span>
                    </TableCell>
                  )}
                  <TableCell className="py-3">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(file.uploadDate)}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDownload(file)}
                        className="h-7 px-2.5 text-xs text-primary hover:text-primary/80 hover:bg-primary/10 gap-1.5 font-medium"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Download</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setConfirmFile(file)}
                        disabled={isPending}
                        className="h-7 px-2.5 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Delete confirm dialog */}
      <Dialog
        open={!!confirmFile}
        onOpenChange={(open) => !open && setConfirmFile(null)}
      >
        <DialogContent className="card-glass border-border/60 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-foreground">
              Delete File?
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              This will permanently delete{" "}
              <span className="text-foreground font-medium">
                "{confirmFile?.name}"
              </span>
              . This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmFile(null)}
              className="border-border/60"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isPending}
              className="gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Deleting…
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
