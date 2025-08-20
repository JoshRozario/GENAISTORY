import React, { useState } from 'react';
import { useFetch } from '../hooks/useFetch';

interface Story {
  id: string;
  title: string;
  description: string;
  genre: string;
  theme: string;
  lastPlayed: string;
  isActive: boolean;
  characters: any[];
  inventory: any[];
  goals: any[];
  beats: any[];
  state: any;
  storyLog: any[];
}

export default function AdminPanel() {
  const [selectedStoryId, setSelectedStoryId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'characters' | 'inventory' | 'goals' | 'beats' | 'state'>('overview');
  
  const { data: storiesData, loading: storiesLoading } = useFetch<{ stories: any[] }>('/api/stories');
  const { data: storyData, loading: storyLoading, refetch } = useFetch<{ story: Story }>(
    selectedStoryId ? `/api/stories/${selectedStoryId}/admin` : null
  );

  const handleStorySelect = (storyId: string) => {
    setSelectedStoryId(storyId);
    setActiveTab('overview');
  };

  const formatJson = (obj: any) => {
    return JSON.stringify(obj, null, 2);
  };

  const exportStory = async (format: 'json' | 'text') => {
    if (!selectedStoryId) return;
    
    try {
      const response = await fetch(`/api/stories/${selectedStoryId}/export?format=${format}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `story_export.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const resetStory = async () => {
    if (!selectedStoryId || !confirm('Are you sure you want to reset this story? This will delete all progress.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/stories/${selectedStoryId}/reset`, {
        method: 'POST',
      });
      if (response.ok) {
        refetch();
        alert('Story reset successfully');
      }
    } catch (error) {
      console.error('Reset failed:', error);
    }
  };

  const deleteStory = async () => {
    if (!selectedStoryId || !confirm('Are you sure you want to permanently delete this story?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/stories/${selectedStoryId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setSelectedStoryId('');
        alert('Story deleted successfully');
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const stories = storiesData?.stories || [];
  const story = storyData?.story;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage and debug story data, view hidden information, and perform administrative actions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Story Selector */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Select Story</h3>
            
            {storiesLoading ? (
              <div className="text-gray-500">Loading stories...</div>
            ) : (
              <div className="space-y-2">
                {stories.map((story) => (
                  <button
                    key={story.id}
                    onClick={() => handleStorySelect(story.id)}
                    className={`w-full text-left p-3 rounded-md text-sm ${
                      selectedStoryId === story.id
                        ? 'bg-blue-100 text-blue-900 border border-blue-200'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="font-medium">{story.title}</div>
                    <div className="text-xs text-gray-500">
                      {story.genre} • {story.isActive ? 'Active' : 'Archived'}
                    </div>
                  </button>
                ))}
                
                {stories.length === 0 && (
                  <div className="text-gray-500 text-sm italic">No stories found</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {!selectedStoryId ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Select a story from the left panel to view detailed information
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow">
              {/* Story Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{story?.title}</h2>
                    <p className="text-sm text-gray-500">{story?.description}</p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => exportStory('json')}
                      className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                    >
                      Export JSON
                    </button>
                    <button
                      onClick={() => exportStory('text')}
                      className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                    >
                      Export Text
                    </button>
                    <button
                      onClick={resetStory}
                      className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200"
                    >
                      Reset
                    </button>
                    <button
                      onClick={deleteStory}
                      className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'characters', label: 'Characters' },
                    { id: 'inventory', label: 'Inventory' },
                    { id: 'goals', label: 'Goals' },
                    { id: 'beats', label: 'Story Beats' },
                    { id: 'state', label: 'World State' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {storyLoading ? (
                  <div className="text-gray-500">Loading story data...</div>
                ) : (
                  <>
                    {activeTab === 'overview' && story && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-gray-900">Basic Info</h4>
                            <div className="mt-2 text-sm text-gray-600 space-y-1">
                              <div><strong>ID:</strong> {story.id}</div>
                              <div><strong>Genre:</strong> {story.genre}</div>
                              <div><strong>Theme:</strong> {story.theme}</div>
                              <div><strong>Status:</strong> {story.isActive ? 'Active' : 'Archived'}</div>
                              <div><strong>Last Played:</strong> {new Date(story.lastPlayed).toLocaleString()}</div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-gray-900">Statistics</h4>
                            <div className="mt-2 text-sm text-gray-600 space-y-1">
                              <div><strong>Story Segments:</strong> {story.storyLog.length}</div>
                              <div><strong>Characters:</strong> {story.characters.length}</div>
                              <div><strong>Inventory Items:</strong> {story.inventory.length}</div>
                              <div><strong>Goals:</strong> {story.goals.length}</div>
                              <div><strong>Story Beats:</strong> {story.beats.length}</div>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-900">Recent Story Segments</h4>
                          <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                            {story.storyLog.slice(-5).map((segment, index) => (
                              <div key={index} className="bg-gray-50 p-3 rounded text-sm">
                                <div className="text-xs text-gray-500 mb-1">
                                  {new Date(segment.timestamp).toLocaleString()}
                                  {segment.playerInput && ` • Input: "${segment.playerInput}"`}
                                </div>
                                <div>{segment.content.substring(0, 200)}...</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'characters' && story && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-4">All Characters ({story.characters.length})</h4>
                        <div className="space-y-4">
                          {story.characters.map((character, index) => (
                            <div key={index} className="bg-gray-50 p-4 rounded-lg">
                              <div className="flex justify-between items-start mb-2">
                                <h5 className="font-medium">{character.name}</h5>
                                <span className={`px-2 py-1 text-xs rounded ${
                                  character.knownToPlayer 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                  {character.knownToPlayer ? 'Known to Player' : 'Hidden'}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{character.description}</p>
                              {character.secrets && character.secrets.length > 0 && (
                                <div className="text-xs text-red-600">
                                  <strong>Secrets:</strong> {character.secrets.join(', ')}
                                </div>
                              )}
                            </div>
                          ))}
                          {story.characters.length === 0 && (
                            <div className="text-gray-500 italic">No characters yet</div>
                          )}
                        </div>
                      </div>
                    )}

                    {activeTab === 'inventory' && story && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-4">Inventory ({story.inventory.length} items)</h4>
                        <div className="space-y-3">
                          {story.inventory.map((item, index) => (
                            <div key={index} className="bg-gray-50 p-4 rounded-lg">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h5 className="font-medium">{item.name} (x{item.quantity})</h5>
                                  <p className="text-sm text-gray-600">{item.description}</p>
                                  <div className="text-xs text-gray-500 mt-1">
                                    Type: {item.type} • Properties: {JSON.stringify(item.properties)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                          {story.inventory.length === 0 && (
                            <div className="text-gray-500 italic">No items in inventory</div>
                          )}
                        </div>
                      </div>
                    )}

                    {activeTab === 'goals' && story && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-4">Goals ({story.goals.length})</h4>
                        <div className="space-y-4">
                          {story.goals.map((goal, index) => (
                            <div key={index} className="bg-gray-50 p-4 rounded-lg">
                              <div className="flex justify-between items-start mb-2">
                                <h5 className="font-medium">{goal.title}</h5>
                                <div className="flex space-x-2">
                                  <span className={`px-2 py-1 text-xs rounded ${
                                    goal.status === 'active' ? 'bg-blue-100 text-blue-700' :
                                    goal.status === 'completed' ? 'bg-green-100 text-green-700' :
                                    goal.status === 'failed' ? 'bg-red-100 text-red-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {goal.status}
                                  </span>
                                  <span className={`px-2 py-1 text-xs rounded ${
                                    goal.knownToPlayer 
                                      ? 'bg-green-100 text-green-700' 
                                      : 'bg-red-100 text-red-700'
                                  }`}>
                                    {goal.knownToPlayer ? 'Known' : 'Hidden'}
                                  </span>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${goal.progress}%` }}
                                ></div>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">{goal.progress}% complete</div>
                            </div>
                          ))}
                          {story.goals.length === 0 && (
                            <div className="text-gray-500 italic">No goals defined</div>
                          )}
                        </div>
                      </div>
                    )}

                    {activeTab === 'beats' && story && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-4">Story Beats ({story.beats.length})</h4>
                        <div className="space-y-3">
                          {story.beats.map((beat, index) => (
                            <div key={index} className="bg-gray-50 p-4 rounded-lg">
                              <div className="flex justify-between items-start mb-2">
                                <h5 className="font-medium">#{beat.order} {beat.title}</h5>
                                <div className="flex space-x-2">
                                  <span className={`px-2 py-1 text-xs rounded ${
                                    beat.completed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                  }`}>
                                    {beat.completed ? 'Completed' : 'Pending'}
                                  </span>
                                  <span className={`px-2 py-1 text-xs rounded ${
                                    beat.playerVisible 
                                      ? 'bg-green-100 text-green-700' 
                                      : 'bg-red-100 text-red-700'
                                  }`}>
                                    {beat.playerVisible ? 'Visible' : 'Hidden'}
                                  </span>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600">{beat.description}</p>
                              {beat.requirements && (
                                <div className="text-xs text-gray-500 mt-1">
                                  Requirements: {beat.requirements.join(', ')}
                                </div>
                              )}
                            </div>
                          ))}
                          {story.beats.length === 0 && (
                            <div className="text-gray-500 italic">No story beats defined</div>
                          )}
                        </div>
                      </div>
                    )}

                    {activeTab === 'state' && story && (
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-4">World State</h4>
                          <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-auto">
                            {formatJson(story.state)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}