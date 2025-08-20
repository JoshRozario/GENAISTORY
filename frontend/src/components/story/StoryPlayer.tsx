// Refactored StoryPlayer component with proper SOC
import React, { useState, useEffect, useRef } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { useStoryActions } from '../../hooks/story/useStoryActions';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ChatMessage } from './ChatMessage';
import { ActionSuggestions } from './ActionSuggestions';
import { StoryGenerationStatus } from './StoryGenerationStatus';
import { StorySidebar } from './sidebar/StorySidebar';
import type { PlayerView } from '../../types/story';

interface StoryPlayerProps {
  storyId: string;
  onBack: () => void;
}

export default function StoryPlayer({ storyId, onBack }: StoryPlayerProps) {
  const [playerInput, setPlayerInput] = useState('');
  const storyEndRef = useRef<HTMLDivElement>(null);

  const { data: storyData, loading, error, refetch } = useFetch<{ story: PlayerView }>(`/api/stories/${storyId}`);
  
  const {
    isGenerating,
    generationStep,
    suggestedActions,
    submitAction,
    handleQuickAction,
    updateSuggestedActions,
  } = useStoryActions(storyId, refetch);

  const story = storyData?.story;

  // Update suggested actions when conversation history changes
  useEffect(() => {
    if (story?.conversationHistory) {
      updateSuggestedActions(story.conversationHistory);
    }
  }, [story?.conversationHistory, updateSuggestedActions]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (storyEndRef.current) {
      storyEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [story?.conversationHistory, isGenerating]);

  const handleContinueStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerInput.trim() || isGenerating) return;

    try {
      await submitAction(playerInput);
      setPlayerInput('');
    } catch (error) {
      console.error('Failed to continue story:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading story..." />;
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-800">Error loading story: {error}</div>
        <button 
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!story) {
    return <LoadingSpinner message="Story not found..." />;
  }

  return (
    <div className="flex bg-gray-50" style={{ height: 'calc(100vh - 4rem)' }}>
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{story.title}</h1>
              <p className="text-sm text-gray-600">{story.description}</p>
            </div>
            <button
              onClick={onBack}
              className="px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto min-h-0 pb-6">
          <div className="px-6 pt-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {story.conversationHistory.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              
              <StoryGenerationStatus 
                isGenerating={isGenerating} 
                currentStep={generationStep} 
              />
              
              <div ref={storyEndRef} />
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white px-6 py-4 flex-shrink-0">
          <div className="max-w-4xl mx-auto">
            <ActionSuggestions
              actions={suggestedActions}
              onActionClick={handleQuickAction}
              disabled={isGenerating}
            />
            
            <div className="mt-4">
              <form onSubmit={handleContinueStory} className="flex gap-3">
                <input
                  type="text"
                  value={playerInput}
                  onChange={(e) => setPlayerInput(e.target.value)}
                  placeholder="What do you do next?"
                  disabled={isGenerating}
                  className="flex-1 min-w-0 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 text-sm"
                />
                <button
                  type="submit"
                  disabled={isGenerating || !playerInput.trim()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm transition-colors"
                >
                  {isGenerating ? 'Generating...' : 'Continue'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <StorySidebar story={story} />
    </div>
  );
}