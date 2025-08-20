// Individual chat message component
import React from 'react';
import type { ConversationMessage } from '../../types/story';

interface ChatMessageProps {
  message: ConversationMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isPlayer = message.type === 'player';
  
  return (
    <div className={`flex ${isPlayer ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-4xl px-6 py-4 rounded-lg ${
          isPlayer
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        <div className="whitespace-pre-wrap text-base leading-relaxed">
          {message.content}
        </div>
        <div
          className={`text-sm mt-2 ${
            isPlayer ? 'text-blue-100' : 'text-gray-500'
          }`}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
    </div>
  );
}