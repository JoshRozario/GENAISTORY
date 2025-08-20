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
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editingType, setEditingType] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  
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

  const handleEdit = (item: any, type: string) => {
    setEditingItem(item);
    setEditingType(type);
  };

  const handleAdd = (type: string) => {
    setEditingType(type);
    setShowAddModal(true);
  };

  const handleSave = async (formData: any) => {
    if (!selectedStoryId) return;
    
    try {
      let url = `/api/stories/${selectedStoryId}/admin/${editingType}`;
      let method = 'POST';
      
      if (editingItem && editingItem.id) {
        url += `/${editingItem.id}`;
        method = 'PUT';
      }
      
      // Clean up properties by removing undefined values
      const cleanedFormData = { ...formData };
      if (cleanedFormData.properties) {
        const cleanedProperties = Object.entries(cleanedFormData.properties)
          .filter(([_, value]) => value !== undefined && value !== '')
          .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
        cleanedFormData.properties = cleanedProperties;
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedFormData),
      });
      
      if (response.ok) {
        refetch();
        setEditingItem(null);
        setEditingType('');
        setShowAddModal(false);
        alert(`${editingType} ${editingItem ? 'updated' : 'added'} successfully`);
      }
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  const handleDelete = async (item: any, type: string) => {
    if (!selectedStoryId || !confirm(`Are you sure you want to delete this ${type}?`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/stories/${selectedStoryId}/admin/${type}/${item.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        refetch();
        alert(`${type} deleted successfully`);
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const closeModal = () => {
    setEditingItem(null);
    setEditingType('');
    setShowAddModal(false);
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
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-medium text-gray-900">All Characters ({story.characters.length})</h4>
                          <button
                            onClick={() => handleAdd('characters')}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-sm"
                          >
                            Add Character
                          </button>
                        </div>
                        <div className="space-y-4">
                          {story.characters.map((character, index) => (
                            <div key={index} className="bg-gray-50 p-4 rounded-lg">
                              <div className="flex justify-between items-start mb-2">
                                <h5 className="font-medium">{character.name}</h5>
                                <div className="flex space-x-2 items-center">
                                  <span className={`px-2 py-1 text-xs rounded ${
                                    character.knownToPlayer 
                                      ? 'bg-green-100 text-green-700' 
                                      : 'bg-red-100 text-red-700'
                                  }`}>
                                    {character.knownToPlayer ? 'Known to Player' : 'Hidden'}
                                  </span>
                                  <button
                                    onClick={() => handleEdit(character, 'characters')}
                                    className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDelete(character, 'characters')}
                                    className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                                  >
                                    Delete
                                  </button>
                                </div>
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
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-medium text-gray-900">Inventory ({story.inventory.length} items)</h4>
                          <button
                            onClick={() => handleAdd('inventory')}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-sm"
                          >
                            Add Item
                          </button>
                        </div>
                        <div className="space-y-3">
                          {story.inventory.map((item, index) => (
                            <div key={index} className="bg-gray-50 p-4 rounded-lg">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h5 className="font-medium">{item.name} (x{item.quantity})</h5>
                                  <p className="text-sm text-gray-600">{item.description}</p>
                                  <div className="text-xs text-gray-500 mt-1">
                                    Type: <span className="font-medium">{item.type}</span>
                                    {item.properties && Object.keys(item.properties).length > 0 && (
                                      <details className="inline ml-2">
                                        <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                                          Properties ↓
                                        </summary>
                                        <div className="mt-1 ml-4 space-y-1">
                                          {Object.entries(item.properties).map(([key, value]) => (
                                            <div key={key} className="text-xs">
                                              <span className="font-medium capitalize">{key}:</span> {JSON.stringify(value)}
                                            </div>
                                          ))}
                                        </div>
                                      </details>
                                    )}
                                  </div>
                                </div>
                                <div className="flex space-x-2 ml-4">
                                  <button
                                    onClick={() => handleEdit(item, 'inventory')}
                                    className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDelete(item, 'inventory')}
                                    className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                                  >
                                    Delete
                                  </button>
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
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-medium text-gray-900">Goals ({story.goals.length})</h4>
                          <button
                            onClick={() => handleAdd('goals')}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-sm"
                          >
                            Add Goal
                          </button>
                        </div>
                        <div className="space-y-4">
                          {story.goals.map((goal, index) => (
                            <div key={index} className="bg-gray-50 p-4 rounded-lg">
                              <div className="flex justify-between items-start mb-2">
                                <h5 className="font-medium">{goal.title}</h5>
                                <div className="flex space-x-2 items-center">
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
                                  <button
                                    onClick={() => handleEdit(goal, 'goals')}
                                    className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDelete(goal, 'goals')}
                                    className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                                  >
                                    Delete
                                  </button>
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
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-medium text-gray-900">Story Beats ({story.beats.length})</h4>
                          <button
                            onClick={() => handleAdd('beats')}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-sm"
                          >
                            Add Beat
                          </button>
                        </div>
                        <div className="space-y-3">
                          {story.beats.map((beat, index) => (
                            <div key={index} className="bg-gray-50 p-4 rounded-lg">
                              <div className="flex justify-between items-start mb-2">
                                <h5 className="font-medium">#{beat.order} {beat.title}</h5>
                                <div className="flex space-x-2 items-center">
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
                                  <button
                                    onClick={() => handleEdit(beat, 'beats')}
                                    className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDelete(beat, 'beats')}
                                    className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                                  >
                                    Delete
                                  </button>
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

      {/* Edit/Add Modal */}
      {(editingItem || showAddModal) && (
        <EditModal
          isOpen={true}
          onClose={closeModal}
          onSave={handleSave}
          item={editingItem}
          type={editingType}
        />
      )}
    </div>
  );
}

// Edit Modal Component
function EditModal({ isOpen, onClose, onSave, item, type }: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  item: any;
  type: string;
}) {
  const [formData, setFormData] = useState(item || {});

  React.useEffect(() => {
    setFormData(item || getDefaultItem(type));
  }, [item, type]);

  const getDefaultItem = (type: string) => {
    switch (type) {
      case 'characters':
        return {
          name: '',
          description: '',
          knownToPlayer: false,
          attributes: {},
          relationships: {},
          secrets: []
        };
      case 'inventory':
        return {
          name: '',
          description: '',
          type: 'misc',
          quantity: 1,
          properties: {}
        };
      case 'goals':
        return {
          title: '',
          description: '',
          status: 'active',
          progress: 0,
          knownToPlayer: false
        };
      case 'beats':
        return {
          title: '',
          description: '',
          completed: false,
          playerVisible: false,
          requirements: []
        };
      default:
        return {};
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
        <h3 className="text-lg font-medium mb-4">
          {item ? 'Edit' : 'Add'} {type.slice(0, -1)}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {type === 'characters' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => updateField('description', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={3}
                />
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.knownToPlayer || false}
                    onChange={(e) => updateField('knownToPlayer', e.target.checked)}
                    className="mr-2"
                  />
                  Known to Player
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Secrets (comma-separated)</label>
                <input
                  type="text"
                  value={(formData.secrets || []).join(', ')}
                  onChange={(e) => updateField('secrets', e.target.value.split(', ').filter(s => s.trim()))}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </>
          )}

          {type === 'inventory' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => updateField('description', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={formData.type || 'misc'}
                  onChange={(e) => updateField('type', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="weapon">Weapon</option>
                  <option value="tool">Tool</option>
                  <option value="consumable">Consumable</option>
                  <option value="key">Key</option>
                  <option value="misc">Miscellaneous</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <input
                  type="number"
                  value={formData.quantity || 1}
                  onChange={(e) => updateField('quantity', parseInt(e.target.value))}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  min="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Properties</label>
                <div className="space-y-2 mt-1">
                  {/* Value Property */}
                  <div className="flex items-center space-x-2">
                    <label className="text-xs text-gray-600 w-16">Value:</label>
                    <input
                      type="number"
                      value={formData.properties?.value || ''}
                      onChange={(e) => updateField('properties', {
                        ...formData.properties,
                        value: e.target.value ? parseInt(e.target.value) : undefined
                      })}
                      placeholder="Item value"
                      className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs"
                    />
                  </div>
                  
                  {/* Capacity Property (for containers) */}
                  {(formData.type === 'tool' || formData.type === 'misc') && (
                    <div className="flex items-center space-x-2">
                      <label className="text-xs text-gray-600 w-16">Capacity:</label>
                      <input
                        type="number"
                        value={formData.properties?.capacity || ''}
                        onChange={(e) => updateField('properties', {
                          ...formData.properties,
                          capacity: e.target.value ? parseInt(e.target.value) : undefined
                        })}
                        placeholder="Storage capacity"
                        className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs"
                      />
                    </div>
                  )}
                  
                  {/* Damage Property (for weapons) */}
                  {formData.type === 'weapon' && (
                    <div className="flex items-center space-x-2">
                      <label className="text-xs text-gray-600 w-16">Damage:</label>
                      <input
                        type="number"
                        value={formData.properties?.damage || ''}
                        onChange={(e) => updateField('properties', {
                          ...formData.properties,
                          damage: e.target.value ? parseInt(e.target.value) : undefined
                        })}
                        placeholder="Damage amount"
                        className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs"
                      />
                    </div>
                  )}
                  
                  {/* Durability Property */}
                  <div className="flex items-center space-x-2">
                    <label className="text-xs text-gray-600 w-16">Durability:</label>
                    <input
                      type="number"
                      value={formData.properties?.durability || ''}
                      onChange={(e) => updateField('properties', {
                        ...formData.properties,
                        durability: e.target.value ? parseInt(e.target.value) : undefined
                      })}
                      placeholder="Item durability"
                      className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs"
                      min="1"
                      max="100"
                    />
                  </div>
                  
                  {/* Effect Property (for consumables) */}
                  {formData.type === 'consumable' && (
                    <div className="flex items-center space-x-2">
                      <label className="text-xs text-gray-600 w-16">Effect:</label>
                      <input
                        type="text"
                        value={formData.properties?.effect || ''}
                        onChange={(e) => updateField('properties', {
                          ...formData.properties,
                          effect: e.target.value || undefined
                        })}
                        placeholder="Effect description"
                        className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs"
                      />
                    </div>
                  )}
                  
                  {/* Weight Property */}
                  <div className="flex items-center space-x-2">
                    <label className="text-xs text-gray-600 w-16">Weight:</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.properties?.weight || ''}
                      onChange={(e) => updateField('properties', {
                        ...formData.properties,
                        weight: e.target.value ? parseFloat(e.target.value) : undefined
                      })}
                      placeholder="Weight in lbs"
                      className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs"
                    />
                  </div>
                  
                  <div className="text-xs text-gray-500 mt-2">
                    Leave fields empty to exclude them from the item properties.
                  </div>
                </div>
              </div>
            </>
          )}

          {type === 'goals' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => updateField('title', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => updateField('description', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={formData.status || 'active'}
                  onChange={(e) => updateField('status', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="hidden">Hidden</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Progress (%)</label>
                <input
                  type="number"
                  value={formData.progress || 0}
                  onChange={(e) => updateField('progress', parseInt(e.target.value))}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.knownToPlayer || false}
                    onChange={(e) => updateField('knownToPlayer', e.target.checked)}
                    className="mr-2"
                  />
                  Known to Player
                </label>
              </div>
            </>
          )}

          {type === 'beats' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => updateField('title', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => updateField('description', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={3}
                />
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.completed || false}
                    onChange={(e) => updateField('completed', e.target.checked)}
                    className="mr-2"
                  />
                  Completed
                </label>
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.playerVisible || false}
                    onChange={(e) => updateField('playerVisible', e.target.checked)}
                    className="mr-2"
                  />
                  Player Visible
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Requirements (comma-separated)</label>
                <input
                  type="text"
                  value={(formData.requirements || []).join(', ')}
                  onChange={(e) => updateField('requirements', e.target.value.split(', ').filter(s => s.trim()))}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Save
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}