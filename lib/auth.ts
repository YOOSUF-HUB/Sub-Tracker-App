import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SESSION_COOKIE = "subscription_tracker_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30;

type SessionPayload = {
  exp: number;
  nonce: string;
};

export async function createSession() {
  const expires = new Date(Date.now() + SESSION_DURATION_MS);
  const token = signSession({
    exp: expires.getTime(),
    nonce: crypto.randomUUID(),
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires,
    path: "/",
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function isAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return false;
  }

  return verifySession(token);
}

export async function requireAuth() {
  if (!(await isAuthenticated())) {
    redirect("/login");
  }
}

export function verifyPassword(password: string) {
  const appPassword = process.env.APP_PASSWORD;

  if (!appPassword) {
    return false;
  }

  const passwordBuffer = Buffer.from(password);
  const appPasswordBuffer = Buffer.from(appPassword);

  if (passwordBuffer.length !== appPasswordBuffer.length) {
    return false;
  }

  return timingSafeEqual(passwordBuffer, appPasswordBuffer);
}

export function hasAuthConfig() {
  return Boolean(process.env.APP_PASSWORD && process.env.SESSION_SECRET);
}

function signSession(payload: SessionPayload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = sign(body);

  return `${body}.${signature}`;
}

function verifySession(token: string) {
  const [body, signature] = token.split(".");

  if (!body || !signature || !constantTimeEqual(signature, sign(body))) {
    return false;
  }

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as SessionPayload;
    return typeof payload.exp === "number" && payload.exp > Date.now();
  } catch {
    return false;
  }
}

function sign(value: string) {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error("SESSION_SECRET is required to create a secure session.");
  }

  return createHmac("sha256", secret).update(value).digest("base64url");
}

function constantTimeEqual(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return timingSafeEqual(aBuffer, bBuffer);
}
