export const metadata = {
  title: 'Strategy & Risk — Polymarket Claude Bot',
}

function Section({ title, children }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
      <h2 className="text-base font-semibold text-white border-b border-gray-800 pb-3">{title}</h2>
      {children}
    </div>
  )
}

function RuleRow({ rule, value, what }) {
  return (
    <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-800/50 last:border-0">
      <p className="text-sm text-gray-300 font-medium">{rule}</p>
      <p className="text-sm text-yellow-400 font-mono">{value}</p>
      <p className="text-sm text-gray-400">{what}</p>
    </div>
  )
}

export default function StrategyPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Strategy & Risk Documentation</h1>
        <p className="text-gray-400 mt-1">How the bot makes decisions — fully automated, no manual intervention</p>
      </div>

      {/* What is this */}
      <Section title="What Is This?">
        <p className="text-gray-300 text-sm leading-relaxed">
          This is an AI-powered <strong className="text-white">paper trading bot</strong> — it trades with simulated money
          on <a href="https://polymarket.com" className="text-blue-400 hover:underline">Polymarket</a>, a prediction market
          where people bet on real-world events (politics, economics, sports, crypto).
        </p>
        <p className="text-gray-300 text-sm leading-relaxed">
          The core idea: markets are sometimes <strong className="text-white">wrong</strong>. When the crowd prices an
          event at 35% but Claude estimates the true probability is 65%, that 30% gap is the <strong className="text-white">edge</strong> —
          and we trade it.
        </p>
        <div className="bg-gray-800/50 rounded-lg p-4 mt-2">
          <p className="text-xs text-gray-400 font-mono">
            Example: "Will the Fed cut rates by June 2026?"<br/>
            Market price: YES at 35¢ (crowd thinks 35% chance)<br/>
            Claude estimate: 62% true probability<br/>
            Edge: +27% → Buy YES shares at 35¢, target exit at 87.5¢
          </p>
        </div>
      </Section>

      {/* The 4-step process */}
      <Section title="The 4-Step Trading Process">
        <div className="space-y-4">
          {[
            {
              step: '1', icon: '📡', title: 'Scan (every 30 seconds)',
              detail: 'Fetches all active Polymarket markets via their public API. Filters out markets with less than $5,000 liquidity, prices near 0% or 100% (already certain), and markets expiring in less than 1 day or more than 90 days. Scores remaining markets by volume, liquidity, and price uncertainty. Takes top 50 candidates.'
            },
            {
              step: '2', icon: '🧠', title: 'Analyse with Claude',
              detail: 'Sends each candidate market to Claude (claude-sonnet-4-6) with the question, description, current price, liquidity, and resolution date. Claude responds with: estimated true probability (0-1), confidence score (0-1), reasoning, key factors, and data freshness. Results are cached for 2 minutes to control API costs.'
            },
            {
              step: '3', icon: '📊', title: 'Edge & Risk Check',
              detail: 'Calculates edge = Claude probability − market price. Only trades if: edge > 8%, confidence > 60%, data freshness is not "unknown". Then checks portfolio rules: max drawdown not breached, under 10 open positions, fewer than 5 consecutive losses. Sizes the position using Kelly Criterion at 25% (conservative fractional Kelly), capped at 5% of capital.'
            },
            {
              step: '4', icon: '⚡', title: 'Paper Execute & Monitor',
              detail: 'Simulates buying YES or NO shares at the real current market price (from live Polymarket order book) with 2% simulated slippage. Monitors every 30 seconds. Closes automatically when: price hits 2.5× entry (take profit), price drops 40% (stop loss), or trade is 72 hours old (max hold time).'
            },
          ].map(item => (
            <div key={item.step} className="flex gap-4 p-4 bg-gray-800/40 rounded-lg">
              <span className="text-2xl flex-shrink-0">{item.icon}</span>
              <div>
                <p className="text-white font-semibold text-sm mb-1">{item.step}. {item.title}</p>
                <p className="text-gray-400 text-xs leading-relaxed">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Per-trade risk */}
      <Section title="Per-Trade Risk Rules">
        <div className="grid grid-cols-3 gap-4 pb-2">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Rule</p>
          <p className="text-xs text-gray-500 uppercase tracking-wider">Setting</p>
          <p className="text-xs text-gray-500 uppercase tracking-wider">Effect</p>
        </div>
        <RuleRow rule="Take Profit" value="2.5× entry price" what="Auto-sells when market price reaches target — locks in profit" />
        <RuleRow rule="Stop Loss" value="40% of position" what="Auto-sells if trade moves badly against us — limits downside" />
        <RuleRow rule="Max Hold Time" value="72 hours" what="Force-closes any trade still open after 3 days regardless of price" />
        <RuleRow rule="Max Position Size" value="5% of capital" what="Never more than $50 on a single trade (on $1,000 capital)" />
        <RuleRow rule="Min Edge Required" value="> 8%" what="Claude's probability must beat market price by at least 8%" />
        <RuleRow rule="Min Confidence" value="> 60%" what="Claude must be at least 60% confident in its estimate" />
        <RuleRow rule="Position Sizing" value="Kelly ÷ 4 (25%)" what="Bets proportionally to edge — bigger edge = bigger position, within the 5% cap" />
      </Section>

      {/* Portfolio-wide risk */}
      <Section title="Portfolio-Wide Safety Rules">
        <div className="grid grid-cols-3 gap-4 pb-2">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Rule</p>
          <p className="text-xs text-gray-500 uppercase tracking-wider">Setting</p>
          <p className="text-xs text-gray-500 uppercase tracking-wider">Effect</p>
        </div>
        <RuleRow rule="Max Drawdown" value="15%" what="Stops ALL trading if portfolio falls below $850. Protects capital." />
        <RuleRow rule="Max Open Positions" value="10" what="Won't open new trades until existing ones close — controls exposure" />
        <RuleRow rule="Consecutive Losses" value="5 in a row" what="Pauses trading after 5 consecutive losses — cooling off period" />
        <RuleRow rule="Min Market Liquidity" value="$5,000 USDC" what="Only trades markets with enough depth to enter and exit cleanly" />
      </Section>

      {/* Tech stack */}
      <Section title="Technology Stack">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { name: 'Claude Sonnet 4.6', role: 'Probability estimation AI', color: 'text-orange-400' },
            { name: 'Python 3.12', role: 'Bot runtime', color: 'text-blue-400' },
            { name: 'Polymarket CLOB API', role: 'Market data + execution', color: 'text-green-400' },
            { name: 'SQLite', role: 'Local trade storage', color: 'text-purple-400' },
            { name: 'Next.js + Vercel', role: 'This dashboard', color: 'text-gray-300' },
            { name: 'Kelly Criterion', role: 'Position sizing math', color: 'text-yellow-400' },
          ].map(item => (
            <div key={item.name} className="bg-gray-800/50 rounded-lg p-3">
              <p className={`text-sm font-semibold ${item.color}`}>{item.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{item.role}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Disclaimer */}
      <div className="border border-gray-800 rounded-xl p-5 text-center">
        <p className="text-xs text-gray-500 leading-relaxed">
          ⚠️ <strong className="text-gray-400">Paper trading only</strong> — no real money is used.
          This is a research and learning exercise. Prediction market trading carries significant financial risk.
          Past paper trading performance does not guarantee future live trading results.
          This is not financial advice.
        </p>
      </div>
    </div>
  )
}
