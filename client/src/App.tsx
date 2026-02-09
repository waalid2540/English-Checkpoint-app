import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import LandingPage from './pages/LandingPage'
import Home from './pages/Home'
import QATraining from './pages/QATraining'
import PronunciationTrainer from './pages/PronunciationTrainer'
import SpeedQuiz from './pages/SpeedQuiz'
import HighwayRules from './pages/HighwayRules'
import ConversationPractice from './pages/ConversationPractice'
import AICoachAvatar from './pages/AICoachAvatar'
import Settings from './pages/Settings'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import ResendConfirmation from './pages/ResendConfirmation'
import NotFound from './pages/NotFound'
import PaymentSuccess from './pages/PaymentSuccess'
import InstallApp from './pages/InstallApp'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import RouteGuard from './components/RouteGuard'
import PWAInstall from './components/PWAInstall'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/resend-confirmation" element={<ResendConfirmation />} />
          
          {/* Payment success page */}
          <Route path="/payment-success" element={<PaymentSuccess />} />
          
          {/* Install app page */}
          <Route path="/install" element={<InstallApp />} />
          
          {/* Home - Clean new design */}
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/dashboard" element={<Home />} />
          
          {/* Core 3 Features */}
          <Route path="/qa-training" element={
            <div className="min-h-screen bg-slate-900">
              <Navbar />
              <main className="max-w-7xl mx-auto px-4 py-8">
                <QATraining />
              </main>
            </div>
          } />
          
          <Route path="/highway-rules" element={
            <div className="min-h-screen bg-slate-900">
              <Navbar />
              <main className="max-w-7xl mx-auto px-4 py-8">
                <HighwayRules />
              </main>
            </div>
          } />
          
          <Route path="/conversation-practice" element={<ConversationPractice />} />
          
          <Route path="/ai-coach-avatar" element={<AICoachAvatar />} />
          
          <Route path="/settings" element={
            <ProtectedRoute>
              <div className="min-h-screen bg-slate-900">
                <Navbar />
                <main className="max-w-4xl mx-auto px-4 py-8">
                  <Settings />
                </main>
              </div>
            </ProtectedRoute>
          } />
          
          {/* Catch-all route for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        
        {/* PWA Install Prompt */}
        <PWAInstall />
      </Router>
    </AuthProvider>
  )
}

export default App