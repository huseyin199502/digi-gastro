import { NextResponse } from "next/server";
import { PLATFORM_COOKIE, SESSION_COOKIE } from "@/lib/auth";

export async function POST() {
  const res = NextResponse.json({ success: true, redirect: "/login" });
  res.cookies.delete(SESSION_COOKIE);
  res.cookies.delete(PLATFORM_COOKIE);
  return res;
}
