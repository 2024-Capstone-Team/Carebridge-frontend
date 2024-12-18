import React, { useState } from 'react';
import axios from 'axios';
import { AxiosError } from 'axios';
import MessageBubble from '../../components/common/MessageBubble';
import MessageInput from '../../components/common/MessageInput';

interface Message {
  id: number;
  sender: 'nurse' | 'patient';
  content: string;
  timestamp: string;
}

const PatientMessaging: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: 'nurse', content: 'Hello! How can I help you?', timestamp: '10:00 AM' },
    { id: 2, sender: 'patient', content: 'I need assistance with my medication.', timestamp: '10:05 AM' },
  ]);
  const [responseMessages, setResponseMessages] = useState<string[]>([]); // Store server responses
  const [loading, setLoading] = useState(false); // Track if the request is in progress

  const handleSendMessage = async (messageContent: string) => {
    // Add the message from the patient
    const newMessage: Message = {
      id: messages.length + 1,
      sender: 'patient',
      content: messageContent,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages([...messages, newMessage]);
    
    // Make the API request to send the message and get a response
    setLoading(true);
    try {
      const response = await axios.post('/api/classify-text', messageContent);
      setResponseMessages([response.data, ...responseMessages]); 
    } catch (error) {
      if (error instanceof AxiosError) {
        // If error is an AxiosError, access properties like `message` and `response`
        setResponseMessages([`Error: ${error.message}`, ...responseMessages]);
      } else {
        // If it's a different error type, just show a generic error message
        setResponseMessages([`An unexpected error occurred`, ...responseMessages]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-md mx-auto p-4 border rounded-lg shadow-md">
      <div className="flex-1 overflow-y-auto mb-4 p-2 border border-gray-300 rounded">
        {/* Display server response bubbles above the message input */}
        {responseMessages.map((response, index) => (
          <MessageBubble key={index} sender="nurse" content={response} timestamp={new Date().toLocaleTimeString()} />
        ))}

        {/* Display patient and nurse messages */}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} sender={msg.sender} content={msg.content} timestamp={msg.timestamp} />
        ))}
      </div>

      {/* Message input box */}
      <MessageInput onSend={handleSendMessage} loading={loading} />
    </div>
  );
};

export default PatientMessaging;