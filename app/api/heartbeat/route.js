// Fetches heartbeat.json from the polymarket-data GitHub repo.
// Returns bot status: running / paused / offline + timestamp.

export const revalidate = 0  // Always fresh — no caching

const OFFLINE = {
  status: "offline",
  timestamp: null,
  uptime_secs: 0,
  open_positions: 0,
  total_trades: 0,
  paused: false,
}

export async function GET() {
  const heartbeatUrl = process.env.HEARTBEAT_JSON_URL

  if (heartbeatUrl) {
    try {
      const res = await fetch(heartbeatUrl, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      })
      if (res.ok) {
        const data = await res.json()
        return Response.json(data)
      }
    } catch (e) {
      console.error('Failed to fetch heartbeat:', e)
    }
  }

  return Response.json(OFFLINE)
}
