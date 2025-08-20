import React, { useState } from 'react';
import StoryDashboard from './components/StoryDashboard';
import StoryPlayer from './components/story/StoryPlayer';
import AdminPanelRefactored from './components/admin/AdminPanelRefactored';

type View = 'dashboard' | 'player' | 'admin';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [currentStoryId, setCurrentStoryId] = useState<string | null>(null);

  const handlePlayStory = (storyId: string) => {
    setCurrentStoryId(storyId);
    setCurrentView('player');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setCurrentStoryId(null);
  };

  const toggleAdmin = () => {
    setCurrentView(currentView === 'admin' ? 'dashboard' : 'admin');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">GenAI Story</h1>
              <p className="ml-4 text-sm text-gray-500">Interactive AI-Powered Adventures</p>
            </div>
            
            <nav className="flex space-x-4">
              <button
                onClick={handleBackToDashboard}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentView === 'dashboard' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Dashboard
              </button>
              
              {currentStoryId && (
                <button
                  onClick={() => setCurrentView('player')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    currentView === 'player' 
                      ? 'bg-green-100 text-green-700' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Play Story
                </button>
              )}
              
              <button
                onClick={toggleAdmin}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentView === 'admin' 
                    ? 'bg-red-100 text-red-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Admin
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {currentView === 'dashboard' && (
          <StoryDashboard onPlayStory={handlePlayStory} />
        )}
        
        {currentView === 'player' && currentStoryId && (
          <StoryPlayer 
            storyId={currentStoryId} 
            onBack={handleBackToDashboard}
          />
        )}
        
        {currentView === 'admin' && (
          <AdminPanelRefactored />
        )}
      </main>
    </div>
  );
}