# CloudSphere – 15GB Secure Cloud Storage Platform

## Current State
- Authorization and blob-storage components are already selected.
- Backend has a basic `FileRecord` type (id, name, size, mimeType, blob) with `uploadFile`, `listFiles`, `getFile`, `getUploadCount`.
- Files are NOT scoped per user; all files are global.
- No storage limit enforced; no per-user quota tracking.
- Frontend has Login, SignUp, Dashboard, and Admin pages but without 15GB quota UI, file type enforcement, upload progress, or admin block-user functionality.
- No admin role distinction in backend.

## Requested Changes (Diff)

### Add
- Per-user 15GB storage limit (15 * 1024 * 1024 * 1024 bytes) enforced server-side.
- `UserRecord` type: userId (Principal), email, storageLimit (Nat), usedStorage (Nat), isBlocked (Bool), createdAt (Int).
- `FileRecord` extended with: userId (Principal), uploadDate (Int), fileUrl (Text derived from blob).
- Backend functions: `registerUser`, `getUserProfile`, `getUserFiles`, `deleteFile`, `getAllUsers` (admin), `getAllFiles` (admin), `blockUser` (admin), `getTotalStorageStats` (admin).
- Enforce file type allowlist: PDF, DOCX, JPG, PNG, MP4 (mimeType check).
- Enforce single file max size: 2GB (2 * 1024 * 1024 * 1024 bytes).
- Enforce per-user storage quota before accepting upload.
- Admin role: first registered user or principal matching a hardcoded admin principal becomes admin.
- Dashboard: storage usage progress bar (used / 15GB), file count, per-user file list with download and delete.
- Admin panel: list all users with storage used, block/unblock users, total storage stats.
- Upload progress bar using `withUploadProgress` on ExternalBlob.
- Modern blue cloud SaaS design with sidebar layout, responsive.

### Modify
- `uploadFile` now scoped to caller principal, stores userId, checks quota and file type, updates usedStorage.
- `listFiles` returns only files belonging to caller (unless admin).
- Backend tracks users in a stable map keyed by Principal.
- Footer shows "Mohan @Cloud Sphere" and +91 7730032340.

### Remove
- Global `uploadCount` counter (replaced by per-user tracking).
- Unauthenticated file listing (all queries enforce login).

## Implementation Plan
1. Rewrite `main.mo` with UserRecord, extended FileRecord, per-user storage enforcement, admin functions, and quota logic.
2. Regenerate `backend.d.ts` from the new Motoko.
3. Rebuild all frontend pages: Login/SignUp, Dashboard with quota bar and file table, Admin panel with user management.
4. Implement upload flow with file-type validation, 2GB cap, progress bar, and post-upload storage refresh.
5. Secure download using blob `getDirectURL()` behind auth check.
6. Apply modern blue SaaS sidebar design system with responsive layout.
