# 🔐 Supabase Authentication Setup

## Required Settings in Supabase Dashboard

### 1. Go to Authentication > Settings

**Site URL**: `http://localhost:8000`
**Redirect URLs**: Add these URLs:
```
http://localhost:8000
http://localhost:8000/**
http://localhost:8000/reset-password
```

### 2. Email Settings

**Enable email confirmations**: ✅ ON
**Disable email confirmations**: ❌ OFF  
**Enable email change confirmations**: ✅ ON
**Enable manual linking**: ❌ OFF

### 3. Auth Providers

**Email**: ✅ ENABLED
- Confirm email: ✅ ON
- Allow disposable email addresses: Your choice

### 4. Rate Limiting (optional)
- Default settings are usually fine

### 5. Security Settings
**JWT expiry**: 3600 (1 hour)
**Refresh token rotation**: ✅ ON

## 🧪 Test After Setup:

1. Save all settings in Supabase
2. Go to http://localhost:8000
3. Try creating an account
4. Check your email for confirmation
5. Confirm and try logging in

## 🆘 If Still Not Working:

### Check Browser Console:
1. Press F12 in browser
2. Go to Console tab
3. Try signing up
4. Share any error messages you see

### Common Issues:
- **CORS Error**: Add your localhost URL to Supabase settings
- **Email not confirmed**: Check spam folder
- **Invalid credentials**: Double-check your .env file
- **Network error**: Check if Supabase is accessible

## 🔍 Debug Steps:

1. **Test Supabase directly**: 
   - Go to https://vtrgpzdpedhulttksozi.supabase.co (should show "not found" but not network error)

2. **Check environment variables**:
   - Make sure your .env file is correct
   - Rebuild the app: `npm run build`

3. **Browser compatibility**:
   - Use Chrome or Firefox
   - Disable ad blockers
   - Clear browser cache

Your authentication should work after configuring these Supabase settings! 🚛✨