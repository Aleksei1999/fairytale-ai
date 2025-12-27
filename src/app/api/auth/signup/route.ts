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
  child_name?: string;
  child_age?: string;
  child_gender?: string;
  child_interests?: string;
}

export async function POST(request: Request) {
  try {
    const body: SignupRequest = await request.json()
    const { email, password, name, utm_source, utm_medium, utm_campaign, utm_term, utm_content, child_name, child_age, child_gender, child_interests } = body

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

    // If signup successful, update the profile with UTM and child data
    if (!error && data.user) {
      const adminClient = createAdminClient()
      await adminClient
        .from('profiles')
        .update({
          utm_source,
          utm_medium,
          utm_campaign,
          utm_term,
          utm_content,
          child_name,
          child_age,
          child_gender,
          child_interests,
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
