import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EntryForm from '../components/EntryForm';
import { addEntry } from '../api/entriesApi';

vi.mock('../api/entriesApi', () => ({
  addEntry: vi.fn(),
}));

describe('EntryForm Component', () => {
  const mockOnEntryAdded = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form inputs', () => {
    render(<EntryForm onEntryAdded={mockOnEntryAdded} />);
    expect(screen.getByLabelText(/Amount:/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description:/)).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    render(<EntryForm onEntryAdded={mockOnEntryAdded} />);
    
    const amountInput = screen.getByLabelText(/Amount:/);
    const descriptionInput = screen.getByLabelText(/Description:/);
    
    fireEvent.change(amountInput, { target: { value: '100' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test Entry' } });
    
    fireEvent.click(screen.getByText('Add Entry'));
    
    expect(addEntry).toHaveBeenCalledWith(100, 'Test Entry');
  });

  it('shows success message after successful submission', async () => {
    (addEntry as any).mockResolvedValueOnce({});
    
    render(<EntryForm onEntryAdded={mockOnEntryAdded} />);
    
    fireEvent.change(screen.getByLabelText(/Amount:/), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/Description:/), { target: { value: 'Test Entry' } });
    fireEvent.click(screen.getByText('Add Entry'));
    
    await screen.findByText('Record added successfully!');
  });
});