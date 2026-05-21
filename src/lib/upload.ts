// Read the key from the environment variable instead of hardcoding it
const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_KEY || "";

export async function uploadImage(file: File): Promise<string> {
  if (!IMGBB_API_KEY) {
    throw new Error("Missing ImgBB API Key. Check your .env file.");
  }

  const formData = new FormData();
  formData.append("image", file);
  formData.append("key", IMGBB_API_KEY);

  const res = await fetch("https://api.imgbb.com/1/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`ImgBB upload failed: ${err}`);
  }

  const data = await res.json();
  return data.data.url;
}