// Composed sidebar with all panels
import React from 'react';
import { InventoryPanel } from './InventoryPanel';
import { CharactersPanel } from './CharactersPanel';
import { GoalsPanel } from './GoalsPanel';
import type { PlayerView } from '../../../types/story';

interface StorySidebarProps {
  story: PlayerView;
}

export function StorySidebar({ story }: StorySidebarProps) {
  return (
    <div className="w-80 bg-gray-50 border-l border-gray-200 p-4 overflow-y-auto">
      <div className="space-y-4">
        {/* Current Location */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Current Location</h3>
          <p className="text-sm text-gray-600">{story.currentLocation}</p>
        </div>

        {/* Player Stats */}
        {Object.keys(story.playerStats).length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Player Stats</h3>
            <div className="space-y-2">
              {Object.entries(story.playerStats).map(([stat, value]) => (
                <div key={stat} className="flex justify-between text-sm">
                  <span className="capitalize text-gray-600">{stat}:</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Goals */}
        <GoalsPanel goals={story.activeGoals} />

        {/* Inventory */}
        <InventoryPanel items={story.inventory} />

        {/* Characters */}
        <CharactersPanel characters={story.knownCharacters} />
      </div>
    </div>
  );
}