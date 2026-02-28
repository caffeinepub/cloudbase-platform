import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalBlob } from "../backend";
import type { FileRecord } from "../backend.d";
import { useActor } from "./useActor";

export function useListFiles() {
  const { actor, isFetching } = useActor();
  return useQuery<FileRecord[]>({
    queryKey: ["files"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listFiles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUploadCount() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["uploadCount"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getUploadCount();
    },
    enabled: !!actor && !isFetching,
  });
}

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
      return actor.uploadFile(name, size, mimeType, blob);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      queryClient.invalidateQueries({ queryKey: ["uploadCount"] });
    },
  });
}
