import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { Session } from "./lib/better-auth/auth-types";

async function getMiddleWareSession(req: NextRequest) {
  const { data: session } = await axios.get<Session>("/api/auth/get-session", {
    baseURL: req.nextUrl.origin,
    headers: {
      cookie: req.headers.get("cookie") || "", // Forward the cookies from the request
    },
  });

  return session;
}

export async function middleware(req: NextRequest) {
  const session = await getMiddleWareSession(req);
  const pathname = req.nextUrl.pathname;
  const url = req.url;

  if (pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", url));
  }

  if (pathname.startsWith("/dashboard")) {
    if (session) {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL("/sign-in", url));
  }

  if (pathname.startsWith("/sign-")) {
    if (!session) {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL("/dashboard", url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
