// Character management component extracted from working AdminPanel
import React from 'react';
import type { Character } from '../../types/story';

interface CharacterManagementProps {
  characters: Character[];
  onEdit: (character: Character) => void;
  onDelete: (character: Character) => void;
  onAdd: () => void;
}

export function CharacterManagement({ characters, onEdit, onDelete, onAdd }: CharacterManagementProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-medium text-gray-900">All Characters ({characters.length})</h4>
        <button
          onClick={onAdd}
          className="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-sm"
        >
          Add Character
        </button>
      </div>
      <div className="space-y-4">
        {characters.map((character, index) => (
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
                  onClick={() => onEdit(character)}
                  className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(character)}
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
        {characters.length === 0 && (
          <div className="text-gray-500 italic">No characters yet</div>
        )}
      </div>
    </div>
  );
}