import React, { useState, useEffect, useRef } from 'react';
import { useFetch } from '../hooks/useFetch';

interface StoryPlayerProps {
  storyId: string;
  onBack: () => void;
}

interface ConversationMessage {
  id: string;
  type: 'player' | 'ai';
  content: string;
  timestamp: string;
}

interface PlayerView {
  title: string;
  description: string;
  currentLocation: string;
  playerStats: Record<string, number>;
  knownCharacters: any[];
  inventory: any[];
  activeGoals: any[];
  conversationHistory: ConversationMessage[];
}

export default function StoryPlayer({ storyId, onBack }: StoryPlayerProps) {
  const [playerInput, setPlayerInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showCharacters, setShowCharacters] = useState(false);
  const [showGoals, setShowGoals] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [suggestedActions, setSuggestedActions] = useState<string[]>([]);
  const storyEndRef = useRef<HTMLDivElement>(null);

  const { data: storyData, loading, error, refetch } = useFetch<{ story: PlayerView }>(`/api/stories/${storyId}`);

  // Extract suggested actions from the latest AI message
  const extractSuggestedActions = (content: string): string[] => {
    const lines = content.split('\n');
    const actions: string[] = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      // Look for lines starting with dash, bullet, or numbered options
      if (trimmed.match(/^[-•*]\s+/) || trimmed.match(/^\d+[\.)]\s+/)) {
        // Extract the action text, removing the prefix
        const action = trimmed.replace(/^[-•*]\s+/, '').replace(/^\d+[\.)]\s+/, '').trim();
        if (action && action.length > 0) {
          actions.push(action);
        }
      }
    }
    
    return actions.slice(0, 4); // Limit to 4 actions to avoid clutter
  };

  useEffect(() => {
    if (storyData?.story.conversationHistory) {
      const history = storyData.story.conversationHistory;
      setConversationHistory(history);
      
      // Extract suggested actions from the most recent AI message
      const lastAiMessage = [...history].reverse().find(msg => msg.type === 'ai');
      if (lastAiMessage && !isGenerating) {
        const actions = extractSuggestedActions(lastAiMessage.content);
        setSuggestedActions(actions);
      }
    }
  }, [storyData, isGenerating]);

  useEffect(() => {
    // Auto-scroll to bottom when new content is added
    storyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationHistory]);

  const handleQuickAction = async (action: string) => {
    if (isGenerating) return;
    
    setPlayerInput(action);
    setSuggestedActions([]); // Clear suggestions once user picks one
    
    // Submit the action immediately
    await submitAction(action);
  };

  const submitAction = async (inputText: string) => {
    if (!inputText.trim() || isGenerating) return;
    
    setIsGenerating(true);
    
    try {
      const response = await fetch(`/api/stories/${storyId}/continue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playerInput: inputText.trim() }),
      });
      
      if (response.ok) {
        const result = await response.json();
        
        setPlayerInput('');
        refetch(); // Refresh the story data to get updated conversation history
      } else {
        console.error('Failed to continue story');
      }
    } catch (error) {
      console.error('Error continuing story:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleContinueStory = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuggestedActions([]); // Clear suggestions when user types custom input
    await submitAction(playerInput);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading story...</div>
      </div>
    );
  }

  if (error || !storyData?.story) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-800">Error loading story: {error}</div>
        <button
          onClick={onBack}
          className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
        >
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  const story = storyData.story;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-800 text-sm mb-2 flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{story.title}</h1>
          <p className="text-sm text-gray-600">{story.description}</p>
        </div>
        
        <div className="text-right text-sm text-gray-500">
          <div>📍 {story.currentLocation}</div>
          <div className="flex gap-4 mt-1">
            {Object.entries(story.playerStats).map(([stat, value]) => (
              <span key={stat} className="capitalize">
                {stat}: {value}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Story Area */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow">
            {/* Story Content */}
            <div className="p-6 min-h-96 max-h-96 overflow-y-auto bg-gray-50 rounded-t-lg">
              {conversationHistory.length === 0 ? (
                <div className="text-gray-500 italic text-center py-8">
                  Your adventure is about to begin...
                </div>
              ) : (
                <div className="space-y-4">
                  {conversationHistory.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'player' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                          message.type === 'player'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-800 border border-gray-200'
                        }`}
                      >
                        {message.type === 'ai' ? (
                          <div className="prose prose-sm max-w-none leading-relaxed">
                            {message.content.split('\n').map((paragraph, pIndex) => (
                              <p key={pIndex} className="mb-2 last:mb-0">
                                {paragraph}
                              </p>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm font-medium">
                            {message.content}
                          </div>
                        )}
                        
                        <div
                          className={`text-xs mt-1 ${
                            message.type === 'player'
                              ? 'text-blue-100'
                              : 'text-gray-500'
                          }`}
                        >
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div ref={storyEndRef} />
            </div>
            
            {/* Input Area */}
            <div className="p-4 border-t bg-white rounded-b-lg">
              {/* Suggested Actions */}
              {suggestedActions.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs text-gray-500 mb-2 font-medium">Quick Actions:</div>
                  <div className="flex flex-wrap gap-2">
                    {suggestedActions.map((action, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickAction(action)}
                        disabled={isGenerating}
                        className="text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 px-3 py-2 rounded-md border border-gray-300 transition-colors max-w-xs text-left"
                        title={action}
                      >
                        <div className="truncate">
                          {action.length > 50 ? action.substring(0, 50) + '...' : action}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <form onSubmit={handleContinueStory}>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={playerInput}
                    onChange={(e) => setPlayerInput(e.target.value)}
                    placeholder="What do you do next?"
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isGenerating}
                  />
                  <button
                    type="submit"
                    disabled={!playerInput.trim() || isGenerating}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
                  >
                    {isGenerating ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                      </>
                    ) : (
                      'Continue'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Side Panels */}
        <div className="space-y-4">
          {/* Inventory Panel */}
          <div className="bg-white rounded-lg shadow">
            <button
              onClick={() => setShowInventory(!showInventory)}
              className="w-full px-4 py-3 text-left font-medium text-gray-900 bg-gray-50 rounded-t-lg hover:bg-gray-100 flex justify-between items-center"
            >
              🎒 Inventory ({story.inventory.length})
              <svg className={`w-4 h-4 transform transition-transform ${showInventory ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showInventory && (
              <div className="p-4 max-h-48 overflow-y-auto">
                {story.inventory.length === 0 ? (
                  <p className="text-gray-500 text-sm italic">No items yet</p>
                ) : (
                  <div className="space-y-2">
                    {story.inventory.map((item, index) => (
                      <div key={index} className="border-b border-gray-100 pb-2 last:border-0">
                        <div className="font-medium text-sm">{item.name} ({item.quantity})</div>
                        <div className="text-xs text-gray-600">{item.description}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Characters Panel */}
          <div className="bg-white rounded-lg shadow">
            <button
              onClick={() => setShowCharacters(!showCharacters)}
              className="w-full px-4 py-3 text-left font-medium text-gray-900 bg-gray-50 rounded-t-lg hover:bg-gray-100 flex justify-between items-center"
            >
              👥 Characters ({story.knownCharacters.length})
              <svg className={`w-4 h-4 transform transition-transform ${showCharacters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showCharacters && (
              <div className="p-4 max-h-48 overflow-y-auto">
                {story.knownCharacters.length === 0 ? (
                  <p className="text-gray-500 text-sm italic">No characters met yet</p>
                ) : (
                  <div className="space-y-3">
                    {story.knownCharacters.map((character, index) => (
                      <div key={index} className="border-b border-gray-100 pb-2 last:border-0">
                        <div className="font-medium text-sm">{character.name}</div>
                        <div className="text-xs text-gray-600">{character.description}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Goals Panel */}
          <div className="bg-white rounded-lg shadow">
            <button
              onClick={() => setShowGoals(!showGoals)}
              className="w-full px-4 py-3 text-left font-medium text-gray-900 bg-gray-50 rounded-t-lg hover:bg-gray-100 flex justify-between items-center"
            >
              🎯 Goals ({story.activeGoals.length})
              <svg className={`w-4 h-4 transform transition-transform ${showGoals ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showGoals && (
              <div className="p-4 max-h-48 overflow-y-auto">
                {story.activeGoals.length === 0 ? (
                  <p className="text-gray-500 text-sm italic">No active goals yet</p>
                ) : (
                  <div className="space-y-3">
                    {story.activeGoals.map((goal, index) => (
                      <div key={index} className="border-b border-gray-100 pb-2 last:border-0">
                        <div className="font-medium text-sm">{goal.title}</div>
                        <div className="text-xs text-gray-600 mb-1">{goal.description}</div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${goal.progress}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{goal.progress}% complete</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}