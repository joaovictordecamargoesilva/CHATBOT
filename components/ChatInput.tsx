import React, { useState, useRef } from 'react';
import { Option } from '../types';

interface ChatInputProps {
  onUserInput: (text: string, option?: Option) => void;
  options?: Option[];
  requiresTextInput?: boolean;
  isBotTyping: boolean;
  onFileChange: (file: File | null) => void;
  selectedFile: File | null;
}

const ChatInput: React.FC<ChatInputProps> = ({ onUserInput, options, requiresTextInput, isBotTyping, onFileChange, selectedFile }) => {
  const [inputValue, setInputValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (inputValue.trim() || selectedFile) {
      onUserInput(inputValue.trim());
      setInputValue('');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFileChange(e.target.files?.[0] ?? null);
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  if (isBotTyping) {
    return <div className="h-24 bg-gray-100" />; // Placeholder to maintain height
  }
  
  return (
    <div className="p-2 bg-gray-100 border-t border-gray-200">
      {options && options.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
          {options.map((option) => (
            <button
              key={option.text}
              onClick={() => onUserInput(option.text, option)}
              disabled={isBotTyping}
              className="w-full bg-white text-blue-600 font-semibold py-2 px-4 rounded-lg border border-blue-500 hover:bg-blue-50 transition duration-200 disabled:bg-gray-300 disabled:text-gray-500 disabled:border-gray-300"
            >
              {option.text}
            </button>
          ))}
        </div>
      )}
      {requiresTextInput && (
        <>
        {selectedFile && (
            <div className="mb-2 p-2 bg-green-100 border border-green-200 rounded-lg flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2 truncate">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <span className="text-gray-700 truncate">{selectedFile.name}</span>
                </div>
                <button onClick={() => onFileChange(null)} className="text-gray-500 hover:text-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        )}
        <div className="flex items-center space-x-2">
            <input 
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelected}
                className="hidden"
                accept=".pdf,.xml,.csv,.txt,.json,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.webp"
            />
            <button
                onClick={handleFileClick}
                disabled={isBotTyping}
                className="text-gray-500 p-2 rounded-full hover:bg-gray-200 transition duration-200 disabled:text-gray-300"
                aria-label="Anexar arquivo"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
            </button>
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={selectedFile ? "Descreva o arquivo..." : "Mensagem"}
                disabled={isBotTyping}
                className="flex-grow p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005e54]"
                autoFocus
            />
            <button
                onClick={handleSend}
                disabled={isBotTyping || (!inputValue.trim() && !selectedFile)}
                className="bg-[#005e54] text-white p-3 rounded-full hover:bg-[#004c45] transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                aria-label="Enviar mensagem"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
            </button>
        </div>
        </>
      )}
    </div>
  );
};

export default ChatInput;