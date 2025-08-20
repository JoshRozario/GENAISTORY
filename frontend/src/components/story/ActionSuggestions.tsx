// Quick action suggestions component
import React from 'react';

interface ActionSuggestionsProps {
  actions: string[];
  onActionClick: (action: string) => void;
  disabled?: boolean;
}

export function ActionSuggestions({ actions, onActionClick, disabled }: ActionSuggestionsProps) {
  if (actions.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-700">Quick Actions:</h4>
      <div className="flex flex-wrap gap-2">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => onActionClick(action)}
            disabled={disabled}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {action}
          </button>
        ))}
      </div>
    </div>
  );
}