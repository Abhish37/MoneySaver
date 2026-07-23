import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Protected routes requiring authentication
const PROTECTED_ROUTES = ['/dashboard', '/vault', '/cards', '/stacker', '/profile', '/settings']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if target path is protected
  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route))

  if (isProtected) {
    const hasSessionCookie = request.cookies.has('moneysaver_session')
    // If no session cookie present, redirect to /login
    if (!hasSessionCookie) {
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
