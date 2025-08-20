// Story beats management component extracted from working AdminPanel
import React from 'react';
import type { StoryBeat } from '../../types/story';

interface BeatsManagementProps {
  beats: StoryBeat[];
  onEdit: (beat: StoryBeat) => void;
  onDelete: (beat: StoryBeat) => void;
  onAdd: () => void;
}

export function BeatsManagement({ beats, onEdit, onDelete, onAdd }: BeatsManagementProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-medium text-gray-900">Story Beats ({beats.length})</h4>
        <button
          onClick={onAdd}
          className="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-sm"
        >
          Add Beat
        </button>
      </div>
      <div className="space-y-3">
        {beats.map((beat, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <h5 className="font-medium">#{beat.order} {beat.title}</h5>
              <div className="flex space-x-2 items-center">
                <span className={`px-2 py-1 text-xs rounded ${
                  beat.completed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {beat.completed ? 'Completed' : 'Pending'}
                </span>
                <span className={`px-2 py-1 text-xs rounded ${
                  beat.playerVisible 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {beat.playerVisible ? 'Visible' : 'Hidden'}
                </span>
                <button
                  onClick={() => onEdit(beat)}
                  className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(beat)}
                  className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-2">{beat.description}</p>
            {beat.triggers && beat.triggers.length > 0 && (
              <div className="text-xs text-gray-600 mb-1">
                <strong>Triggers:</strong> {beat.triggers.join(', ')}
              </div>
            )}
            {beat.consequences && beat.consequences.length > 0 && (
              <div className="text-xs text-gray-600">
                <strong>Consequences:</strong> {beat.consequences.join(', ')}
              </div>
            )}
          </div>
        ))}
        {beats.length === 0 && (
          <div className="text-gray-500 italic">No story beats defined</div>
        )}
      </div>
    </div>
  );
}