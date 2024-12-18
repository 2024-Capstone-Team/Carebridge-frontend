import React, { useState } from 'react';

interface MessageInputProps {
  onSend: (message: string) => void;
  loading: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSend, loading }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() !== '') {
      onSend(input);
      setInput(''); // Clear input after sending
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex mt-4">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message..."
        className="border p-2 w-full rounded-lg"
      />
      <button type="submit" className="ml-2 bg-blue-500 text-white p-2 rounded-lg" disabled={loading}>
        {loading ? 'Sending...' : 'Send'}
      </button>
    </form>
  );
};

export default MessageInput;