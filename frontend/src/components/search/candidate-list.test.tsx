import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { server } from '@/test/mocks/server';
import { renderWithProviders } from '@/test/test-utils';
import { CandidateList } from './candidate-list';

const filters = {
  title: [{ operator: 'is' as const, value: 'Eng', timeframe: 'current' as const }],
  country: [],
  experience: { from: '', to: '' },
};

const defaultProps = {
  roleId: 'role-1',
  filters: null as typeof filters | null,
  savedFilters: null as typeof filters | null,
  onApplyFilters: vi.fn(),
};

// Mock react-router-dom for Link component used in CandidateItem
vi.mock('react-router-dom', () => ({
  Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>,
}));

describe('CandidateList', () => {
  it('shows empty state with suggested filters when no filters applied', () => {
    renderWithProviders(<CandidateList {...defaultProps} />);
    expect(
      screen.getByText('Apply filters and search to see candidates.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Apply suggested filters')).toBeInTheDocument();
  });

  it('shows empty state with saved filters button when savedFilters exist', () => {
    renderWithProviders(
      <CandidateList {...defaultProps} savedFilters={filters} />,
    );
    expect(screen.getByText('Apply last search filters')).toBeInTheDocument();
  });

  it('calls onApplyFilters when suggested filters button is clicked', async () => {
    const user = userEvent.setup();
    const onApply = vi.fn();
    renderWithProviders(
      <CandidateList {...defaultProps} onApplyFilters={onApply} />,
    );
    await user.click(screen.getByText('Apply suggested filters'));
    expect(onApply).toHaveBeenCalledOnce();
  });

  it('shows loading skeletons when filters are provided', () => {
    renderWithProviders(<CandidateList {...defaultProps} filters={filters} />);
    expect(document.querySelectorAll('[class*="animate-pulse"]').length).toBeGreaterThan(0);
  });

  it('renders candidates after loading', async () => {
    renderWithProviders(<CandidateList {...defaultProps} filters={filters} />);
    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    });
  });

  it('shows preview count info', async () => {
    renderWithProviders(<CandidateList {...defaultProps} filters={filters} />);
    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    });
    // "Previewing ... out of 100"
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('shows Run full search button', async () => {
    renderWithProviders(<CandidateList {...defaultProps} filters={filters} />);
    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    });
    expect(screen.getByText('Run full search')).toBeInTheDocument();
  });

  it('disables Run full search when no filters', () => {
    renderWithProviders(<CandidateList {...defaultProps} />);
    const btn = screen.getByText('Run full search');
    expect(btn).toBeDisabled();
  });

  it('shows error state', async () => {
    server.use(
      http.post('/api/search', () =>
        HttpResponse.json({ detail: 'Something went wrong' }, { status: 500 }),
      ),
    );
    renderWithProviders(<CandidateList {...defaultProps} filters={filters} />);
    await waitFor(() => {
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  it('updates search status context', async () => {
    const setSearchStatus = vi.fn();
    renderWithProviders(<CandidateList {...defaultProps} filters={filters} />, {
      searchStatus: { searchStatus: null, setSearchStatus },
    });
    await waitFor(() => {
      expect(setSearchStatus).toHaveBeenCalled();
    });
  });

  it('renders candidate headline', async () => {
    renderWithProviders(<CandidateList {...defaultProps} filters={filters} />);
    await waitFor(() => {
      expect(screen.getByText('Building things')).toBeInTheDocument();
    });
  });
});
