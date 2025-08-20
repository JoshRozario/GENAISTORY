// Refactored AdminPanel with proper SOC
import React, { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { useAdminActions } from '../../hooks/admin/useAdminActions';
import { StorySelector } from './StorySelector';
import { TabNavigation } from './TabNavigation';
import { StoryOverview } from './StoryOverview';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import type { Story } from '../../types/story';

type AdminTab = 'overview' | 'characters' | 'inventory' | 'goals' | 'beats' | 'state';

export default function AdminPanelRefactored() {
  const [selectedStoryId, setSelectedStoryId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  
  const { data: storiesData, loading: storiesLoading } = useFetch<{ stories: Story[] }>('/api/stories');
  const { data: storyData, loading: storyLoading, refetch } = useFetch<{ story: Story }>(
    selectedStoryId ? `/api/stories/${selectedStoryId}/admin` : null
  );

  const {
    isLoading: isActionLoading,
    error: actionError,
    handleExport,
    handleReset,
    handleDeleteStory,
  } = useAdminActions(selectedStoryId, refetch);

  const handleStorySelect = (storyId: string) => {
    setSelectedStoryId(storyId);
    setActiveTab('overview');
  };

  const story = storyData?.story;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Story Selection */}
      <div className="w-80 bg-white border-r border-gray-200 p-4 overflow-y-auto">
        <StorySelector
          stories={storiesData?.stories || null}
          loading={storiesLoading}
          selectedStoryId={selectedStoryId}
          onStorySelect={handleStorySelect}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!selectedStoryId ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <h2 className="text-xl font-medium mb-2">Admin Panel</h2>
              <p>Select a story from the sidebar to begin editing</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{story?.title}</h2>
                  <p className="text-sm text-gray-500">{story?.description}</p>
                </div>
                {actionError && (
                  <div className="text-red-600 text-sm">
                    Error: {actionError}
                  </div>
                )}
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white border-b border-gray-200 px-6">
              <TabNavigation 
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6">
              {storyLoading ? (
                <LoadingSpinner message="Loading story details..." />
              ) : !story ? (
                <div className="text-center text-gray-500">Story not found</div>
              ) : (
                <>
                  {activeTab === 'overview' && (
                    <StoryOverview
                      story={story}
                      onExport={handleExport}
                      onReset={handleReset}
                      onDeleteStory={handleDeleteStory}
                      isLoading={isActionLoading}
                    />
                  )}
                  {activeTab === 'characters' && (
                    <div className="text-center text-gray-500 py-8">
                      Character management coming soon...
                    </div>
                  )}
                  {activeTab === 'inventory' && (
                    <div className="text-center text-gray-500 py-8">
                      Inventory management coming soon...
                    </div>
                  )}
                  {activeTab === 'goals' && (
                    <div className="text-center text-gray-500 py-8">
                      Goals management coming soon...
                    </div>
                  )}
                  {activeTab === 'beats' && (
                    <div className="text-center text-gray-500 py-8">
                      Story beats management coming soon...
                    </div>
                  )}
                  {activeTab === 'state' && (
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Raw World State</h3>
                      <pre className="bg-gray-50 p-4 rounded text-sm overflow-auto">
                        {JSON.stringify(story.state, null, 2)}
                      </pre>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}