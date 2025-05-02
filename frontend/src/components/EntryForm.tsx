import React, { useState } from 'react';
import { addEntry } from '../api/entriesApi';
import { MessageProps } from '../types';
import Message from './Message';

interface EntryFormProps {
  onEntryAdded: () => void;
}

const EntryForm: React.FC<EntryFormProps> = ({ onEntryAdded }) => {
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [message, setMessage] = useState<MessageProps>({ text: '', type: 'success', visible: false });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await addEntry(Number(amount), description);
      setAmount('');
      setDescription('');
      onEntryAdded();
      setMessage({ text: 'Record added successfully!', type: 'success', visible: true });
    } catch (error) {
      console.error('Error adding entry:', error);
      setMessage({ text: 'Failed to add record. Please try again.', type: 'error', visible: true });
    }
  };

  return (
    <div className="bg-[#1f4068] rounded-lg shadow-lg p-5 w-[300px] flex-shrink-0 flex flex-col justify-between">
      <form onSubmit={handleSubmit}>
        <label htmlFor="amount" className="text-lg font-bold mt-3 block">
          Amount:
        </label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          className="my-3 p-3.5 w-full text-base border border-[#162447] rounded bg-[#1b1b2f] text-white focus:border-[#1f78ff] focus:outline-none"
        />
        
        <label htmlFor="desc" className="text-lg font-bold mt-3 block">
          Description:
        </label>
        <input
          type="text"
          id="desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className="my-3 p-3.5 w-full text-base border border-[#162447] rounded bg-[#1b1b2f] text-white focus:border-[#1f78ff] focus:outline-none"
        />
        
        <button
          type="submit"
          className="p-3.5 text-lg w-full bg-[#1f78ff] text-white border-none rounded cursor-pointer mt-3 hover:bg-[#145fc4] transition-colors duration-200"
        >
          Add Entry
        </button>
      </form>
      
      <Message message={message} setMessage={setMessage} />
    </div>
  );
};

export default EntryForm;