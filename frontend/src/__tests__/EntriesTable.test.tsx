import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EntriesTable from '../components/EntriesTable';
import { deleteEntry } from '../api/entriesApi';

vi.mock('../api/entriesApi', () => ({
  deleteEntry: vi.fn(),
}));

describe('EntriesTable Component', () => {
  const mockEntries = [
    { id: 1, amount: 100, description: 'Test Entry 1' },
    { id: 2, amount: 200, description: 'Test Entry 2' },
  ];

  const mockOnEntryDeleted = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders table with entries', () => {
    render(
      <EntriesTable 
        entries={mockEntries} 
        loading={false} 
        onEntryDeleted={mockOnEntryDeleted} 
      />
    );
    
    expect(screen.getByText('Test Entry 1')).toBeInTheDocument();
    expect(screen.getByText('Test Entry 2')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(
      <EntriesTable 
        entries={[]} 
        loading={true} 
        onEntryDeleted={mockOnEntryDeleted} 
      />
    );
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('handles entry deletion', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    (deleteEntry as any).mockResolvedValueOnce({});

    render(
      <EntriesTable 
        entries={mockEntries} 
        loading={false} 
        onEntryDeleted={mockOnEntryDeleted} 
      />
    );
    
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);
    
    expect(deleteEntry).toHaveBeenCalledWith(1);
    await screen.findByText('Record deleted successfully!');
  });

  it('shows empty state message', () => {
    render(
      <EntriesTable 
        entries={[]} 
        loading={false} 
        onEntryDeleted={mockOnEntryDeleted} 
      />
    );
    
    expect(screen.getByText('No entries found')).toBeInTheDocument();
  });
});