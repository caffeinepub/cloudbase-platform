import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalBlob } from "../backend";
import type { FileRecord, StorageStats, UserRecord } from "../backend.d";
import { useActor } from "./useActor";

// ─── User Profile ─────────────────────────────────────────────────────────────

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserRecord | null>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getUserProfile();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Files ─────────────────────────────────────────────────────────────────────

export function useListFiles() {
  const { actor, isFetching } = useActor();
  return useQuery<FileRecord[]>({
    queryKey: ["files"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserFiles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllFiles() {
  const { actor, isFetching } = useActor();
  return useQuery<FileRecord[]>({
    queryKey: ["allFiles"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllFiles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllUsers() {
  const { actor, isFetching } = useActor();
  return useQuery<UserRecord[]>({
    queryKey: ["allUsers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useStorageStats() {
  const { actor, isFetching } = useActor();
  return useQuery<StorageStats | null>({
    queryKey: ["storageStats"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getTotalStorageStats();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Upload ─────────────────────────────────────────────────────────────────

export interface UploadFileParams {
  name: string;
  size: bigint;
  mimeType: string;
  bytes: Uint8Array<ArrayBuffer>;
  onProgress?: (pct: number) => void;
}

export function useUploadFile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<string, Error, UploadFileParams>({
    mutationFn: async ({ name, size, mimeType, bytes, onProgress }) => {
      if (!actor) throw new Error("Actor not ready");
      let blob = ExternalBlob.fromBytes(bytes);
      if (onProgress) {
        blob = blob.withUploadProgress(onProgress);
      }
      return actor.uploadFile(name, size, blob, mimeType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

// ─── Delete ─────────────────────────────────────────────────────────────────

export function useDeleteFile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deleteFile(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

export function useAdminDeleteFile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.adminDeleteFile(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allFiles"] });
      queryClient.invalidateQueries({ queryKey: ["storageStats"] });
    },
  });
}

// ─── Block/Unblock User ───────────────────────────────────────────────────────

export interface BlockUserParams {
  userId: import("@icp-sdk/core/principal").Principal;
  blocked: boolean;
}

export function useBlockUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, BlockUserParams>({
    mutationFn: async ({ userId, blocked }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.blockUser(userId, blocked);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
    },
  });
}

// ─── Register User ────────────────────────────────────────────────────────────

export function useRegisterUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<UserRecord, Error, string>({
    mutationFn: async (email: string) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.registerUser(email);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

// ─── Legacy compatibility (used by old code) ─────────────────────────────────

export function useUploadCount() {
  const { data: files } = useListFiles();
  return {
    data: files ? BigInt(files.length) : BigInt(0),
    isLoading: false,
  };
}
