import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const isAuthPage = req.nextUrl.pathname.startsWith('/auth')
  const isProtectedRoute = ['/dashboard', '/profile', '/admin'].some(path => 
    req.nextUrl.pathname.startsWith(path)
  )

  if (isAuthPage && session) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  return res
}

export const config = {
  matcher: ['/auth/:path*', '/dashboard/:path*', '/profile/:path*', '/admin/:path*']
}
