import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Routes that require authentication
const protectedRoutes = ["/dashboard", "/profile", "/settings"]

// Routes that should redirect to home if already authenticated
const authRoutes = ["/login"]

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || ""

  if (hostname.includes("rotraders.net")) {
    const newUrl = new URL(request.url)
    newUrl.hostname = hostname.replace("rotraders.net", "rotraders.gg")
    console.log("[v0] Redirecting from .net to .gg:", request.url, "->", newUrl.toString())
    return NextResponse.redirect(newUrl, 301)
  }

  const sessionCookie = request.cookies.get("trade_session_id")
  const hasSession = !!sessionCookie?.value
  const { pathname } = request.nextUrl

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute && !hasSession) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthRoute && hasSession) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (handled by route handlers)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
