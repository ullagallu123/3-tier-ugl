import React, { useEffect } from 'react';
import { MessageProps } from '../types';

interface MessageComponentProps {
  message: MessageProps;
  setMessage: React.Dispatch<React.SetStateAction<MessageProps>>;
}

const Message: React.FC<MessageComponentProps> = ({ message, setMessage }) => {
  useEffect(() => {
    if (message.visible) {
      const timer = setTimeout(() => {
        setMessage({ ...message, visible: false });
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [message, setMessage]);

  if (!message.visible) return null;

  const bgColor = message.type === 'success' ? 'bg-[#1a2a1e] border-[#28a745] text-[#28a745]' : 'bg-[#2a1a1a] border-[#dc3545] text-[#dc3545]';

  return (
    <div className={`mt-3 p-3.5 border rounded-md ${bgColor} transition-opacity duration-300`}>
      {message.text}
    </div>
  );
};

export default Message;