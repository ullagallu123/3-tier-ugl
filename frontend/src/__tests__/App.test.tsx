import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';
import { fetchEntries } from '../api/entriesApi';

vi.mock('../api/entriesApi', () => ({
  fetchEntries: vi.fn(),
}));

describe('App Component', () => {
  it('renders header and footer', () => {
    render(<App />);
    expect(screen.getByText('CRUD Application')).toBeInTheDocument();
    expect(screen.getByText(/All rights reserved/)).toBeInTheDocument();
  });

  it('displays loading state while fetching entries', () => {
    render(<App />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('displays entries after loading', async () => {
    const mockEntries = [
      { id: 1, amount: 100, description: 'Test Entry' },
    ];
    
    (fetchEntries as any).mockResolvedValueOnce(mockEntries);
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Entry')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
    });
  });
});