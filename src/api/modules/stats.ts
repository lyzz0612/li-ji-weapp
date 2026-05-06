export function apiStatsDashboardGet(params?: { startDate?: string, endDate?: string }) {
  return request.Get<Api.StatsDashboard>('stats/dashboard', {
    params,
    hitSource: [/^book/, /^gift/, 'friend'],
  })
}
