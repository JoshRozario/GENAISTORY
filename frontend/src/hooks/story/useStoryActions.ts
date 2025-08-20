// Custom hook for managing story actions and generation state
import { useState, useCallback } from 'react';
import { storyApi } from '../../services/api/storyApi';
import { actionParser } from '../../services/story/actionParser';
import type { ConversationMessage, StoryGenerationStep } from '../../types/story';

export function useStoryActions(storyId: string, onStoryUpdate: () => void) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [suggestedActions, setSuggestedActions] = useState<string[]>([]);

  const updateSuggestedActions = useCallback((conversationHistory: ConversationMessage[]) => {
    const lastAiMessage = [...conversationHistory].reverse().find(msg => msg.type === 'ai');
    if (lastAiMessage) {
      const actions = actionParser.extractSuggestedActions(lastAiMessage.content);
      setSuggestedActions(actions);
    }
  }, []);

  const submitAction = useCallback(async (playerInput: string): Promise<void> => {
    if (!playerInput.trim() || isGenerating) return;

    setIsGenerating(true);
    setGenerationStep('🔮 The crystal ball swirls with mystical energy...');

    try {
      // Simulate generation steps for better UX
      setTimeout(() => setGenerationStep('✍️ Weaving your story thread...'), 1000);
      setTimeout(() => setGenerationStep('🔍 Ensuring narrative consistency...'), 2000);
      setTimeout(() => setGenerationStep('🎭 Updating the world around you...'), 3000);

      const result = await storyApi.continueStory(storyId, { playerInput });

      // Update suggested actions based on the new content
      if (result.story?.conversationHistory) {
        updateSuggestedActions(result.story.conversationHistory);
      }

      // Trigger story data refresh
      onStoryUpdate();

    } catch (error) {
      console.error('Failed to submit action:', error);
      throw error;
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  }, [storyId, isGenerating, onStoryUpdate, updateSuggestedActions]);

  const handleQuickAction = useCallback(async (action: string): Promise<void> => {
    const cleanAction = actionParser.formatAction(action);
    if (actionParser.isValidAction(cleanAction)) {
      await submitAction(cleanAction);
    }
  }, [submitAction]);

  return {
    isGenerating,
    generationStep,
    suggestedActions,
    submitAction,
    handleQuickAction,
    updateSuggestedActions,
  };
}