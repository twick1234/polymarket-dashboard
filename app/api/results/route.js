// API route — fetches trade data from the bot's GitHub data export
// Falls back to demo data if no real data is available yet

export const revalidate = 60  // Revalidate every 60 seconds

const DEMO_DATA = {
  summary: {
    total_trades: 0,
    open_positions: 0,
    wins: 0,
    losses: 0,
    win_rate_pct: 0,
    total_pnl: 0,
    avg_pnl: 0,
    best_trade: 0,
    worst_trade: 0,
    avg_edge: 0,
    starting_capital: 1000,
    current_capital: 1000,
  },
  trades: [],
  pnl_history: [],
  last_updated: new Date().toISOString(),
  status: "waiting",
}

export async function GET() {
  const dataUrl = process.env.RESULTS_JSON_URL

  if (dataUrl) {
    try {
      const res = await fetch(dataUrl, {
        next: { revalidate: 60 },
        headers: { 'Cache-Control': 'no-cache' },
      })
      if (res.ok) {
        const data = await res.json()
        return Response.json(data)
      }
    } catch (e) {
      console.error('Failed to fetch live data:', e)
    }
  }

  return Response.json(DEMO_DATA)
}
