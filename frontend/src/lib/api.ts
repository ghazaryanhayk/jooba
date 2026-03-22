import type { FilterFormValues } from '@/components/search/filters/schema';
import type { CriteriaFormValues } from '@/components/ranking/criteria-schema';

export interface CandidateSchema {
  name: string;
  title: string;
  company: string;
  headline: string;
  summary: string;
  avatar_url: string | null;
  tier: 'A' | 'B' | 'C' | 'D' | 'F' | null;
  status: { approved: boolean; reason: string | null } | null;
}

export interface SearchResponse {
  candidates: CandidateSchema[];
  preview_count: number;
  total_count: number;
}

export interface RunSearchResponse extends SearchResponse {
  search_id: string;
}

export async function searchCandidates(
  filters: FilterFormValues,
  previewOnly = true,
): Promise<SearchResponse> {
  const response = await fetch('/api/search', {
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filters, preview_only: previewOnly }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail ?? `Search failed: ${response.status}`);
  }

  return response.json();
}

export interface RoleCandidatesResponse {
  candidates: CandidateSchema[];
  search_id: string;
}

export async function getRoleCandidates(roleId: string): Promise<RoleCandidatesResponse> {
  const response = await fetch(`/api/roles/${roleId}/candidates`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail ?? `Failed to fetch candidates: ${response.status}`);
  }

  return response.json();
}

export interface RankingResponse {
  candidates: CandidateSchema[];
  preview_count: number;
  total_count: number;
  stats: { approved: number; rejected: number };
  tiers: { A: number; B: number; C: number; D: number; F: number };
}

export async function runRanking(
  candidates: CandidateSchema[],
  criteria: CriteriaFormValues,
): Promise<RankingResponse> {
  const response = await fetch('/api/ranking/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      candidates,
      general_intuition: criteria.general_intuition,
      must_haves: criteria.must_haves.map((x) => x.value).filter(Boolean),
      nice_to_haves: criteria.nice_to_haves.map((x) => x.value).filter(Boolean),
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail ?? `Ranking failed: ${response.status}`);
  }

  return response.json();
}

export async function runFullSearch(
  roleId: string,
  filters: FilterFormValues,
): Promise<RunSearchResponse> {
  const response = await fetch(`/api/roles/${roleId}/searches/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filters }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail ?? `Full search failed: ${response.status}`);
  }

  return response.json();
}
