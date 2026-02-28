import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Archive,
  CheckCircle2,
  File,
  FileText,
  Film,
  ImageIcon,
  Loader2,
  Lock,
  Music,
  RefreshCw,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import type { FileRecord } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useListFiles, useUploadFile } from "../hooks/useQueries";

function formatBytes(bytes: bigint): string {
  const n = Number(bytes);
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return ImageIcon;
  if (mimeType.startsWith("video/")) return Film;
  if (mimeType.startsWith("audio/")) return Music;
  if (mimeType.startsWith("text/")) return FileText;
  if (
    mimeType.includes("zip") ||
    mimeType.includes("archive") ||
    mimeType.includes("tar")
  )
    return Archive;
  return File;
}

function FileRow({ file }: { file: FileRecord }) {
  const Icon = getFileIcon(file.mimeType);
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-secondary/30 hover:bg-secondary/50 transition-colors group"
    >
      <div className="w-9 h-9 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {file.name}
        </p>
        <p className="text-xs text-muted-foreground font-mono-custom">
          {file.mimeType}
        </p>
      </div>
      <span className="text-xs text-muted-foreground font-mono-custom shrink-0">
        {formatBytes(file.size)}
      </span>
    </motion.div>
  );
}

export default function UploadSection() {
  const [isDragOver, setIsDragOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { identity, login, isInitializing, isLoggingIn } =
    useInternetIdentity();

  const {
    data: files,
    refetch: refetchFiles,
    isFetching: isLoadingFiles,
  } = useListFiles();
  const uploadMutation = useUploadFile();

  const processFile = useCallback(
    async (file: File) => {
      setUploadSuccess(false);
      setProgress(0);
      setUploadedFileName(file.name);

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
            toast.success(`"${file.name}" uploaded successfully`);
          },
          onError: (err) => {
            setProgress(0);
            toast.error(`Upload failed: ${err.message}`);
          },
        },
      );
    },
    [uploadMutation],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // reset so same file can be re-selected
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

  const isUploading = uploadMutation.isPending;

  return (
    <section id="upload" className="relative py-24 sm:py-32">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 80%, oklch(0.72 0.16 200 / 0.05), transparent 70%)",
        }}
      />

      <div className="section-divider mb-0" />

      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/25 bg-primary/8 text-primary text-xs font-semibold tracking-wider uppercase mb-5">
            Secure Upload
          </div>
          <h2 className="font-display font-bold text-4xl sm:text-5xl text-foreground mb-4">
            Upload Your Files{" "}
            <span className="text-gradient-cyan">Securely</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Your files are encrypted and stored on a decentralized network.
            Enterprise-grade security with zero trust architecture.
          </p>
        </motion.div>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Drop zone / Auth gate */}
          <AnimatePresence mode="wait">
            {isInitializing ? (
              /* Loading skeleton */
              <motion.div
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="upload-zone rounded-2xl p-12"
                aria-busy="true"
                aria-label="Loading authentication status"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-secondary/40 animate-pulse" />
                  <div className="space-y-2 w-full max-w-xs">
                    <div className="h-4 rounded bg-secondary/40 animate-pulse w-3/4 mx-auto" />
                    <div className="h-3 rounded bg-secondary/30 animate-pulse w-1/2 mx-auto" />
                  </div>
                </div>
              </motion.div>
            ) : !identity ? (
              /* Auth gate */
              <motion.div
                key="auth-gate"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4 }}
                className="card-glass rounded-2xl p-12 text-center"
                style={{
                  background: "oklch(0.12 0.018 255 / 0.6)",
                  boxShadow:
                    "inset 0 0 60px oklch(0.72 0.16 200 / 0.04), 0 0 0 1px oklch(0.72 0.16 200 / 0.15)",
                }}
              >
                {/* Lock icon with glow ring */}
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div
                    className="absolute inset-0 rounded-full animate-pulse-glow"
                    style={{
                      background:
                        "radial-gradient(circle, oklch(0.72 0.16 200 / 0.15) 0%, transparent 70%)",
                    }}
                  />
                  <div className="relative w-20 h-20 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center glow-cyan-sm">
                    <Lock className="w-9 h-9 text-primary" />
                  </div>
                </div>

                <h3 className="font-display font-bold text-xl text-foreground mb-2">
                  Sign in to Upload Files
                </h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-8 leading-relaxed">
                  Internet Identity login is required to securely upload files
                  to the decentralized network.
                </p>

                {/* Trust indicators */}
                <div className="flex items-center justify-center gap-6 mb-8 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-primary/70" />
                    End-to-end encrypted
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-primary/70" />
                    Decentralized storage
                  </div>
                </div>

                <Button
                  size="lg"
                  onClick={login}
                  disabled={isLoggingIn}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold btn-primary-glow transition-all duration-200 gap-2 px-8"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Connecting…
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Sign in with Internet Identity
                    </>
                  )}
                </Button>
              </motion.div>
            ) : (
              /* Authenticated: full drop zone */
              <motion.button
                key="dropzone"
                type="button"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4 }}
                aria-label="File upload zone. Click or drag and drop a file."
                className={`w-full upload-zone rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 ${
                  isDragOver ? "drag-over" : ""
                } ${isUploading ? "pointer-events-none opacity-70" : ""}`}
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
                  aria-label="File input"
                />

                <AnimatePresence mode="wait">
                  {isUploading ? (
                    <motion.div
                      key="uploading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto">
                        <Loader2 className="w-7 h-7 text-primary animate-spin" />
                      </div>
                      <p className="text-foreground font-semibold">
                        Uploading{" "}
                        <span className="text-primary">{uploadedFileName}</span>
                      </p>
                      <div className="max-w-xs mx-auto space-y-2">
                        <Progress value={progress} className="h-2" />
                        <p className="text-xs text-muted-foreground font-mono-custom">
                          {progress}% — Encrypting & uploading...
                        </p>
                      </div>
                    </motion.div>
                  ) : uploadSuccess ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-3"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto glow-cyan-sm">
                        <CheckCircle2 className="w-7 h-7 text-green-400" />
                      </div>
                      <p className="text-foreground font-semibold">
                        <span className="text-green-400">
                          {uploadedFileName}
                        </span>{" "}
                        uploaded successfully!
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Click or drag another file to upload again
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-3"
                    >
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
                          {isDragOver
                            ? "Drop to upload"
                            : "Drag & drop a file here"}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          or{" "}
                          <span className="text-primary underline underline-offset-2">
                            click to browse
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                        <Lock className="w-3 h-3" />
                        All uploads are AES-256 encrypted
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            )}
          </AnimatePresence>

          {/* Uploaded files list */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="card-glass rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-foreground">
                Uploaded Files
                {files && files.length > 0 && (
                  <span className="ml-2 text-xs font-mono-custom text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                    {files.length}
                  </span>
                )}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetchFiles()}
                disabled={isLoadingFiles}
                className="text-muted-foreground hover:text-primary h-8 px-2"
                aria-label="Refresh file list"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isLoadingFiles ? "animate-spin" : ""}`}
                />
              </Button>
            </div>

            {isLoadingFiles ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-14 rounded-xl bg-secondary/30 animate-pulse"
                  />
                ))}
              </div>
            ) : files && files.length > 0 ? (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {files.map((file) => (
                  <FileRow key={file.id} file={file} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  No files uploaded yet. Upload your first file above.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
