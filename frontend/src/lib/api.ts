import type { FilterFormValues } from '@/components/search/filters/schema';

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
