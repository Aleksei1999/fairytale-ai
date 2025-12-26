import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

interface SignupRequest {
  email: string;
  password: string;
  name?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

export async function POST(request: Request) {
  try {
    const body: SignupRequest = await request.json()
    const { email, password, name, utm_source, utm_medium, utm_campaign, utm_term, utm_content } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    })

    // If signup successful and we have UTM data, update the profile
    if (!error && data.user && (utm_source || utm_medium || utm_campaign)) {
      const adminClient = createAdminClient()
      await adminClient
        .from('profiles')
        .update({
          utm_source,
          utm_medium,
          utm_campaign,
          utm_term,
          utm_content,
        })
        .eq('email', email)
    }

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      user: data.user,
      message: 'Check your email to confirm your account',
    })
  } catch {
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
