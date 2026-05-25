import CryptoJS from "crypto-js";

const KEY =
  process.env.NEXT_PUBLIC_SNAP_ENCRYPTION_KEY || "fallback-dev-key-change-me";

export function decryptSnapContent(encrypted: string): string {
  const bytes = CryptoJS.AES.decrypt(encrypted, KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}
