
import React, { useEffect, useRef } from 'react';
import { Message } from '../types';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

interface ChatWindowProps {
  messages: Message[];
  isBotTyping: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isBotTyping }) => {
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isBotTyping]);

  return (
    <div className="flex-1 p-4 overflow-y-auto whatsapp-bg">
       <div className="flex flex-col space-y-2">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isBotTyping && <TypingIndicator />}
        <div ref={chatEndRef} />
      </div>
    </div>
  );
};

export default ChatWindow;