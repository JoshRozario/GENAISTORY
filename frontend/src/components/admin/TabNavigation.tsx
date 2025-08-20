// Tab navigation for admin panel
import React from 'react';

type AdminTab = 'overview' | 'characters' | 'inventory' | 'goals' | 'beats' | 'state';

interface TabNavigationProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
}

const tabs: { id: AdminTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'characters', label: 'Characters' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'goals', label: 'Goals' },
  { id: 'beats', label: 'Story Beats' },
  { id: 'state', label: 'World State' },
];

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}