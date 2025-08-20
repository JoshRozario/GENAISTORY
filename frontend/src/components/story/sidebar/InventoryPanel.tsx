// Inventory sidebar panel component
import React, { useState } from 'react';
import type { InventoryItem } from '../../../types/story';

interface InventoryPanelProps {
  items: InventoryItem[];
}

export function InventoryPanel({ items }: InventoryPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left"
      >
        <h3 className="text-lg font-medium text-gray-900">
          Inventory ({items.length})
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
          {items.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No items in inventory</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="border border-gray-100 rounded-md p-3">
                <div className="font-medium text-sm">{item.name} ({item.quantity})</div>
                <div className="text-xs text-gray-600">{item.description}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Type: <span className="capitalize">{item.type}</span>
                </div>
                {Object.keys(item.properties).length > 0 && (
                  <div className="text-xs text-gray-500 mt-1">
                    {Object.entries(item.properties).map(([key, value]) => (
                      <div key={key}>
                        <span className="capitalize">{key}</span>: {String(value)}
                      </div>
                    ))}
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