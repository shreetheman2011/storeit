import { AxiosError } from "axios";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseError(error: unknown) {
  if (error instanceof Error) return error.message;

  if (error instanceof Response) return error.statusText;

  if (error instanceof ErrorEvent) return error.message;

  if (error instanceof AxiosError)
    return error.response?.data?.message || error.message;

  if (typeof error === "string") return error;

  return JSON.stringify(error);
}

export function formatFileSize(sizeInBytes: number): string {
  if (sizeInBytes === 0) return "0 Bytes";

  const units = ["Bytes", "KB", "MB", "GB", "TB"];
  const k = 1024; // 1 KB = 1024 Bytes
  const i = Math.floor(Math.log(sizeInBytes) / Math.log(k)); // Determine the unit

  const size = (sizeInBytes / Math.pow(k, i)).toFixed(2); // Convert size to the appropriate unit
  return `${size} ${units[i]}`; // Combine size with unit
}

type FileCategory = "document" | "video" | "image" | "audio" | "other";

export function getCategoryFromMimeType(mimeType: string): FileCategory {
  if (
    mimeType === "application/pdf" ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  )
    return "document";

  if (mimeType.startsWith("video/")) return "video";

  if (mimeType.startsWith("image/")) return "image";

  if (mimeType.startsWith("audio/")) return "other";

  return "other";
}

export function generatePageKey(page: string): string {
  if (page === "documents") return "document";

  if (page === "images") return "image";

  if (page === "videos") return "video";

  if (page === "others") return "other";

  return page;
}

export function dynamicDownload(url: string, name: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = name;

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function ActionResponse<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}
