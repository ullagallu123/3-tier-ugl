import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import EntryForm from './components/EntryForm';
import EntriesTable from './components/EntriesTable';
import { fetchEntries } from './api/entriesApi';
import { Entry } from './types';

function App() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const loadEntries = async () => {
    setLoading(true);
    try {
      const data = await fetchEntries();
      setEntries(data);
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#1a1a2e] text-white">
      <Header />
      
      <div className="flex justify-between items-stretch flex-grow p-5 flex-col md:flex-row">
        <EntryForm onEntryAdded={loadEntries} />
        <EntriesTable 
          entries={entries} 
          loading={loading} 
          onEntryDeleted={loadEntries} 
        />
      </div>
      
      <Footer />
    </div>
  );
}

export default App;