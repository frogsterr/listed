import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Persist refreshed auth cookies before rendering the admin pages.
// Every privileged action still performs its own authorization check.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })
  if (!process.env.ADMIN_USER_ID) return response
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
          response.headers.set('Cache-Control', 'private, no-store')
        },
      },
    },
  )
  await supabase.auth.getUser()
  return response
}

export const config = {
  matcher: ['/admin/:path*', '/classes/add', '/professors/add'],
}
