import React from 'react';

interface MessageBubbleProps {
  sender: 'nurse' | 'patient';
  content: string;
  timestamp: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ sender, content, timestamp }) => {
  return (
    <div className={`my-2 ${sender === 'patient' ? 'text-right' : 'text-left'}`}>
      <div
        className={`inline-block px-3 py-2 rounded-lg ${
          sender === 'patient' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
        }`}
      >
        <p>{content}</p>
        <span className="block text-xs text-gray-500 mt-1">{timestamp}</span>
      </div>
    </div>
  );
};

export default MessageBubble;