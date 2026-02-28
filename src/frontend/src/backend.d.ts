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
export interface FileRecord {
    id: string;
    blob: ExternalBlob;
    name: string;
    size: bigint;
    mimeType: string;
}
export interface backendInterface {
    getFile(id: string): Promise<FileRecord>;
    getUploadCount(): Promise<bigint>;
    listFiles(): Promise<Array<FileRecord>>;
    uploadFile(name: string, size: bigint, mimeType: string, blob: ExternalBlob): Promise<string>;
}
