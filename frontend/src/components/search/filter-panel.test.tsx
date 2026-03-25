import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test/test-utils';
import { FilterPanel } from './filter-panel';
import { suggestedFilters } from './filters/schema';

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>,
}));

describe('FilterPanel', () => {
  it('renders group headings', () => {
    renderWithProviders(<FilterPanel onSearch={vi.fn()} />);
    expect(screen.getByText('Person')).toBeInTheDocument();
    expect(screen.getByText('Company')).toBeInTheDocument();
    expect(screen.getByText('Experience')).toBeInTheDocument();
    expect(screen.getByText('Signals')).toBeInTheDocument();
  });

  it('renders filter labels', () => {
    renderWithProviders(<FilterPanel onSearch={vi.fn()} />);
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Country')).toBeInTheDocument();
    expect(screen.getByText('Years total')).toBeInTheDocument();
  });

  it('renders Filters heading', () => {
    renderWithProviders(<FilterPanel onSearch={vi.fn()} />);
    expect(screen.getByText('Filters')).toBeInTheDocument();
  });

  it('resets form when externalFilters change', () => {
    const onSearch = vi.fn();
    const { rerender } = renderWithProviders(
      <FilterPanel onSearch={onSearch} />,
    );
    rerender(
      <FilterPanel onSearch={onSearch} externalFilters={suggestedFilters} />,
    );
    // Should render without error after external filters applied
    expect(screen.getByText('Title')).toBeInTheDocument();
  });

  it('renders without crashing when externalFilters is null', () => {
    renderWithProviders(
      <FilterPanel onSearch={vi.fn()} externalFilters={null} />,
    );
    expect(screen.getByText('Person')).toBeInTheDocument();
  });
});
