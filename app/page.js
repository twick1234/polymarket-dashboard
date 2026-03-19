'use client'

import { useEffect, useState, useCallback } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const REFRESH_INTERVAL = 30000  // 30 seconds

function StatCard({ label, value, sub, color = 'text-white' }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  )
}

function TradeRow({ trade, index }) {
  const isWin = trade.pnl > 0
  return (
    <tr className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
      <td className="py-3 px-4 text-gray-400 text-sm">{index + 1}</td>
      <td className="py-3 px-4">
        <p className="text-sm text-gray-200 truncate max-w-xs">{trade.question}</p>
        <p className="text-xs text-gray-500 mt-0.5">{trade.opened_at ? new Date(trade.opened_at).toLocaleString() : '—'}</p>
      </td>
      <td className="py-3 px-4">
        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
          trade.direction === 'YES' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'
        }`}>
          {trade.direction}
        </span>
      </td>
      <td className="py-3 px-4 text-sm text-gray-300">{trade.entry_price?.toFixed(3)}</td>
      <td className="py-3 px-4 text-sm">
        <span className={`font-medium ${isWin ? 'text-green-400' : 'text-red-400'}`}>
          {trade.edge > 0 ? '+' : ''}{(trade.edge * 100).toFixed(1)}%
        </span>
      </td>
      <td className="py-3 px-4 text-sm">
        <span className={`font-bold ${isWin ? 'text-green-400' : 'text-red-400'}`}>
          ${trade.pnl > 0 ? '+' : ''}{trade.pnl?.toFixed(2)}
        </span>
      </td>
      <td className="py-3 px-4">
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
          trade.status === 'closed_profit' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
          trade.status === 'closed_loss' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
          trade.status === 'open' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
          'bg-gray-500/10 text-gray-400 border border-gray-500/20'
        }`}>
          {trade.status === 'closed_profit' ? 'WIN' :
           trade.status === 'closed_loss' ? 'LOSS' :
           trade.status === 'open' ? 'OPEN' : trade.status?.toUpperCase()}
        </span>
      </td>
    </tr>
  )
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [lastRefresh, setLastRefresh] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchData = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const res = await fetch('/api/results', { cache: 'no-store' })
      const json = await res.json()
      setData(json)
      setLastRefresh(new Date())
    } catch (e) {
      console.error(e)
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchData])

  const s = data?.summary
  const trades = data?.trades || []
  const pnlHistory = data?.pnl_history || []
  const isWaiting = data?.status === 'waiting' || !s || s.total_trades === 0

  const pnlColor = s?.total_pnl >= 0 ? 'text-green-400' : 'text-red-400'
  const winRateColor = s?.win_rate_pct >= 50 ? 'text-green-400' : 'text-red-400'

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Live Paper Trading</h2>
          <p className="text-gray-400 mt-1">
            Claude AI scanning Polymarket every 30s for mispriced markets
          </p>
        </div>
        <div className="text-right">
          <button
            onClick={fetchData}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1.5"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isRefreshing ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></span>
            {lastRefresh ? `Updated ${lastRefresh.toLocaleTimeString()}` : 'Loading...'}
          </button>
          <p className="text-xs text-gray-600 mt-1">Auto-refreshes every 30s</p>
        </div>
      </div>

      {/* Waiting state */}
      {isWaiting && (
        <div className="border border-yellow-500/20 bg-yellow-500/5 rounded-xl p-6 text-center">
          <p className="text-4xl mb-3">⏳</p>
          <h3 className="text-yellow-400 font-semibold">Waiting for first trades</h3>
          <p className="text-gray-400 text-sm mt-2">
            Start the bot with: <code className="bg-gray-800 px-2 py-0.5 rounded text-green-400">python -m src.main --mode paper --capital 1000</code>
          </p>
          <p className="text-gray-500 text-xs mt-2">This dashboard auto-updates as trades come in</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Portfolio Value"
          value={`$${((s?.current_capital) || 1000).toLocaleString('en', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
          sub={`Started with $${(s?.starting_capital || 1000).toLocaleString()}`}
        />
        <StatCard
          label="Total P&L"
          value={`${s?.total_pnl >= 0 ? '+' : ''}$${(s?.total_pnl || 0).toFixed(2)}`}
          sub={`${s?.total_trades || 0} closed trades`}
          color={s?.total_pnl >= 0 ? 'text-green-400' : 'text-red-400'}
        />
        <StatCard
          label="Win Rate"
          value={`${(s?.win_rate_pct || 0).toFixed(1)}%`}
          sub={`${s?.wins || 0}W / ${s?.losses || 0}L`}
          color={winRateColor}
        />
        <StatCard
          label="Open Positions"
          value={s?.open_positions || 0}
          sub={`Avg edge: ${((s?.avg_edge || 0) * 100).toFixed(1)}%`}
          color="text-yellow-400"
        />
      </div>

      {/* P&L Chart */}
      {pnlHistory.length > 1 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Cumulative P&L</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={pnlHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickFormatter={v => `$${v}`} />
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }}
                labelStyle={{ color: '#9ca3af' }}
                formatter={v => [`$${v.toFixed(2)}`, 'P&L']}
              />
              <Line
                type="monotone"
                dataKey="pnl"
                stroke={s?.total_pnl >= 0 ? '#34d399' : '#f87171'}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Architecture section */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">How It Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { step: '1', icon: '📡', title: 'Scan', desc: 'Fetches all active Polymarket markets every 30s, filtering for liquidity & time-to-expiry' },
            { step: '2', icon: '🧠', title: 'Analyse', desc: 'Claude reads each market question and estimates the TRUE probability based on current knowledge' },
            { step: '3', icon: '📊', title: 'Edge', desc: 'Compares Claude\'s estimate vs market price. Trades when edge > 8% with >60% confidence' },
            { step: '4', icon: '⚡', title: 'Execute', desc: 'Paper trades YES or NO shares using Kelly Criterion sizing. Max 5% of capital per trade' },
          ].map(item => (
            <div key={item.step} className="flex flex-col gap-2 p-4 bg-gray-800/50 rounded-lg">
              <span className="text-2xl">{item.icon}</span>
              <p className="text-white font-semibold text-sm">{item.step}. {item.title}</p>
              <p className="text-gray-400 text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Trade Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-300">
            Trade History {trades.length > 0 && <span className="text-gray-500">({trades.length})</span>}
          </h3>
          {trades.length > 0 && (
            <span className="text-xs text-gray-500">Most recent first</span>
          )}
        </div>
        {trades.length === 0 ? (
          <div className="py-12 text-center text-gray-600">
            <p className="text-3xl mb-2">📋</p>
            <p className="text-sm">No trades yet — start the bot to begin paper trading</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-800">
                  <th className="py-3 px-4 text-left">#</th>
                  <th className="py-3 px-4 text-left">Market</th>
                  <th className="py-3 px-4 text-left">Dir</th>
                  <th className="py-3 px-4 text-left">Entry</th>
                  <th className="py-3 px-4 text-left">Edge</th>
                  <th className="py-3 px-4 text-left">P&L</th>
                  <th className="py-3 px-4 text-left">Result</th>
                </tr>
              </thead>
              <tbody>
                {[...trades].reverse().map((trade, i) => (
                  <TradeRow key={trade.trade_id || i} trade={trade} index={i} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-600 pb-4">
        <p>Built by twick1234 · Powered by Claude AI · Paper trading only — no real money</p>
      </div>
    </div>
  )
}
