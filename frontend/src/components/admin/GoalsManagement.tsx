// Goals management component extracted from working AdminPanel
import React from 'react';
import type { Goal } from '../../types/story';

interface GoalsManagementProps {
  goals: Goal[];
  onEdit: (goal: Goal) => void;
  onDelete: (goal: Goal) => void;
  onAdd: () => void;
}

export function GoalsManagement({ goals, onEdit, onDelete, onAdd }: GoalsManagementProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-medium text-gray-900">Goals ({goals.length})</h4>
        <button
          onClick={onAdd}
          className="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-sm"
        >
          Add Goal
        </button>
      </div>
      <div className="space-y-4">
        {goals.map((goal, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <h5 className="font-medium">{goal.title}</h5>
              <div className="flex space-x-2 items-center">
                <span className={`px-2 py-1 text-xs rounded ${
                  goal.status === 'active' ? 'bg-blue-100 text-blue-700' :
                  goal.status === 'completed' ? 'bg-green-100 text-green-700' :
                  goal.status === 'failed' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {goal.status}
                </span>
                <span className={`px-2 py-1 text-xs rounded ${
                  goal.knownToPlayer 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {goal.knownToPlayer ? 'Known' : 'Hidden'}
                </span>
                <button
                  onClick={() => onEdit(goal)}
                  className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(goal)}
                  className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${goal.progress}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">{goal.progress}% complete</div>
          </div>
        ))}
        {goals.length === 0 && (
          <div className="text-gray-500 italic">No goals defined</div>
        )}
      </div>
    </div>
  );
}