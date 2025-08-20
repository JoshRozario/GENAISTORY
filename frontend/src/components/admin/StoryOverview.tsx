// Overview tab content for admin panel
import React from 'react';
import type { Story } from '../../types/story';

interface StoryOverviewProps {
  story: Story;
  onExport: (format: 'json' | 'text') => void;
  onReset: () => void;
  onDeleteStory: () => void;
  isLoading: boolean;
}

export function StoryOverview({ story, onExport, onReset, onDeleteStory, isLoading }: StoryOverviewProps) {
  const formatJson = (obj: any) => JSON.stringify(obj, null, 2);

  return (
    <div className="space-y-6">
      {/* Story Info */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Story Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-600">Title:</span>
            <p className="mt-1">{story.title}</p>
          </div>
          <div>
            <span className="font-medium text-gray-600">Genre:</span>
            <p className="mt-1">{story.genre}</p>
          </div>
          <div>
            <span className="font-medium text-gray-600">Theme:</span>
            <p className="mt-1">{story.theme}</p>
          </div>
          <div>
            <span className="font-medium text-gray-600">Last Played:</span>
            <p className="mt-1">{new Date(story.lastPlayed).toLocaleString()}</p>
          </div>
          <div className="col-span-2">
            <span className="font-medium text-gray-600">Description:</span>
            <p className="mt-1">{story.description}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Story Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{story.characters.length}</div>
            <div className="text-sm text-gray-600">Characters</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{story.inventory.length}</div>
            <div className="text-sm text-gray-600">Inventory Items</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{story.goals.length}</div>
            <div className="text-sm text-gray-600">Goals</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{story.beats.length}</div>
            <div className="text-sm text-gray-600">Story Beats</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Story Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => onExport('json')}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Export JSON
          </button>
          <button
            onClick={() => onExport('text')}
            disabled={isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            Export Text
          </button>
          <button
            onClick={onReset}
            disabled={isLoading}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
          >
            Reset Progress
          </button>
          <button
            onClick={onDeleteStory}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            Delete Story
          </button>
        </div>
      </div>

      {/* World State Preview */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Current World State</h3>
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium text-gray-600">Location:</span>
            <span className="ml-2">{story.state.currentLocation}</span>
          </div>
          <div>
            <span className="font-medium text-gray-600">Player Stats:</span>
            <pre className="mt-2 bg-gray-50 p-3 rounded text-xs overflow-x-auto">
              {formatJson(story.state.playerStats)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}