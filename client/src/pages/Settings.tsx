import React from 'react'

const Settings = () => {
  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-4">Settings</h1>
        <p className="text-xl text-gray-600">Customize your learning experience</p>
      </div>
      
      <div className="card max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Language & Preferences</h2>
        <p className="text-gray-600">Language selection and app preferences will be available here.</p>
      </div>
    </div>
  )
}

export default Settings