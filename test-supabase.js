// Test Supabase connection
const supabaseUrl = 'https://vtrgpzdpedhulttksozi.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0cmdoemRwZWRodWx0dGtzem9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5Njg3NDYsImV4cCI6MjA2NDU0NDc0Nn0.tFsUa0WBXGOULfP66040_mbFI-LwSF0SdXlhQ64_S2E'

console.log('🔧 Testing Supabase connection...')
console.log('📡 URL:', supabaseUrl)
console.log('🔑 Key:', supabaseKey.substring(0, 20) + '...')

// Test the API endpoint
fetch(`${supabaseUrl}/rest/v1/`, {
  headers: {
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`
  }
})
.then(response => {
  console.log('✅ Supabase API Response:', response.status)
  if (response.status === 200) {
    console.log('✅ Supabase connection successful!')
  } else {
    console.log('❌ Supabase connection failed. Status:', response.status)
  }
})
.catch(error => {
  console.log('❌ Network error:', error.message)
})

// Test auth endpoint
fetch(`${supabaseUrl}/auth/v1/signup`, {
  method: 'POST',
  headers: {
    'apikey': supabaseKey,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'testpass123'
  })
})
.then(response => response.json())
.then(data => {
  console.log('🔐 Auth test response:', data)
  if (data.error) {
    if (data.error.message.includes('not enabled')) {
      console.log('⚠️  Email auth might not be enabled in Supabase')
    } else {
      console.log('📝 Auth response:', data.error.message)
    }
  }
})
.catch(error => {
  console.log('❌ Auth test error:', error.message)
})