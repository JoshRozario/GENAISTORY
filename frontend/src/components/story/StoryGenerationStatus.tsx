// Story generation progress indicator
import React from 'react';

interface StoryGenerationStatusProps {
  isGenerating: boolean;
  currentStep: string;
}

export function StoryGenerationStatus({ isGenerating, currentStep }: StoryGenerationStatusProps) {
  if (!isGenerating) return null;

  return (
    <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
      <div className="flex items-center space-x-3">
        <div className="animate-pulse">
          <div className="h-3 w-3 bg-purple-400 rounded-full"></div>
        </div>
        <div className="text-purple-700 text-sm font-medium">
          {currentStep}
        </div>
      </div>
    </div>
  );
}