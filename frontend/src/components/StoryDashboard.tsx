import React, { useState, useEffect } from 'react';
import { useFetch } from '../hooks/useFetch';

interface Story {
  id: string;
  title: string;
  description: string;
  genre: string;
  theme: string;
  lastPlayed: string;
  isActive: boolean;
  stats: {
    totalSegments: number;
    charactersKnown: number;
    inventoryItems: number;
    activeGoals: number;
    completedGoals: number;
    currentLocation: string;
    playtime: string;
  };
}

interface StoryDashboardProps {
  onPlayStory: (storyId: string) => void;
}

export default function StoryDashboard({ onPlayStory }: StoryDashboardProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newStory, setNewStory] = useState({
    title: '',
    description: '',
    genre: '',
    theme: '',
    initialLocation: ''
  });
  
  const { data: storiesData, loading: storiesLoading, error: storiesError, refetch } = useFetch<{ stories: Story[] }>('/api/stories');
  
  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setIsCreating(true);
    
    try {
      const response = await fetch('/api/stories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newStory),
      });
      
      if (response.ok) {
        setShowCreateForm(false);
        setNewStory({
          title: '',
          description: '',
          genre: '',
          theme: '',
          initialLocation: ''
        });
        refetch();
      } else {
        const errorData = await response.json();
        setCreateError(errorData.error || 'Failed to create story');
      }
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'Network error occurred');
    } finally {
      setIsCreating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (storiesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading stories...</div>
      </div>
    );
  }

  if (storiesError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-800">Error loading stories: {storiesError}</div>
      </div>
    );
  }

  const stories = storiesData?.stories || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Stories</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage your AI-powered interactive adventures
          </p>
        </div>
        
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Story
        </button>
      </div>

      {/* Create Story Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Create New Story</h2>
            
            {createError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <div className="text-red-800 text-sm">{createError}</div>
              </div>
            )}
            
            <form onSubmit={handleCreateStory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title *</label>
                <input
                  type="text"
                  required
                  value={newStory.title}
                  onChange={(e) => setNewStory({ ...newStory, title: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  placeholder="Enter story title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={newStory.description}
                  onChange={(e) => setNewStory({ ...newStory, description: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  rows={3}
                  placeholder="Brief description of your story"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Genre *</label>
                  <select
                    required
                    value={newStory.genre}
                    onChange={(e) => setNewStory({ ...newStory, genre: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">Select genre</option>
                    <option value="fantasy">Fantasy</option>
                    <option value="sci-fi">Sci-Fi</option>
                    <option value="mystery">Mystery</option>
                    <option value="adventure">Adventure</option>
                    <option value="horror">Horror</option>
                    <option value="romance">Romance</option>
                    <option value="western">Western</option>
                    <option value="cyberpunk">Cyberpunk</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Theme</label>
                  <input
                    type="text"
                    value={newStory.theme}
                    onChange={(e) => setNewStory({ ...newStory, theme: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    placeholder="e.g., redemption, love"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Starting Location *</label>
                <input
                  type="text"
                  required
                  value={newStory.initialLocation}
                  onChange={(e) => setNewStory({ ...newStory, initialLocation: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  placeholder="e.g., a tavern, spaceship bridge"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  disabled={isCreating}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-md flex items-center"
                >
                  {isCreating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    'Create Story'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stories Grid */}
      {stories.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No stories yet</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating your first interactive story.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => (
            <div
              key={story.id}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 truncate">{story.title}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    story.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {story.isActive ? 'Active' : 'Archived'}
                  </span>
                </div>
                
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">{story.description}</p>
                
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-2">
                    {story.genre}
                  </span>
                  {story.theme && (
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                      {story.theme}
                    </span>
                  )}
                </div>
                
                <div className="mt-4 text-xs text-gray-500 space-y-1">
                  <div>📍 {story.stats.currentLocation}</div>
                  <div>📚 {story.stats.totalSegments} segments • ⏱️ {story.stats.playtime}</div>
                  <div>👥 {story.stats.charactersKnown} characters • 🎒 {story.stats.inventoryItems} items</div>
                  <div>🎯 {story.stats.activeGoals} active goals • ✅ {story.stats.completedGoals} completed</div>
                </div>
                
                <div className="mt-4 text-xs text-gray-400">
                  Last played: {formatDate(story.lastPlayed)}
                </div>
              </div>
              
              <div className="bg-gray-50 px-6 py-3">
                <button
                  onClick={() => onPlayStory(story.id)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Continue Story
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}