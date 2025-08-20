// Characters sidebar panel component
import React, { useState } from 'react';
import type { Character } from '../../../types/story';

interface CharactersPanelProps {
  characters: Character[];
}

export function CharactersPanel({ characters }: CharactersPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left"
      >
        <h3 className="text-lg font-medium text-gray-900">
          Known Characters ({characters.length})
        </h3>
        <svg 
          className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isExpanded && (
        <div className="mt-4 space-y-3">
          {characters.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No characters known yet</p>
          ) : (
            characters.map((character) => (
              <div key={character.id} className="border border-gray-100 rounded-md p-3">
                <div className="font-medium text-sm">{character.name}</div>
                <div className="text-xs text-gray-600">{character.description}</div>
                {character.role && (
                  <div className="text-xs text-gray-500 mt-1">
                    Role: <span className="capitalize">{character.role}</span>
                  </div>
                )}
                {character.currentLocation && (
                  <div className="text-xs text-gray-500">
                    Location: {character.currentLocation}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}