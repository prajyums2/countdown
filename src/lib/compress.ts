"use client";

const MAX_SIZE = 3 * 1024 * 1024; // 3MB — well under Vercel's 4.5MB limit

function base64Size(dataUrl: string): number {
  const base64 = dataUrl.split(",")[1] || dataUrl;
  return Math.round((base64.length * 3) / 4);
}

export function compressImage(
  dataUrl: string,
  maxDimension = 720,
  quality = 0.7
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (base64Size(dataUrl) <= MAX_SIZE) {
      resolve(dataUrl);
      return;
    }
    const img = new Image();
    img.onload = () => {
      const tryCompress = (dim: number, q: number) => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        if (width > height && width > dim) {
          height = Math.round((height / width) * dim);
          width = dim;
        } else if (height > dim) {
          width = Math.round((width / height) * dim);
          height = dim;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject(new Error("Canvas context unavailable")); return; }
        ctx.drawImage(img, 0, 0, width, height);
        const out = canvas.toDataURL("image/jpeg", q);
        if (base64Size(out) <= MAX_SIZE || (dim <= 320 && q <= 0.3)) {
          resolve(out);
        } else {
          tryCompress(Math.max(320, Math.round(dim * 0.7)), Math.max(0.3, q - 0.2));
        }
      };
      tryCompress(maxDimension, quality);
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = dataUrl;
  });
}
