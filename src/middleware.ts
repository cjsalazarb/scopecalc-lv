import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Debug: log cookies and user state in production
  const allCookies = request.cookies.getAll()
  const supabaseCookies = allCookies.filter(c => c.name.includes('supabase') || c.name.startsWith('sb-'))
  console.log(`[middleware] ${request.nextUrl.pathname} | cookies: ${allCookies.length} total, ${supabaseCookies.length} supabase | names: ${supabaseCookies.map(c => c.name).join(', ')}`)

  const { data: { user }, error } = await supabase.auth.getUser()
  console.log(`[middleware] getUser → user: ${user?.email ?? 'null'} | error: ${error?.message ?? 'none'}`)

  const isLoginPage = request.nextUrl.pathname.startsWith('/login')
  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth')

  if (!user && !isLoginPage && !isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && isLoginPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
