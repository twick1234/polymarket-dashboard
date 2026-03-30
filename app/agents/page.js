'use client'

import { useEffect, useState } from 'react'

const MODEL_COLORS = {
  Opus: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  Sonnet: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  Haiku: 'text-green-400 bg-green-500/10 border-green-500/20',
}

const ROLE_ICONS = {
  'Gateway / Personal Assistant': '🏠',
  'Head Trader / Executor': '📈',
  'Deep Analyst / Macro Research': '🔬',
  'Risk Sentinel': '🛡️',
  'Quant / Reporting': '📊',
  'SRE / Infrastructure': '🔧',
  'Market Scanner': '👁️',
}

function timeAgo(iso) {
  if (!iso) return 'never'
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function AgentCard({ agent }) {
  const modelClass = MODEL_COLORS[agent.model] || 'text-gray-400 bg-gray-500/10 border-gray-500/20'
  const icon = ROLE_ICONS[agent.role] || '🤖'
  const lastUpdate = timeAgo(agent.last_memory_update)
  const isRecent = agent.last_memory_update &&
    (Date.now() - new Date(agent.last_memory_update).getTime()) < 3600000

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <div>
            <h3 className="font-bold text-white">{agent.name}</h3>
            <p className="text-xs text-gray-500">{agent.role}</p>
          </div>
        </div>
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${modelClass}`}>
          {agent.model}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className={`w-2 h-2 rounded-full ${isRecent ? 'bg-green-400' : 'bg-gray-600'}`}></span>
        <span className="text-xs text-gray-400">Memory updated {lastUpdate}</span>
      </div>

      {agent.memory_preview && agent.memory_preview !== 'No memory entries yet.' && (
        <div className="bg-gray-950 rounded p-2 max-h-32 overflow-y-auto">
          <pre className="text-xs text-gray-400 whitespace-pre-wrap font-mono leading-relaxed">
            {agent.memory_preview.slice(-300)}
          </pre>
        </div>
      )}
    </div>
  )
}

function DailyCycle({ cycle }) {
  if (!cycle || Object.keys(cycle).length === 0) return null

  const items = [
    { time: '24/7', label: 'Market Scanning', value: cycle.scanning, color: 'text-blue-400' },
    { time: 'Every trade', label: 'Risk Checks', value: cycle.vega_checks, color: 'text-yellow-400' },
    { time: 'On demand', label: 'Deep Analysis', value: cycle.meridian_deep, color: 'text-purple-400' },
    { time: 'Every 2m', label: 'Health Monitor', value: cycle.pulse_health, color: 'text-green-400' },
    { time: '21:00 UTC', label: 'EOD Review', value: cycle.eod_review, color: 'text-red-400' },
    { time: '22:00 UTC', label: 'Nightly Learning', value: cycle.nightly_learn, color: 'text-orange-400' },
    { time: '01:05 UTC', label: 'Daily Report', value: cycle.ledger_report, color: 'text-cyan-400' },
  ]

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
      <h2 className="text-lg font-bold text-white mb-3">Daily Cycle</h2>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className={`text-xs font-mono w-24 ${item.color}`}>{item.time}</span>
            <span className="text-sm text-gray-300">{item.label}</span>
            <span className="text-xs text-gray-500 ml-auto">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function PortfolioSummary({ portfolio }) {
  if (!portfolio || Object.keys(portfolio).length === 0) return null

  const stats = [
    { label: 'Total Trades', value: portfolio.total_trades || 0 },
    { label: 'Open Positions', value: portfolio.open_positions || 0 },
    { label: 'Realized P&L', value: `$${(portfolio.realized_pnl || 0).toFixed(2)}`, color: (portfolio.realized_pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400' },
    { label: 'Open Exposure', value: `$${(portfolio.open_exposure || 0).toFixed(2)}` },
    { label: 'Win Rate', value: `${portfolio.win_rate || 0}%` },
    { label: 'W/L', value: `${portfolio.wins || 0}/${portfolio.losses || 0}` },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {stats.map((s, i) => (
        <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">{s.label}</p>
          <p className={`text-lg font-bold ${s.color || 'text-white'}`}>{s.value}</p>
        </div>
      ))}
    </div>
  )
}

function CronLogs({ logs }) {
  if (!logs || Object.keys(logs).length === 0) return null

  const sections = [
    { key: 'pulse', label: 'Pulse (Health)', icon: '🔧' },
    { key: 'ledger', label: 'Ledger (Reports)', icon: '📊' },
    { key: 'eod_review', label: 'EOD Review', icon: '🌙' },
    { key: 'nightly_learn', label: 'Nightly Learning', icon: '🧠' },
  ]

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
      <h2 className="text-lg font-bold text-white mb-3">Recent Activity</h2>
      <div className="space-y-4">
        {sections.map(({ key, label, icon }) => {
          const entries = logs[key] || []
          if (entries.length === 0) return null
          return (
            <div key={key}>
              <h3 className="text-sm font-medium text-gray-400 mb-1">{icon} {label}</h3>
              <div className="bg-gray-950 rounded p-2 max-h-24 overflow-y-auto">
                {entries.map((line, i) => (
                  <p key={i} className="text-xs text-gray-500 font-mono">{line}</p>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function AgentsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastFetch, setLastFetch] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/agents')
        if (res.ok) {
          const json = await res.json()
          setData(json)
          setLastFetch(new Date())
        }
      } catch (e) {
        console.error('Failed to fetch agents:', e)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 60000) // Refresh every 60s
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 animate-pulse">Loading agent system...</div>
      </div>
    )
  }

  if (!data || !data.agents || data.agents.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400 text-lg">Agent system data not available yet.</p>
        <p className="text-gray-500 text-sm mt-2">Waiting for first agents.json export...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Agent Command Center</h1>
          <p className="text-sm text-gray-400">
            7 agents | 3 models | Autonomous trading desk
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">
            Last updated: {data.last_updated ? timeAgo(data.last_updated) : 'never'}
          </p>
          {lastFetch && (
            <p className="text-xs text-gray-600">
              Fetched: {lastFetch.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>

      {/* Portfolio Summary */}
      <PortfolioSummary portfolio={data.portfolio} />

      {/* Agent Grid */}
      <div>
        <h2 className="text-lg font-bold text-white mb-3">Agent Roster</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </div>

      {/* Two columns: Daily Cycle + Cron Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DailyCycle cycle={data.daily_cycle} />
        <CronLogs logs={data.cron_logs} />
      </div>

      {/* Architecture diagram */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
        <h2 className="text-lg font-bold text-white mb-3">Architecture</h2>
        <pre className="text-xs text-gray-400 font-mono leading-relaxed overflow-x-auto">{`
                     TELEGRAM (Mark)
                          │
                     ┌────▼────┐
                     │  HENRY  │  Sonnet — Gateway
                     └────┬────┘
                          │
            ┌─────────────┼──────────────┐
            │             │              │
     ┌──────▼─────┐ ┌────▼────┐  ┌──────▼─────┐
     │  POLYSING  │ │  PULSE  │  │   LEDGER   │
     │  Sonnet    │ │  Haiku  │  │   Sonnet   │
     │ Head Trader│ │   SRE   │  │   Quant    │
     └──┬─────┬───┘ └─────────┘  └────────────┘
        │     │
   ┌────▼┐ ┌──▼──────┐
   │ VEGA│ │  SCOUT  │
   │Haiku│ │  Haiku  │
   │ Risk│ │ Scanner │
   └─────┘ └────┬────┘
                │ (complex candidates)
           ┌────▼─────┐
           │ MERIDIAN │
           │  Opus    │
           │ Analyst  │
           └──────────┘
`}</pre>
      </div>
    </div>
  )
}
