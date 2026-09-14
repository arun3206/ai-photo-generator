import { getDigitalProductById } from "@/config/digital-products";

const TOKEN_VERSION = 1;
export const DOWNLOAD_ACCESS_LIFETIME_SECONDS = 30 * 24 * 60 * 60;

interface DownloadTokenPayload {
  v: number;
  productId: string;
  orderId: string;
  paymentId: string;
  issuedAt: number;
  expiresAt: number;
  nonce: string;
}

function encode(value: string | Uint8Array) {
  const bytes = typeof value === "string" ? new TextEncoder().encode(value) : value;
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decode(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  return new Uint8Array([...binary].map((character) => character.charCodeAt(0)));
}

async function hmac(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return new Uint8Array(
    await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)),
  );
}

function secureEqual(first: Uint8Array, second: Uint8Array) {
  if (first.length !== second.length) return false;
  let difference = 0;
  for (let index = 0; index < first.length; index += 1)
    difference |= first[index]! ^ second[index]!;
  return difference === 0;
}

function tokenSecret(override?: string) {
  const value = override ?? process.env.DIGITAL_DOWNLOAD_TOKEN_SECRET;
  if (!value || value.length < 32)
    throw new Error("DIGITAL_DOWNLOAD_TOKEN_SECRET must contain at least 32 characters.");
  return value;
}

export async function createDownloadToken(
  input: { productId: string; orderId: string; paymentId: string },
  options: { secret?: string; now?: number; lifetimeSeconds?: number } = {},
) {
  const now = options.now ?? Date.now();
  const payload: DownloadTokenPayload = {
    v: TOKEN_VERSION,
    ...input,
    issuedAt: now,
    expiresAt:
      now + (options.lifetimeSeconds ?? DOWNLOAD_ACCESS_LIFETIME_SECONDS) * 1_000,
    nonce: crypto.randomUUID(),
  };
  const encodedPayload = encode(JSON.stringify(payload));
  const signature = encode(await hmac(encodedPayload, tokenSecret(options.secret)));
  return `${encodedPayload}.${signature}`;
}

export async function verifyDownloadToken(
  token: string,
  options: { secret?: string; now?: number } = {},
) {
  const [encodedPayload, encodedSignature, extra] = token.split(".");
  if (!encodedPayload || !encodedSignature || extra) return null;
  let providedSignature: Uint8Array;
  let payload: unknown;
  try {
    providedSignature = decode(encodedSignature);
    payload = JSON.parse(new TextDecoder().decode(decode(encodedPayload))) as unknown;
  } catch {
    return null;
  }
  const expectedSignature = await hmac(encodedPayload, tokenSecret(options.secret));
  if (!secureEqual(providedSignature, expectedSignature)) return null;
  if (!payload || typeof payload !== "object") return null;
  const value = payload as Record<string, unknown>;
  if (
    value.v !== TOKEN_VERSION ||
    typeof value.productId !== "string" ||
    typeof value.orderId !== "string" ||
    typeof value.paymentId !== "string" ||
    typeof value.issuedAt !== "number" ||
    typeof value.expiresAt !== "number" ||
    typeof value.nonce !== "string" ||
    value.expiresAt <= (options.now ?? Date.now()) ||
    !getDigitalProductById(value.productId)
  )
    return null;
  return value as unknown as DownloadTokenPayload;
}
