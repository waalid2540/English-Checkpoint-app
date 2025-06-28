import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface FeatureAccessProps {
  children: React.ReactNode
  featureName: string
  targetPath: string
  className?: string
  onClick?: () => void
}

const FeatureAccess: React.FC<FeatureAccessProps> = ({ 
  children, 
  featureName, 
  targetPath, 
  className = "",
  onClick 
}) => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleClick = () => {
    if (onClick) {
      onClick()
    }
    
    if (user) {
      // User is logged in, go to feature
      navigate(targetPath)
    } else {
      // User not logged in, redirect to signup with intended destination
      navigate('/signup', { 
        state: { 
          from: targetPath,
          featureName: featureName,
          message: `Sign up now to access ${featureName}!`
        } 
      })
    }
  }

  return (
    <div className={className} onClick={handleClick}>
      {children}
    </div>
  )
}

export default FeatureAccess