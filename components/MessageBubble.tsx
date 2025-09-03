import React from 'react';
import { Message, Sender } from '../types';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isBot = message.sender === Sender.BOT;

  const bubbleClasses = isBot
    ? 'bg-white text-gray-800 self-start'
    : 'bg-[#dcf8c6] text-gray-800 self-end';

  return (
    <div className={`flex w-full ${isBot ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`max-w-md md:max-w-lg lg:max-w-xl p-2 rounded-lg shadow-sm mb-1 flex flex-col ${bubbleClasses}`}
      >
        <div className="text-sm whitespace-pre-wrap">{message.text}</div>
        {message.file && (
            <div className="mt-2 p-2 bg-gray-100 rounded-lg flex items-center space-x-2 border border-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-xs text-gray-700 font-medium truncate">{message.file.name}</span>
            </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;