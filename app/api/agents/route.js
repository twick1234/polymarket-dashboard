// API route — fetches agent system status from the bot's GitHub data export

export const revalidate = 60

const EMPTY_DATA = {
  agents: [],
  portfolio: {},
  cron_logs: {},
  vega_risk_log: [],
  daily_cycle: {},
  last_updated: new Date().toISOString(),
}

export async function GET() {
  const baseUrl = process.env.RESULTS_JSON_URL

  if (baseUrl) {
    // Derive agents.json URL from results.json URL
    const agentsUrl = baseUrl.replace('results.json', 'agents.json')
    try {
      const res = await fetch(agentsUrl, {
        next: { revalidate: 60 },
        headers: { 'Cache-Control': 'no-cache' },
      })
      if (res.ok) {
        const data = await res.json()
        return Response.json(data)
      }
    } catch (e) {
      console.error('Failed to fetch agents data:', e)
    }
  }

  return Response.json(EMPTY_DATA)
}
