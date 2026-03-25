import type { CandidateSchema } from '@/lib/api';

export function makeCandidateFixture(
  overrides?: Partial<CandidateSchema>,
): CandidateSchema {
  return {
    id: 'c-1',
    name: 'Alice Smith',
    title: 'Senior Engineer',
    company: 'Acme Corp',
    headline: 'Building things',
    summary: '10 years of experience in backend systems',
    avatar_url: null,
    tier: null,
    status: null,
    ...overrides,
  };
}
