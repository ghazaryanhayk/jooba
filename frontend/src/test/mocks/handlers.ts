import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/roles', () =>
    HttpResponse.json({ roles: [{ id: 'role-1', name: 'Backend Dev' }] }),
  ),

  http.post('/api/roles', async ({ request }) => {
    const body = (await request.json()) as { name: string };
    return HttpResponse.json({ id: 'role-new', name: body.name }, { status: 201 });
  }),

  http.post('/api/search', () =>
    HttpResponse.json({
      candidates: [
        {
          id: 'c-1',
          name: 'Alice Smith',
          title: 'Senior Engineer',
          company: 'Acme Corp',
          headline: 'Building things',
          summary: '10 years experience',
          avatar_url: null,
          tier: null,
          status: null,
        },
      ],
      preview_count: 1,
      total_count: 100,
    }),
  ),

  http.post('/api/ranking/run', () =>
    HttpResponse.json({
      candidates: [
        {
          id: 'c-1',
          name: 'Alice Smith',
          title: 'Senior Engineer',
          company: 'Acme Corp',
          headline: 'Building things',
          summary: '10 years experience',
          avatar_url: null,
          tier: 'A',
          status: { approved: true, reason: 'Great fit' },
        },
      ],
      preview_count: 1,
      total_count: 1,
      stats: { approved: 1, rejected: 0 },
      tiers: { A: 1, B: 0, C: 0, D: 0, F: 0 },
    }),
  ),

  http.get('/api/roles/:roleId/candidates', () =>
    HttpResponse.json({
      candidates: [
        {
          id: 'c-1',
          name: 'Alice Smith',
          title: 'Senior Engineer',
          company: 'Acme Corp',
          headline: 'Building things',
          summary: '10 years experience',
          avatar_url: null,
          tier: null,
          status: null,
        },
      ],
      search_id: 'search-1',
    }),
  ),

  http.get('/api/roles/:roleId/filters', () =>
    HttpResponse.json({ filters: null }),
  ),

  http.post('/api/roles/:roleId/searches/run', () =>
    HttpResponse.json({ search_id: 'search-1', status: 'running' }),
  ),

  http.get('/api/roles/:roleId/searches/:searchId/status', () =>
    HttpResponse.json({ status: 'completed' }),
  ),

  http.post('/api/roles/:roleId/searches/:searchId/stop', () =>
    HttpResponse.json({ status: 'stopped' }),
  ),
];
