import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const intlMiddleware = createIntlMiddleware(routing)

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Skip i18n for API routes
  if (pathname.startsWith('/api/')) {
    return handleSupabaseAuth(request)
  }

  // Handle i18n routing
  const response = intlMiddleware(request)

  // Get the pathname without locale prefix for route matching
  const pathnameWithoutLocale = pathname.replace(/^\/(ru|en|kk)/, '') || '/'

  // Check protected routes (with locale prefix stripped)
  const isProtectedRoute =
    pathnameWithoutLocale.startsWith('/dashboard') ||
    pathnameWithoutLocale.startsWith('/create') ||
    pathnameWithoutLocale.startsWith('/story') ||
    pathnameWithoutLocale.startsWith('/buy-')

  if (isProtectedRoute) {
    const supabaseCheck = await checkSupabaseUser(request, response)
    if (supabaseCheck) return supabaseCheck
  }

  // Refresh supabase session cookies
  await refreshSupabaseSession(request, response)

  return response
}

async function handleSupabaseAuth(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', user.email)
      .single()

    if (!profile) {
      await supabase.auth.signOut()
      return NextResponse.json(
        { error: 'User not found', success: false },
        { status: 401 }
      )
    }
  }

  return supabaseResponse
}

async function checkSupabaseUser(request: NextRequest, response: NextResponse) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', user.email)
      .single()

    if (!profile) {
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return null
}

async function refreshSupabaseSession(request: NextRequest, response: NextResponse) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Just refresh the session
  await supabase.auth.getUser()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm|mp3|wav)$).*)',
  ],
}
