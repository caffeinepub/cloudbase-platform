import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface StorageStats {
    totalFiles: bigint;
    totalStorageUsed: bigint;
    totalUsers: bigint;
}
export interface FileRecord {
    id: string;
    owner: Principal;
    blob: ExternalBlob;
    name: string;
    size: bigint;
    mimeType: string;
    uploadDate: bigint;
}
export interface UserRecord {
    storageLimit: bigint;
    userId: Principal;
    isBlocked: boolean;
    createdAt: bigint;
    role: string;
    email: string;
    usedStorage: bigint;
}
export interface UserProfile {
    storageLimit: bigint;
    principal: Principal;
    isBlocked: boolean;
    createdAt: bigint;
    usedStorage: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    adminDeleteFile(id: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    blockUser(userId: Principal, blocked: boolean): Promise<void>;
    deleteFile(id: string): Promise<void>;
    getAllFiles(): Promise<Array<FileRecord>>;
    getAllUsers(): Promise<Array<UserRecord>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFile(id: string): Promise<FileRecord>;
    getTotalStorageStats(): Promise<StorageStats>;
    getUser(): Promise<UserProfile>;
    getUserFiles(): Promise<Array<FileRecord>>;
    getUserProfile(): Promise<UserRecord>;
    getUserProfile_compat(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    registerUser(email: string): Promise<UserRecord>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    uploadFile(name: string, size: bigint, blob: ExternalBlob, mimeType: string): Promise<string>;
}
