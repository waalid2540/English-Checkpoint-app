import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://paiujwhqdfgundysncay.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhaXVqd2hxZGZndW5keXNuY2F5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NDcwNjMsImV4cCI6MjA2NjEyMzA2M30.hVtkOFojmLstiWVwZcurr_YmOsUcAb47EwNhLRFAdOQ'

// Debug environment variables
console.log('🔧 Supabase URL:', supabaseUrl)
console.log('🔧 Supabase Raw Env:', import.meta.env.VITE_SUPABASE_URL)
console.log('🔧 API Base URL:', import.meta.env.VITE_API_BASE_URL)
console.log('🔧 All Environment Variables:', import.meta.env)

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Auth helper functions
export const authHelpers = {
  signUp: async (email: string, password: string, firstName: string, lastName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`
        }
      }
    })
    return { data, error }
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  resetPassword: async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    return { data, error }
  },

  updatePassword: async (password: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password: password
    })
    return { data, error }
  },

  resendConfirmation: async (email: string) => {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email: email
    })
    return { data, error }
  }
}