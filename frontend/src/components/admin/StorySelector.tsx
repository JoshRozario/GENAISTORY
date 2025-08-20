// Story selection sidebar for admin panel
import React from 'react';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import type { Story } from '../../types/story';

interface StorySelectorProps {
  stories: Story[] | null;
  loading: boolean;
  selectedStoryId: string;
  onStorySelect: (storyId: string) => void;
}

export function StorySelector({ stories, loading, selectedStoryId, onStorySelect }: StorySelectorProps) {
  if (loading) {
    return <LoadingSpinner message="Loading stories..." />;
  }

  if (!stories || stories.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No stories available
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Select Story</h2>
      {stories.map((story) => (
        <button
          key={story.id}
          onClick={() => onStorySelect(story.id)}
          className={`w-full text-left p-3 rounded-md text-sm ${
            selectedStoryId === story.id
              ? 'bg-blue-100 text-blue-900 border border-blue-200'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <div className="font-medium">{story.title}</div>
          <div className="text-xs text-gray-500 mt-1">{story.genre}</div>
        </button>
      ))}
    </div>
  );
}