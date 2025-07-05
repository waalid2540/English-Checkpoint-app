import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

const NotFound = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-8xl mb-4">🚛</div>
          <h1 className="text-6xl font-bold text-gray-800 mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Route Not Found</h2>
          <p className="text-gray-600 text-lg">
            Looks like this truck took a wrong turn! The page you're looking for doesn't exist.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
          >
            ← Go Back
          </button>
          
          <Link
            to="/"
            className="block w-full bg-white text-gray-700 font-semibold py-3 px-6 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
          >
            🏠 Go Home
          </Link>
        </div>

        {/* Quick Links */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-gray-500 mb-4">Quick Links:</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Link to="/qa-training" className="text-blue-600 hover:text-blue-800 underline">
              DOT Practice
            </Link>
            <Link to="/speed-quiz" className="text-blue-600 hover:text-blue-800 underline">
              Speed Quiz
            </Link>
            <Link to="/pronunciation-trainer" className="text-blue-600 hover:text-blue-800 underline">
              Pronunciation
            </Link>
            <Link to="/highway-rules" className="text-blue-600 hover:text-blue-800 underline">
              Highway Rules
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFound