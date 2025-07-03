import React, { useState, useEffect } from 'react'
import { useSubscription } from '../hooks/useSubscription'
import { useAuth } from '../contexts/AuthContext'
import UpgradePopup from '../components/UpgradePopup'

interface RoadSign {
  id: string
  name: string
  category: string
  description: string
  meaning: string
  truckSpecific: string
  imageUrl: string
  color: string
  shape: string
  importance: 'critical' | 'important' | 'helpful'
}

interface HighwayRule {
  id: string
  title: string
  category: string
  description: string
  truckGuidelines: string[]
  penalties: string
  examples: string[]
  difficulty: 'basic' | 'intermediate' | 'advanced'
}

const HighwayRules = () => {
  const { user } = useAuth()
  const subscription = useSubscription()
  
  const [activeTab, setActiveTab] = useState<'signs' | 'rules' | 'quiz'>('signs')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedSign, setSelectedSign] = useState<RoadSign | null>(null)
  const [selectedRule, setSelectedRule] = useState<HighwayRule | null>(null)
  const [showUpgradePopup, setShowUpgradePopup] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [learningProgress, setLearningProgress] = useState<string[]>([])

  // Road Signs Data (using SVG placeholders for now)
  const roadSigns: RoadSign[] = [
    {
      id: 'stop',
      name: 'Stop Sign',
      category: 'regulatory',
      description: 'Octagonal red sign requiring complete stop',
      meaning: 'You must come to a complete stop before the stop line or intersection',
      truckSpecific: 'Allow extra distance for braking. Check for height and weight restrictions at intersections.',
      imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0yNS44NTc5IDQuMTQyMTNMMTQuMTQyMSAxNS44NTc5TDQuMTQyMTMgMjUuODU3OVYyOC4xNDIxVjcxLjg1NzlWNzQuMTQyMUwxNC4xNDIxIDg0LjE0MjFMMjUuODU3OSA5NS44NTc5SDI4LjE0MjFINzEuODU3OUg3NC4xNDIxTDg0LjE0MjEgODUuODU3OUw5NS44NTc5IDc0LjE0MjFWNzEuODU3OVYyOC4xNDIxVjI1Ljg1NzlMODUuODU3OSAxNS44NTc5TDc0LjE0MjEgNC4xNDIxM0g3MS44NTc5SDI4LjE0MjFIMjUuODU3OVoiIGZpbGw9IiNEQzI2MjYiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIyIi8+Cjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+U1RPUCA8L3RleHQ+Cjwvc3ZnPgo=',
      color: 'red',
      shape: 'octagon',
      importance: 'critical'
    },
    {
      id: 'yield',
      name: 'Yield Sign',
      category: 'regulatory',
      description: 'Triangular red and white sign',
      meaning: 'Slow down and give right-of-way to other traffic',
      truckSpecific: 'Extra caution needed due to truck size and stopping distance. Check for adequate space before proceeding.',
      imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+Cjxwb2x5Z29uIHBvaW50cz0iNTAsNSA5NSw4NSA1LDg1IiBmaWxsPSIjRkZGRkZGIiBzdHJva2U9IiNEQzI2MjYiIHN0cm9rZS13aWR0aD0iMyIvPgo8cG9seWdvbiBwb2ludHM9IjUwLDE1IDgwLDc1IDIwLDc1IiBmaWxsPSIjRkZGRkZGIi8+Cjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iI0RDMjYyNiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+WUlFTEQ8L3RleHQ+Cjwvc3ZnPgo=',
      color: 'red-white',
      shape: 'triangle',
      importance: 'critical'
    },
    {
      id: 'speed-limit',
      name: 'Speed Limit 65',
      category: 'regulatory',
      description: 'White rectangular sign with black numbers',
      meaning: 'Maximum speed allowed is 65 mph',
      truckSpecific: 'Trucks may have different speed limits. Check for truck-specific speed limit signs.',
      imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRkZGRkZGIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS13aWR0aD0iMiIvPgo8dGV4dCB4PSI1MCIgeT0iMzUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiMwMDAwMDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlNQRUVEPC90ZXh0Pgo8dGV4dCB4PSI1MCIgeT0iNDgiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiMwMDAwMDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkxJTUlUPC90ZXh0Pgo8dGV4dCB4PSI1MCIgeT0iNzAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiMwMDAwMDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPjY1PC90ZXh0Pgo8L3N2Zz4K',
      color: 'white-black',
      shape: 'rectangle',
      importance: 'important'
    },
    {
      id: 'truck-route',
      name: 'Truck Route',
      category: 'guide',
      description: 'Green sign indicating truck-approved route',
      meaning: 'Designated route for commercial vehicles',
      truckSpecific: 'Follow these routes to avoid low bridges, weight restrictions, and residential areas.',
      imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHg9IjEwIiB5PSIyMCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjMjI3NzNGIiBzdHJva2U9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iMiIvPgo8dGV4dCB4PSI1MCIgeT0iNDAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiNGRkZGRkYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlRSVUNLPC90ZXh0Pgo8dGV4dCB4PSI1MCIgeT0iNTUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiNGRkZGRkYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlJPVVRFPC90ZXh0Pgo8dGV4dCB4PSI1MCIgeT0iNzAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiNGRkZGRkYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPjk1PC90ZXh0Pgo8L3N2Zz4K',
      color: 'green-white',
      shape: 'rectangle',
      importance: 'important'
    },
    {
      id: 'low-bridge',
      name: 'Low Clearance 13\'-6"',
      category: 'warning',
      description: 'Yellow warning sign for bridge height',
      meaning: 'Bridge ahead has limited vertical clearance',
      truckSpecific: 'CRITICAL for trucks! Know your vehicle height. This is lower than standard truck height.',
      imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHg9IjEwIiB5PSIyMCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRkJCRjI0IiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS13aWR0aD0iMiIvPgo8dGV4dCB4PSI1MCIgeT0iMzUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSI4IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iIzAwMDAwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TE9XIENMRUFSQU5DRTwvdGV4dD4KPHR5Z29uIHBvaW50cz0iMjAsNDUgODAsNDUgNzAsNjUgMzAsNjUiIGZpbGw9IiMwMDAwMDAiLz4KPHR5Z29uIHBvaW50cz0iMjUsNTAgNzUsNTAgNjUsNjAgMzUsNjAiIGZpbGw9IiNGQkJGMjQiLz4KPHR7dCB4PSI1MCIgeT0iNTciIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSI4IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iIzAwMDAwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+MTMnLTYiPC90ZXh0Pgo8dGV4dCB4PSI1MCIgeT0iNzUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiMwMDAwMDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5FWFQgMSBNSUxFPC90ZXh0Pgo8L3N2Zz4K',
      color: 'yellow-black',
      shape: 'rectangle',
      importance: 'critical'
    },
    {
      id: 'weigh-station',
      name: 'Weigh Station',
      category: 'regulatory',
      description: 'Blue sign indicating mandatory weigh station',
      meaning: 'All commercial vehicles must stop for weighing',
      truckSpecific: 'Mandatory stop for all trucks over 10,000 lbs. Have your logbook and documents ready.',
      imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHg9IjEwIiB5PSIyMCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjMjU2M0VCIiBzdHJva2U9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iMiIvPgo8dGV4dCB4PSI1MCIgeT0iMzUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSI4IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+V0VJR0ggU1RBVE1PTjwvdGV4dD4KPHR5Y3QgeD0iMzUiIHk9IjQwIiB3aWR0aD0iMzAiIGhlaWdodD0iMjAiIGZpbGw9IiNGRkZGRkYiLz4KPHR5Y3QgeD0iMzciIHk9IjQ1IiB3aWR0aD0iMjYiIGhlaWdodD0iMTAiIGZpbGw9IiMyNTYzRUIiLz4KPHR5Y3QgeD0iMzAiIHk9IjYwIiB3aWR0aD0iMTAiIGhlaWdodD0iNSIgZmlsbD0iI0ZGRkZGRiIvPgo8dGV4dCB4PSI1MCIgeT0iNzAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSI4IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QUxMIFRSVUNLUyBNVVNUPC90ZXh0Pgo8dGV4dCB4PSI1MCIgeT0iODAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSI4IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+RU5URVIgV0hFTiBPUEVOPC90ZXh0Pgo8L3N2Zz4K',
      color: 'blue-white',
      shape: 'rectangle',
      importance: 'critical'
    }
  ]

  // Highway Rules Data
  const highwayRules: HighwayRule[] = [
    {
      id: 'following-distance',
      title: 'Safe Following Distance',
      category: 'safety',
      description: 'Maintain adequate space between your truck and the vehicle ahead',
      truckGuidelines: [
        'Use the 7-second rule minimum (vs 3-second for cars)',
        'Increase to 10+ seconds in bad weather',
        'Add 1 second for every 10 feet of vehicle length',
        'Watch for vehicles cutting in front'
      ],
      penalties: 'Following too closely: $150-500 fine, possible license points',
      examples: [
        'At 60 mph: minimum 600 feet behind other vehicles',
        'In rain: increase distance by 2-3 seconds',
        'On hills: extra space for momentum changes'
      ],
      difficulty: 'basic'
    },
    {
      id: 'bridge-laws',
      title: 'Bridge Weight Laws',
      category: 'weight-limits',
      description: 'Federal and state regulations governing vehicle weight on bridges',
      truckGuidelines: [
        'Know your gross vehicle weight and axle weights',
        'Understand bridge formula calculations',
        'Watch for posted bridge weight limits',
        'Use designated truck routes when possible'
      ],
      penalties: 'Overweight violations: $100-10,000+ depending on excess weight',
      examples: [
        'Single axle limit: typically 20,000 lbs',
        'Tandem axle limit: typically 34,000 lbs',
        'Gross vehicle weight: 80,000 lbs maximum'
      ],
      difficulty: 'intermediate'
    },
    {
      id: 'hours-of-service',
      title: 'Hours of Service Regulations',
      category: 'compliance',
      description: 'Federal regulations limiting driving time to prevent fatigue',
      truckGuidelines: [
        '11-hour driving limit after 10 consecutive hours off duty',
        '14-hour duty limit (including non-driving time)',
        '60/70 hour weekly limits',
        'Required 30-minute break before 8 hours of driving'
      ],
      penalties: 'HOS violations: $1,000-11,000 per violation, out-of-service orders',
      examples: [
        'Electronic Logging Device (ELD) mandatory',
        'Sleeper berth provisions for split rest periods',
        'Short-haul exemptions for local drivers'
      ],
      difficulty: 'advanced'
    }
  ]

  const signCategories = [
    { id: 'all', name: 'All Signs', icon: '🚧', count: roadSigns.length },
    { id: 'regulatory', name: 'Regulatory', icon: '🛑', count: roadSigns.filter(s => s.category === 'regulatory').length },
    { id: 'warning', name: 'Warning', icon: '⚠️', count: roadSigns.filter(s => s.category === 'warning').length },
    { id: 'guide', name: 'Guide', icon: '🛣️', count: roadSigns.filter(s => s.category === 'guide').length }
  ]

  const ruleCategories = [
    { id: 'all', name: 'All Rules', icon: '📋' },
    { id: 'safety', name: 'Safety', icon: '🛡️' },
    { id: 'weight-limits', name: 'Weight Limits', icon: '⚖️' },
    { id: 'compliance', name: 'Compliance', icon: '📊' }
  ]

  const filteredSigns = roadSigns.filter(sign => {
    const matchesCategory = selectedCategory === 'all' || sign.category === selectedCategory
    const matchesSearch = sign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sign.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const filteredRules = highwayRules.filter(rule => {
    const matchesCategory = selectedCategory === 'all' || rule.category === selectedCategory
    const matchesSearch = rule.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const markAsLearned = (id: string) => {
    if (!learningProgress.includes(id)) {
      setLearningProgress(prev => [...prev, id])
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="text-center mb-8 lg:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
            🛣️ Highway Rules & Signs
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            Master road signs and highway rules essential for truck drivers. Interactive learning with real-world examples.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8">
          {[
            { id: 'signs', name: 'Road Signs', icon: '🚧' },
            { id: 'rules', name: 'Highway Rules', icon: '📋' },
            { id: 'quiz', name: 'Knowledge Test', icon: '🧠' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 sm:px-6 py-3 rounded-xl font-semibold transition-all text-sm sm:text-base ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-blue-50 shadow-md'
              }`}
            >
              {tab.icon} {tab.name}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search signs or rules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Road Signs Tab */}
        {activeTab === 'signs' && (
          <div>
            {/* Categories */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
              {signCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`p-3 sm:p-4 rounded-xl text-center transition-all ${
                    selectedCategory === category.id
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-green-50 shadow-md'
                  }`}
                >
                  <div className="text-xl sm:text-2xl mb-2">{category.icon}</div>
                  <div className="font-semibold text-sm sm:text-base">{category.name}</div>
                  <div className="text-xs text-gray-500">({category.count} signs)</div>
                </button>
              ))}
            </div>

            {/* Signs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredSigns.map((sign) => (
                <div
                  key={sign.id}
                  onClick={() => setSelectedSign(sign)}
                  className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:scale-105"
                >
                  <div className="text-center mb-4">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                      <img src={sign.imageUrl} alt={sign.name} className="w-full h-full object-contain" />
                    </div>
                    <h3 className="font-bold text-gray-800 mb-2 text-sm sm:text-base">{sign.name}</h3>
                    <p className="text-gray-600 text-xs sm:text-sm line-clamp-2">{sign.description}</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      sign.importance === 'critical' ? 'bg-red-100 text-red-800' :
                      sign.importance === 'important' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {sign.importance}
                    </span>
                    
                    {learningProgress.includes(sign.id) && (
                      <span className="text-green-500 text-lg">✅</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Highway Rules Tab */}
        {activeTab === 'rules' && (
          <div>
            {/* Rule Categories */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
              {ruleCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`p-3 sm:p-4 rounded-xl text-center transition-all ${
                    selectedCategory === category.id
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-blue-50 shadow-md'
                  }`}
                >
                  <div className="text-xl sm:text-2xl mb-2">{category.icon}</div>
                  <div className="font-semibold text-sm sm:text-base">{category.name}</div>
                </button>
              ))}
            </div>

            {/* Rules List */}
            <div className="space-y-4 sm:space-y-6">
              {filteredRules.map((rule) => (
                <div
                  key={rule.id}
                  onClick={() => setSelectedRule(rule)}
                  className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-0">{rule.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        rule.difficulty === 'basic' ? 'bg-green-100 text-green-800' :
                        rule.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {rule.difficulty}
                      </span>
                      {learningProgress.includes(rule.id) && (
                        <span className="text-green-500 text-lg">✅</span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm sm:text-base mb-4">{rule.description}</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2 text-sm">Key Guidelines:</h4>
                      <ul className="text-xs sm:text-sm text-gray-600 space-y-1">
                        {rule.truckGuidelines.slice(0, 2).map((guideline, index) => (
                          <li key={index}>• {guideline}</li>
                        ))}
                        {rule.truckGuidelines.length > 2 && (
                          <li className="text-blue-500 font-medium">+ {rule.truckGuidelines.length - 2} more...</li>
                        )}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2 text-sm">Penalties:</h4>
                      <p className="text-xs sm:text-sm text-red-600 font-medium">{rule.penalties}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Knowledge Test Tab */}
        {activeTab === 'quiz' && (
          <div className="text-center py-12 sm:py-16">
            <div className="text-6xl sm:text-8xl mb-6">🧠</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">Knowledge Test Coming Soon!</h2>
            <p className="text-gray-600 text-sm sm:text-base mb-8 max-w-2xl mx-auto px-4">
              Interactive quizzes to test your knowledge of road signs and highway rules. 
              Practice makes perfect for DOT inspections!
            </p>
            <button
              onClick={() => setShowUpgradePopup(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold hover:shadow-lg transition-all text-sm sm:text-base"
            >
              🔔 Notify Me When Ready
            </button>
          </div>
        )}

        {/* Sign Detail Modal */}
        {selectedSign && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">{selectedSign.name}</h2>
                  <button
                    onClick={() => setSelectedSign(null)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>
                
                <div className="text-center mb-6">
                  <div className="w-32 h-32 mx-auto mb-4 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                    <img src={selectedSign.imageUrl} alt={selectedSign.name} className="w-full h-full object-contain" />
                  </div>
                  <p className="text-gray-600">{selectedSign.description}</p>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-gray-800 mb-2">General Meaning</h3>
                    <p className="text-gray-600">{selectedSign.meaning}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-gray-800 mb-2">🚛 For Truck Drivers</h3>
                    <p className="text-gray-600">{selectedSign.truckSpecific}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-1">Color</h4>
                      <p className="text-sm text-gray-600">{selectedSign.color}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-1">Shape</h4>
                      <p className="text-sm text-gray-600">{selectedSign.shape}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => markAsLearned(selectedSign.id)}
                    disabled={learningProgress.includes(selectedSign.id)}
                    className={`w-full py-3 rounded-xl font-semibold transition-all ${
                      learningProgress.includes(selectedSign.id)
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    {learningProgress.includes(selectedSign.id) ? '✅ Learned' : '📚 Mark as Learned'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rule Detail Modal */}
        {selectedRule && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">{selectedRule.title}</h2>
                  <button
                    onClick={() => setSelectedRule(null)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-gray-800 mb-2">Description</h3>
                    <p className="text-gray-600">{selectedRule.description}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-gray-800 mb-3">🚛 Truck Driver Guidelines</h3>
                    <ul className="space-y-2">
                      {selectedRule.truckGuidelines.map((guideline, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          <span className="text-gray-600">{guideline}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-gray-800 mb-2">⚠️ Penalties</h3>
                    <p className="text-red-600 font-medium">{selectedRule.penalties}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-gray-800 mb-3">💡 Examples</h3>
                    <ul className="space-y-2">
                      {selectedRule.examples.map((example, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-500 mr-2">•</span>
                          <span className="text-gray-600">{example}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <button
                    onClick={() => markAsLearned(selectedRule.id)}
                    disabled={learningProgress.includes(selectedRule.id)}
                    className={`w-full py-3 rounded-xl font-semibold transition-all ${
                      learningProgress.includes(selectedRule.id)
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    {learningProgress.includes(selectedRule.id) ? '✅ Learned' : '📚 Mark as Learned'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <UpgradePopup 
          isOpen={showUpgradePopup}
          onClose={() => setShowUpgradePopup(false)}
          trigger="highway_rules"
        />
      </div>
    </div>
  )
}

export default HighwayRules