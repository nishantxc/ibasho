// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value || ''

  const isLoggedIn = !!token
  const { pathname } = request.nextUrl

  const publicPaths = ['/login', '/signup']

  const isPublicPath = publicPaths.includes(pathname)

  // Always route root to the login page to avoid showing the landing page
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isPublicPath && isLoggedIn) {
    return NextResponse.redirect(new URL('/home', request.url))
  }

  if (!isPublicPath && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

// Ensure middleware runs for app routes and the root path, excluding Next.js internals and static assets
export const config = {
  matcher: [
    '/',
    '/((?!_next|.*\\..*).*)',
  ],
}
