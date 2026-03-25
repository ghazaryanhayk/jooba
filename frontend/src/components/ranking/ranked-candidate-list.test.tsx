import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { makeCandidateFixture } from '@/test/mocks/fixtures';
import { renderWithProviders } from '@/test/test-utils';
import { RankedCandidateList } from './ranked-candidate-list';

// Mock react-router-dom since CandidateItem uses Link
vi.mock('react-router-dom', () => ({
  Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>,
}));

const defaultProps = {
  roleId: 'role-1',
  rankedCandidates: null as ReturnType<typeof makeCandidateFixture>[] | null,
  onPreview: vi.fn(),
  isPreviewing: false,
};

describe('RankedCandidateList', () => {
  it('sorts candidates by tier order (A first, F last)', async () => {
    const candidates = [
      makeCandidateFixture({ id: '1', name: 'Fiona', tier: 'F', status: { approved: false, reason: 'No' } }),
      makeCandidateFixture({ id: '2', name: 'Alice', tier: 'A', status: { approved: true, reason: 'Yes' } }),
      makeCandidateFixture({ id: '3', name: 'Charlie', tier: 'C', status: { approved: false, reason: 'Maybe' } }),
    ];
    renderWithProviders(
      <RankedCandidateList {...defaultProps} rankedCandidates={candidates} />,
    );
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });
    const aliceEl = screen.getByText('Alice');
    const charlieEl = screen.getByText('Charlie');
    const fionaEl = screen.getByText('Fiona');
    expect(aliceEl.compareDocumentPosition(charlieEl) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(charlieEl.compareDocumentPosition(fionaEl) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('places untiered candidates last', async () => {
    const candidates = [
      makeCandidateFixture({ id: '1', name: 'Zara', tier: null }),
      makeCandidateFixture({ id: '2', name: 'Beth', tier: 'B', status: { approved: true, reason: 'r' } }),
    ];
    renderWithProviders(
      <RankedCandidateList {...defaultProps} rankedCandidates={candidates} />,
    );
    await waitFor(() => {
      expect(screen.getByText('Beth')).toBeInTheDocument();
    });
    const beth = screen.getByText('Beth');
    const zara = screen.getByText('Zara');
    expect(beth.compareDocumentPosition(zara) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('shows stats bar when rankedCandidates is not null', async () => {
    const candidates = [
      makeCandidateFixture({ id: '1', name: 'Alice', tier: 'A', status: { approved: true, reason: 'r' } }),
    ];
    renderWithProviders(
      <RankedCandidateList {...defaultProps} rankedCandidates={candidates} />,
    );
    await waitFor(() => {
      expect(screen.getByText('Approved')).toBeInTheDocument();
    });
    expect(screen.getByText('Rejected')).toBeInTheDocument();
  });

  it('shows correct approval counts in stats', async () => {
    const candidates = [
      makeCandidateFixture({ id: '1', name: 'A1', tier: 'A', status: { approved: true, reason: 'r' } }),
      makeCandidateFixture({ id: '2', name: 'B1', tier: 'B', status: { approved: true, reason: 'r' } }),
      makeCandidateFixture({ id: '3', name: 'C1', tier: 'C', status: { approved: false, reason: 'r' } }),
    ];
    renderWithProviders(
      <RankedCandidateList {...defaultProps} rankedCandidates={candidates} />,
    );
    await waitFor(() => {
      expect(screen.getByText('Approved')).toBeInTheDocument();
    });
    const approvedEl = screen.getByText('Approved').closest('div');
    const rejectedEl = screen.getByText('Rejected').closest('div');
    expect(approvedEl?.textContent).toContain('2');
    expect(rejectedEl?.textContent).toContain('1');
  });

  it('does not show stats bar when rankedCandidates is null', () => {
    renderWithProviders(
      <RankedCandidateList {...defaultProps} rankedCandidates={null} />,
    );
    expect(screen.queryByText('Approved')).not.toBeInTheDocument();
  });

  it('renders candidate names', async () => {
    const candidates = [
      makeCandidateFixture({ id: '1', name: 'Alice Smith', tier: 'A', status: { approved: true, reason: 'r' } }),
    ];
    renderWithProviders(
      <RankedCandidateList {...defaultProps} rankedCandidates={candidates} />,
    );
    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    });
  });

  it('renders candidate titles and companies', async () => {
    const candidates = [
      makeCandidateFixture({
        id: '1',
        name: 'Alice',
        title: 'CTO',
        company: 'BigCo',
        tier: 'A',
        status: { approved: true, reason: 'r' },
      }),
    ];
    renderWithProviders(
      <RankedCandidateList {...defaultProps} rankedCandidates={candidates} />,
    );
    await waitFor(() => {
      expect(screen.getByText('CTO, BigCo')).toBeInTheDocument();
    });
  });

  it('shows empty-state message when no candidates at all', async () => {
    renderWithProviders(
      <RankedCandidateList {...defaultProps} rankedCandidates={[]} />,
    );
    await waitFor(() => {
      expect(
        screen.getByText('No candidates found. Run a full search first.'),
      ).toBeInTheDocument();
    });
  });

  it('renders multiple candidates', async () => {
    const candidates = [
      makeCandidateFixture({ id: '1', name: 'Alice', tier: 'A', status: { approved: true, reason: 'r' } }),
      makeCandidateFixture({ id: '2', name: 'Bob', tier: 'B', status: { approved: true, reason: 'r' } }),
      makeCandidateFixture({ id: '3', name: 'Charlie', tier: 'C', status: { approved: false, reason: 'r' } }),
    ];
    renderWithProviders(
      <RankedCandidateList {...defaultProps} rankedCandidates={candidates} />,
    );
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
  });

  it('renders approval reason', async () => {
    const candidates = [
      makeCandidateFixture({ id: '1', name: 'Alice', tier: 'A', status: { approved: true, reason: 'Excellent fit' } }),
    ];
    renderWithProviders(
      <RankedCandidateList {...defaultProps} rankedCandidates={candidates} />,
    );
    await waitFor(() => {
      expect(screen.getByText('Excellent fit')).toBeInTheDocument();
    });
  });
});
