import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('*/auth/v1/token', () => {
    return HttpResponse.json({
      access_token: 'test-token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'test-refresh-token'
    });
  }),

  http.get('*/rest/v1/machines', () => {
    return HttpResponse.json([
      {
        id: '1',
        name: 'Test Machine',
        status: 'active',
        owner_id: 'test-user',
        created_at: new Date().toISOString()
      }
    ]);
  }),

  http.get('*/rest/v1/machine_metrics', () => {
    return HttpResponse.json([
      {
        id: '1',
        machine_id: '1',
        cpu_usage: 45,
        memory_usage: 60,
        disk_usage: 75,
        timestamp: new Date().toISOString()
      }
    ]);
  })
];