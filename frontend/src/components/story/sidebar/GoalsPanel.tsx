// Goals sidebar panel component
import React, { useState } from 'react';
import type { Goal } from '../../../types/story';

interface GoalsPanelProps {
  goals: Goal[];
}

export function GoalsPanel({ goals }: GoalsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left"
      >
        <h3 className="text-lg font-medium text-gray-900">
          Active Goals ({goals.length})
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
          {goals.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No active goals</p>
          ) : (
            goals.map((goal) => (
              <div key={goal.id} className="border border-gray-100 rounded-md p-3">
                <div className="font-medium text-sm">{goal.title}</div>
                <div className="text-xs text-gray-600 mb-1">{goal.description}</div>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                  <div 
                    className="bg-green-600 h-1.5 rounded-full" 
                    style={{ width: `${goal.progress}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500">{goal.progress}% complete</div>
                
                {goal.status !== 'active' && (
                  <div className="text-xs mt-1">
                    <span className={`px-2 py-1 rounded-full ${
                      goal.status === 'completed' ? 'bg-green-100 text-green-800' :
                      goal.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {goal.status}
                    </span>
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