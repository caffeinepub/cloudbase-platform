import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  File,
  FileText,
  Film,
  ImageIcon,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import type { UserRecord } from "../backend.d";
import { useUploadFile } from "../hooks/useQueries";
import { STORAGE_LIMIT_BYTES, formatBytes } from "./StorageStats";

// Allowed MIME types for CloudSphere
const ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "video/mp4",
];

const ACCEPT_ATTR = [
  ".pdf",
  ".doc",
  ".docx",
  ".jpg",
  ".jpeg",
  ".png",
  ".mp4",
].join(",");

// 2 GB max single file
const FILE_LIMIT_BYTES = 2 * 1024 * 1024 * 1024;

interface UploadZoneProps {
  onSuccess?: () => void;
  userProfile?: UserRecord | null;
}

export default function UploadZone({
  onSuccess,
  userProfile,
}: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useUploadFile();
  const isUploading = uploadMutation.isPending;

  const processFile = useCallback(
    async (file: File) => {
      // Validate file type
      const isValidType =
        ACCEPTED_MIME_TYPES.includes(file.type) ||
        file.name.match(/\.(pdf|docx?|jpe?g|png|mp4)$/i);
      if (!isValidType) {
        toast.error("File type not allowed", {
          description: "Accepted: PDF, DOCX, JPG, PNG, MP4",
        });
        return;
      }

      // Check single file size limit (2 GB)
      if (file.size > FILE_LIMIT_BYTES) {
        toast.error("File too large", {
          description: `Maximum file size is 2 GB. This file is ${formatBytes(file.size)}.`,
        });
        return;
      }

      // Check storage quota
      if (userProfile) {
        const usedBytes = Number(userProfile.usedStorage);
        const limitBytes =
          Number(userProfile.storageLimit) || STORAGE_LIMIT_BYTES;
        if (usedBytes + file.size > limitBytes) {
          const remaining = Math.max(limitBytes - usedBytes, 0);
          toast.error("Storage quota exceeded", {
            description: `You only have ${formatBytes(remaining)} remaining. This file is ${formatBytes(file.size)}.`,
          });
          return;
        }
      }

      setUploadSuccess(false);
      setProgress(0);
      setUploadedFileName(file.name);
      setSelectedFile(file);

      const arrayBuf = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuf) as Uint8Array<ArrayBuffer>;

      uploadMutation.mutate(
        {
          name: file.name,
          size: BigInt(file.size),
          mimeType: file.type || "application/octet-stream",
          bytes,
          onProgress: (pct) => setProgress(pct),
        },
        {
          onSuccess: () => {
            setProgress(100);
            setUploadSuccess(true);
            setSelectedFile(null);
            toast.success(`"${file.name}" uploaded successfully`);
            onSuccess?.();
          },
          onError: (err) => {
            setProgress(0);
            setSelectedFile(null);
            toast.error(`Upload failed: ${err.message}`);
          },
        },
      );
    },
    [uploadMutation, onSuccess, userProfile],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleReset = () => {
    setUploadSuccess(false);
    setUploadedFileName("");
    setSelectedFile(null);
    setProgress(0);
  };

  const fileTypes = [
    { icon: ImageIcon, label: "Images", types: "JPG, PNG" },
    { icon: FileText, label: "Documents", types: "PDF, DOCX" },
    { icon: Film, label: "Video", types: "MP4 · Max 2 GB" },
  ];

  // Check if storage is full
  const isStorageFull =
    userProfile &&
    Number(userProfile.usedStorage) >=
      (Number(userProfile.storageLimit) || STORAGE_LIMIT_BYTES);

  if (isStorageFull) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-14 h-14 rounded-2xl bg-destructive/15 border border-destructive/25 flex items-center justify-center mb-4">
          <Upload className="w-7 h-7 text-destructive/60" />
        </div>
        <h3 className="font-display font-semibold text-lg text-foreground mb-2">
          Storage Full
        </h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          You've reached your 15 GB storage limit. Delete some files to free up
          space.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* File type hints */}
      <div className="grid grid-cols-3 gap-3">
        {fileTypes.map(({ icon: Icon, label, types }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-secondary/20 border border-border/40 text-center"
          >
            <Icon className="w-5 h-5 text-primary/70" />
            <p className="text-xs font-medium text-foreground/70">{label}</p>
            <p className="text-[10px] text-muted-foreground">{types}</p>
          </div>
        ))}
      </div>

      {/* Drop zone */}
      <AnimatePresence mode="wait">
        {isUploading ? (
          <motion.div
            key="uploading"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="upload-zone rounded-2xl p-10 text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto mb-5">
              <Loader2 className="w-7 h-7 text-primary animate-spin" />
            </div>
            <p className="text-foreground font-semibold mb-1">
              Uploading <span className="text-primary">{uploadedFileName}</span>
            </p>
            <p className="text-xs text-muted-foreground mb-5">
              Encrypting and storing securely…
            </p>
            <div className="max-w-xs mx-auto space-y-2">
              <Progress value={progress} className="h-2.5" />
              <p className="text-xs text-muted-foreground font-mono-custom">
                {progress}% complete
              </p>
            </div>
          </motion.div>
        ) : uploadSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="upload-zone rounded-2xl p-10 text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-7 h-7 text-emerald-400" />
            </div>
            <p className="text-foreground font-semibold mb-1">
              <span className="text-emerald-400">{uploadedFileName}</span>{" "}
              uploaded!
            </p>
            <p className="text-xs text-muted-foreground mb-5">
              Your file is now securely stored.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={handleReset}
              className="border-primary/30 text-primary hover:bg-primary/10 gap-2"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload Another
            </Button>
          </motion.div>
        ) : (
          <motion.button
            key="idle"
            type="button"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            aria-label="File upload zone. Click or drag and drop."
            className={`w-full upload-zone rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${
              isDragOver ? "drag-over" : ""
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept={ACCEPT_ATTR}
              aria-label="File input"
            />
            <div className="space-y-3">
              <div
                className={`w-14 h-14 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center mx-auto transition-all duration-200 ${
                  isDragOver
                    ? "bg-primary/25 border-primary/50 glow-cyan-sm"
                    : ""
                }`}
              >
                <Upload
                  className={`w-7 h-7 text-primary transition-transform duration-200 ${
                    isDragOver ? "scale-110" : ""
                  }`}
                />
              </div>
              <div>
                <p className="text-foreground font-semibold">
                  {isDragOver ? "Drop to upload" : "Drag & drop your file here"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  or{" "}
                  <span className="text-primary underline underline-offset-2">
                    click to browse
                  </span>
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                PDF, DOCX, JPG, PNG, MP4 · Max 2 GB per file
              </p>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Selected file info */}
      <AnimatePresence>
        {selectedFile && !isUploading && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border/50"
          >
            <File className="w-4 h-4 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatBytes(selectedFile.size)} ·{" "}
                {selectedFile.type || "unknown type"}
              </p>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
              aria-label="Remove file"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
