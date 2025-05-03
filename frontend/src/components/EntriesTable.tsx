import React, { useState } from 'react';
import { Entry, MessageProps } from '../types';
import { deleteEntry } from '../api/entriesApi';
import Message from './Message';
import { Download } from 'lucide-react';

interface EntriesTableProps {
  entries: Entry[];
  loading: boolean;
  onEntryDeleted: () => void;
}

const EntriesTable: React.FC<EntriesTableProps> = ({ entries = [], loading, onEntryDeleted }) => {
  const [message, setMessage] = useState<MessageProps>({ text: '', type: 'success', visible: false });

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this record?')) {
      return;
    }

    try {
      await deleteEntry(id);
      onEntryDeleted();
      setMessage({ text: 'Record deleted successfully!', type: 'error', visible: true });
    } catch (error) {
      console.error('Error deleting entry:', error);
      setMessage({ text: 'Failed to delete record. Please try again.', type: 'error', visible: true });
    }
  };

  const handleDownload = () => {
    const headers = ['ID', 'Amount', 'Description'];
    const csvContent = [
      headers.join(','),
      ...entries.map(entry => [entry.id, entry.amount, entry.description].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'entries.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-grow bg-[#1f4068] rounded-lg shadow-lg p-5 ml-5 max-w-[1000px] flex flex-col relative">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl mt-5">Entries</h2>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 p-2 bg-[#1f78ff] text-white border-none rounded cursor-pointer hover:bg-[#145fc4] transition-colors duration-200"
          disabled={!entries || entries.length === 0}
        >
          <Download size={18} />
          Download CSV
        </button>
      </div>
      
      {loading && (
        <div className="text-[#1f78ff] text-lg absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          Loading...
        </div>
      )}
      
      <div className="flex-grow mt-5 block overflow-hidden">
        <table className="w-full border-collapse bg-[#162447] rounded-lg table-fixed">
          <thead className="sticky top-0 bg-[#162447] z-[2]">
            <tr>
              <th className="border border-[#1b1b2f] p-3 text-base text-left bg-[#1f78ff] text-white font-bold">ID</th>
              <th className="border border-[#1b1b2f] p-3 text-base text-left bg-[#1f78ff] text-white font-bold">Amount</th>
              <th className="border border-[#1b1b2f] p-3 text-base text-left bg-[#1f78ff] text-white font-bold">Description</th>
              <th className="border border-[#1b1b2f] p-3 text-base text-left bg-[#1f78ff] text-white font-bold">Action</th>
            </tr>
          </thead>
        </table>
        
        <div className="max-h-[400px] overflow-y-auto block">
          <table className="w-full border-collapse bg-[#162447] rounded-lg table-fixed">
            <tbody className={`${loading ? 'opacity-50' : 'opacity-100'} transition-opacity duration-300`}>
              {!entries || entries.length === 0 ? (
                <tr>
                  <td colSpan={4} className="border border-[#1b1b2f] p-3 text-base text-center text-white">
                    No entries found
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr key={entry.id}>
                    <td className="border border-[#1b1b2f] p-3 text-base text-left text-white">{entry.id}</td>
                    <td className="border border-[#1b1b2f] p-3 text-base text-left text-white">{entry.amount}</td>
                    <td className="border border-[#1b1b2f] p-3 text-base text-left text-white">{entry.description}</td>
                    <td className="border border-[#1b1b2f] p-3 text-base text-left text-white">
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="p-2 bg-[#1f78ff] text-white border-none rounded cursor-pointer hover:bg-[#145fc4] transition-colors duration-200 w-full"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mt-3">
        <Message message={message} setMessage={setMessage} />
      </div>
    </div>
  );
};

export default EntriesTable;