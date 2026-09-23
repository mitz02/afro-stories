const STICKER_STYLE = "avataaars-neutral";

export function stickerAvatar(seed: string | null | undefined): string {
  const safe = (seed ?? "").replace(/[^a-zA-Z0-9_-]/g, "") || "user";
  return `https://api.dicebear.com/9.x/${STICKER_STYLE}/svg?seed=${encodeURIComponent(safe)}`;
}

export function randomStickerSeed(length = 10): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let out = "";
  const cryptoObj =
    typeof crypto !== "undefined" && "getRandomValues" in crypto ? crypto : null;
  const pool = new Uint32Array(length);
  if (cryptoObj) {
    cryptoObj.getRandomValues(pool);
    for (let i = 0; i < length; i++) out += alphabet[pool[i] % alphabet.length];
  } else {
    for (let i = 0; i < length; i++) {
      out += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
  }
  return out;
}

export function isStickerAvatar(url: string | null | undefined): boolean {
  return typeof url === "string" && url.includes("api.dicebear.com");
}