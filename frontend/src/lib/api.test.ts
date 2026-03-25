import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import {
  createRole,
  getRoleCandidates,
  getRoleFilters,
  getRoles,
  getSearchStatus,
  runFullSearch,
  runRanking,
  searchCandidates,
  stopSearch,
} from './api';

// ── getRoles ─────────────────────────────────────────────────────

describe('getRoles', () => {
  it('returns roles on success', async () => {
    const data = await getRoles();
    expect(data.roles).toHaveLength(1);
    expect(data.roles[0].name).toBe('Backend Dev');
  });

  it('throws on error', async () => {
    server.use(http.get('/api/roles', () => new HttpResponse(null, { status: 500 })));
    await expect(getRoles()).rejects.toThrow();
  });
});

// ── createRole ───────────────────────────────────────────────────

describe('createRole', () => {
  it('returns created role', async () => {
    const role = await createRole('Frontend Dev');
    expect(role.name).toBe('Frontend Dev');
  });

  it('throws with detail on error', async () => {
    server.use(
      http.post('/api/roles', () =>
        HttpResponse.json({ detail: 'Name taken' }, { status: 409 }),
      ),
    );
    await expect(createRole('dup')).rejects.toThrow('Name taken');
  });
});

// ── searchCandidates ─────────────────────────────────────────────

describe('searchCandidates', () => {
  const filters = {
    title: [{ operator: 'is' as const, value: 'Eng', timeframe: 'current' as const }],
    country: [],
    experience: { from: '', to: '' },
  };

  it('returns candidates on success', async () => {
    const data = await searchCandidates(filters);
    expect(data.candidates).toHaveLength(1);
    expect(data.total_count).toBe(100);
  });

  it('throws with detail on error', async () => {
    server.use(
      http.post('/api/search', () =>
        HttpResponse.json({ detail: 'Bad filters' }, { status: 400 }),
      ),
    );
    await expect(searchCandidates(filters)).rejects.toThrow('Bad filters');
  });

  it('throws generic message on non-json error', async () => {
    server.use(
      http.post('/api/search', () => new HttpResponse('Internal Error', { status: 500 })),
    );
    await expect(searchCandidates(filters)).rejects.toThrow(/Search failed/);
  });
});

// ── getRoleCandidates ────────────────────────────────────────────

describe('getRoleCandidates', () => {
  it('returns candidates on success', async () => {
    const data = await getRoleCandidates('role-1');
    expect(data.candidates).toHaveLength(1);
    expect(data.search_id).toBe('search-1');
  });

  it('throws on error', async () => {
    server.use(
      http.get('/api/roles/:roleId/candidates', () =>
        HttpResponse.json({ detail: 'Not found' }, { status: 404 }),
      ),
    );
    await expect(getRoleCandidates('role-x')).rejects.toThrow('Not found');
  });
});

// ── runRanking ───────────────────────────────────────────────────

describe('runRanking', () => {
  const candidates = [
    {
      id: 'c-1',
      name: 'Alice',
      title: 'Eng',
      company: 'Co',
      headline: 'h',
      summary: 's',
      avatar_url: null,
      tier: null as 'A' | 'B' | 'C' | 'D' | 'F' | null,
      status: null,
    },
  ];

  it('returns ranking response', async () => {
    const data = await runRanking(candidates, {
      general_intuition: 'find devs',
      must_haves: [{ value: 'Python' }],
      nice_to_haves: [{ value: '' }],
    });
    expect(data.tiers.A).toBe(1);
    expect(data.stats.approved).toBe(1);
  });

  it('filters out empty must_haves and nice_to_haves', async () => {
    let capturedBody: any;
    server.use(
      http.post('/api/ranking/run', async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({
          candidates: [],
          preview_count: 0,
          total_count: 0,
          stats: { approved: 0, rejected: 0 },
          tiers: { A: 0, B: 0, C: 0, D: 0, F: 0 },
        });
      }),
    );
    await runRanking(candidates, {
      general_intuition: '',
      must_haves: [{ value: '' }, { value: 'Python' }],
      nice_to_haves: [{ value: '' }],
    });
    expect(capturedBody.must_haves).toEqual(['Python']);
    expect(capturedBody.nice_to_haves).toEqual([]);
  });

  it('throws on error', async () => {
    server.use(
      http.post('/api/ranking/run', () =>
        HttpResponse.json({ detail: 'API error' }, { status: 502 }),
      ),
    );
    await expect(
      runRanking(candidates, {
        general_intuition: '',
        must_haves: [],
        nice_to_haves: [],
      }),
    ).rejects.toThrow('API error');
  });
});

// ── getRoleFilters ───────────────────────────────────────────────

describe('getRoleFilters', () => {
  it('returns filters on success', async () => {
    const data = await getRoleFilters('role-1');
    expect(data.filters).toBeNull();
  });

  it('throws on error', async () => {
    server.use(
      http.get('/api/roles/:roleId/filters', () =>
        HttpResponse.json({ detail: 'Not found' }, { status: 404 }),
      ),
    );
    await expect(getRoleFilters('role-x')).rejects.toThrow('Not found');
  });
});

// ── runFullSearch ────────────────────────────────────────────────

describe('runFullSearch', () => {
  const filters = {
    title: [{ operator: 'is' as const, value: 'Eng', timeframe: 'current' as const }],
    country: [],
    experience: { from: '', to: '' },
  };

  it('returns search_id and status', async () => {
    const data = await runFullSearch('role-1', filters);
    expect(data.search_id).toBe('search-1');
    expect(data.status).toBe('running');
  });

  it('throws on error', async () => {
    server.use(
      http.post('/api/roles/:roleId/searches/run', () =>
        HttpResponse.json({ detail: 'Fail' }, { status: 500 }),
      ),
    );
    await expect(runFullSearch('role-x', filters)).rejects.toThrow('Fail');
  });
});

// ── getSearchStatus ──────────────────────────────────────────────

describe('getSearchStatus', () => {
  it('returns status', async () => {
    const data = await getSearchStatus('role-1', 'search-1');
    expect(data.status).toBe('completed');
  });

  it('throws on error', async () => {
    server.use(
      http.get('/api/roles/:roleId/searches/:searchId/status', () =>
        HttpResponse.json({ detail: 'Not found' }, { status: 404 }),
      ),
    );
    await expect(getSearchStatus('role-x', 'search-x')).rejects.toThrow('Not found');
  });
});

// ── stopSearch ───────────────────────────────────────────────────

describe('stopSearch', () => {
  it('returns status', async () => {
    const data = await stopSearch('role-1', 'search-1');
    expect(data.status).toBe('stopped');
  });

  it('throws on error', async () => {
    server.use(
      http.post('/api/roles/:roleId/searches/:searchId/stop', () =>
        HttpResponse.json({ detail: 'Fail' }, { status: 500 }),
      ),
    );
    await expect(stopSearch('role-x', 'search-x')).rejects.toThrow('Fail');
  });
});
