import type { FilterFormValues } from '@/components/search/filters/schema';
import type { CriteriaFormValues } from '@/components/ranking/criteria-schema';

export interface RoleSchema {
  id: string;
  name: string;
}

export interface RolesResponse {
  roles: RoleSchema[];
}

export async function getRoles(): Promise<RolesResponse> {
  const res = await fetch('/api/roles');
  if (!res.ok) throw new Error('Failed to fetch roles');
  return res.json();
}

export interface CandidateSchema {
  id: string;
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

export interface RunSearchResponse {
  search_id: string;
  status: string;
}

export interface SearchStatusResponse {
  status: string;
}

export async function searchCandidates(
  filters: FilterFormValues,
  previewOnly = true,
  previewLimit = 25,
): Promise<SearchResponse> {
  const response = await fetch('/api/search', {
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filters, preview_only: previewOnly, preview_limit: previewLimit }),
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

export interface RoleFiltersResponse {
  filters: FilterFormValues | null;
}

export async function getRoleFilters(roleId: string): Promise<RoleFiltersResponse> {
  const response = await fetch(`/api/roles/${roleId}/filters`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail ?? `Failed to fetch role filters: ${response.status}`);
  }

  return response.json();
}

export async function stopSearch(
  roleId: string,
  searchId: string,
): Promise<SearchStatusResponse> {
  const response = await fetch(`/api/roles/${roleId}/searches/${searchId}/stop`, {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail ?? `Failed to stop search: ${response.status}`);
  }

  return response.json();
}

export async function getSearchStatus(
  roleId: string,
  searchId: string,
): Promise<SearchStatusResponse> {
  const response = await fetch(`/api/roles/${roleId}/searches/${searchId}/status`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail ?? `Failed to fetch search status: ${response.status}`);
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
