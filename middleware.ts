// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value || ''

  const isLoggedIn = !!token
  const { pathname } = request.nextUrl

  const publicPaths = ['/login', '/signup']

  const isPublicPath = publicPaths.includes(pathname)

  if (isPublicPath && isLoggedIn) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (!isPublicPath && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}
