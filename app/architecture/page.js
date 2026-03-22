export const metadata = {
  title: 'Architecture — Polymarket Claude Bot',
}

function Section({ title, children }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
      <h2 className="text-base font-semibold text-white border-b border-gray-800 pb-3">{title}</h2>
      {children}
    </div>
  )
}

function Component({ name, role, detail, color = 'text-blue-400' }) {
  return (
    <div className="p-4 bg-gray-800/40 rounded-lg border border-gray-700/50">
      <p className={`text-sm font-bold ${color}`}>{name}</p>
      <p className="text-xs text-white mt-0.5">{role}</p>
      <p className="text-xs text-gray-400 mt-1 leading-relaxed">{detail}</p>
    </div>
  )
}

export default function ArchitecturePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">System Architecture</h1>
        <p className="text-gray-400 mt-1">How all the pieces fit together — from market data to trade execution</p>
      </div>

      {/* High-level diagram */}
      <Section title="System Overview">
        <p className="text-sm text-gray-300 leading-relaxed">
          The bot runs entirely on your local machine. It reads real market data from Polymarket,
          asks Claude AI to estimate probabilities, and simulates trades with paper money.
          Results are exported every 5 minutes to GitHub and displayed here on Vercel.
        </p>
        <div className="bg-black/60 rounded-lg p-5 font-mono text-xs text-green-400 leading-loose overflow-x-auto">
          <pre>{`
  ┌─────────────────────────────────────────────────────────────┐
  │                     YOUR LAPTOP                             │
  │                                                             │
  │   ┌──────────────┐    ┌──────────────┐   ┌──────────────┐  │
  │   │   Scanner    │───▶│    Claude    │──▶│    Risk      │  │
  │   │              │    │   Analyzer   │   │   Manager    │  │
  │   │ Reads real   │    │              │   │              │  │
  │   │ market data  │    │ Estimates    │   │ Kelly sizing │  │
  │   │ every 5 min  │    │ true prob.   │   │ Drawdown     │  │
  │   └──────────────┘    └──────────────┘   └──────┬───────┘  │
  │          │                                       │          │
  │          │ Polymarket                            ▼          │
  │          │ CLOB API              ┌──────────────────────┐   │
  │          │                       │   Order Executor     │   │
  │          │                       │                      │   │
  │          │                       │  Paper trades        │   │
  │          │                       │  Monitor positions   │   │
  │          │                       │  Close on targets    │   │
  │          │                       └──────────┬───────────┘   │
  │          │                                  │               │
  │          │                       ┌──────────▼───────────┐   │
  │          │                       │   SQLite Database    │   │
  │          │                       │   data/trades.db     │   │
  │          └───────────────────────┤                      │   │
  │                                  └──────────────────────┘   │
  └─────────────────────────────────────────────────────────────┘
           │ every 5 min (cron)
           ▼
  ┌─────────────────────┐      ┌─────────────────────────────┐
  │   polymarket-data   │─────▶│   Vercel Dashboard          │
  │   GitHub (public)   │      │   polymarket-dashboard      │
  │   results.json      │      │   (this site)               │
  └─────────────────────┘      └─────────────────────────────┘
`}</pre>
        </div>
      </Section>

      {/* Components */}
      <Section title="Core Components">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Component
            name="MarketScanner"
            role="src/scanner/market_scanner.py"
            color="text-blue-400"
            detail="Fetches up to 1,000 markets from Polymarket every 5 minutes. Filters by liquidity (>$5k), price range (5%–95%), and days to expiry (1–90 days). Scores markets by volume, liquidity, and uncertainty. Sends top 15 candidates to Claude."
          />
          <Component
            name="ClaudeAnalyzer"
            role="src/clients/claude_client.py"
            color="text-orange-400"
            detail="Sends each candidate market to Claude Sonnet 4.6 with the question, current price, and context. Claude returns: estimated probability, confidence score, reasoning, and key factors. Results cached for 2 minutes to control API costs."
          />
          <Component
            name="RiskManager"
            role="src/risk/risk_manager.py"
            color="text-red-400"
            detail="Approves or rejects each trade based on: edge > 8%, confidence > 60%, portfolio drawdown < 15%, open positions < 10, consecutive losses < 5. Sizes positions using Kelly Criterion at 25% (conservative fractional Kelly), max 5% of capital."
          />
          <Component
            name="OrderExecutor"
            role="src/execution/order_executor.py"
            color="text-green-400"
            detail="Manages full trade lifecycle. Places paper orders at real market prices (with 2% simulated slippage). Monitors positions every 5 minutes. Closes trades on take-profit (2.5× entry), stop-loss (−40%), or after 72 hours maximum hold."
          />
          <Component
            name="PaperPolymarketClient"
            role="src/clients/polymarket_client.py"
            color="text-purple-400"
            detail="Wraps the real Polymarket CLOB API. In paper mode, reads live market data (prices, order books, liquidity) but simulates order execution locally. No wallet or private key required. Includes polite rate limiting: 1s delay between pages, max 2 pages per scan."
          />
          <Component
            name="TradeDB"
            role="src/utils/db.py"
            color="text-yellow-400"
            detail="SQLite persistence layer. Saves every closed trade to data/trades.db using SQLAlchemy. Upserts on trade_id so re-runs are idempotent. Provides summary stats and full history queries."
          />
        </div>
      </Section>

      {/* Data pipeline */}
      <Section title="Dashboard Data Pipeline">
        <div className="space-y-3">
          {[
            { step: '1', title: 'Bot runs locally', desc: 'Python process on your laptop reads Polymarket data, calls Claude, paper trades. All results saved to data/trades.db (SQLite).', color: 'bg-blue-500' },
            { step: '2', title: 'Cron exports every 5 min', desc: 'scripts/push_results_cron.sh runs via cron. Calls export_results.py which reads the SQLite DB and writes results.json (trades, P&L, logs).', color: 'bg-yellow-500' },
            { step: '3', title: 'Pushed to public GitHub', desc: 'results.json is committed and pushed to github.com/twick1234/polymarket-data — a public repo that acts as a simple data store.', color: 'bg-orange-500' },
            { step: '4', title: 'Vercel reads GitHub', desc: 'This dashboard fetches the raw JSON from GitHub every 5 minutes via the /api/results route. No database needed on Vercel — GitHub is the data layer.', color: 'bg-green-500' },
          ].map(item => (
            <div key={item.step} className="flex gap-4 items-start">
              <span className={`flex-shrink-0 w-7 h-7 rounded-full ${item.color} text-black text-xs font-bold flex items-center justify-center`}>{item.step}</span>
              <div>
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* API calls */}
      <Section title="External API Calls">
        <div className="space-y-2">
          {[
            { api: 'Polymarket CLOB API', url: 'clob.polymarket.com', calls: '2 pages × every 5 min', purpose: 'Fetch active markets, prices, order books', auth: 'None (public)' },
            { api: 'Polymarket Gamma API', url: 'gamma-api.polymarket.com', calls: 'On demand', purpose: 'Market metadata, tags, descriptions', auth: 'None (public)' },
            { api: 'Anthropic Claude API', url: 'api.anthropic.com', calls: 'Up to 15 × every 5 min', purpose: 'Probability estimation for candidate markets', auth: 'ANTHROPIC_API_KEY' },
          ].map(item => (
            <div key={item.api} className="grid grid-cols-4 gap-3 py-3 border-b border-gray-800/50 last:border-0 text-xs">
              <div>
                <p className="text-white font-medium">{item.api}</p>
                <p className="text-gray-500 font-mono">{item.url}</p>
              </div>
              <p className="text-yellow-400 font-mono">{item.calls}</p>
              <p className="text-gray-400">{item.purpose}</p>
              <p className="text-green-400">{item.auth}</p>
            </div>
          ))}
          <div className="grid grid-cols-4 gap-3 pt-1 text-xs">
            <p className="text-gray-600">Service</p>
            <p className="text-gray-600">Frequency</p>
            <p className="text-gray-600">Purpose</p>
            <p className="text-gray-600">Auth</p>
          </div>
        </div>
      </Section>

      {/* File structure */}
      <Section title="Key Files">
        <div className="bg-black/60 rounded-lg p-5 font-mono text-xs text-gray-300 leading-loose overflow-x-auto">
          <pre>{`polymarket-claude-bot/
├── src/
│   ├── main.py                   # Entry point — CLI (run/balance/markets)
│   ├── bot.py                    # Orchestrator — wires all components
│   ├── clients/
│   │   ├── polymarket_client.py  # Polymarket API + paper trading
│   │   └── claude_client.py      # Claude probability estimation
│   ├── scanner/
│   │   └── market_scanner.py     # Scans & filters markets every 5 min
│   ├── execution/
│   │   └── order_executor.py     # Trades: open, monitor, close
│   ├── risk/
│   │   └── risk_manager.py       # Kelly Criterion + safety limits
│   ├── strategies/
│   │   └── probability_mismatch.py  # Core edge-finding strategy
│   ├── models/
│   │   └── trade.py              # SQLAlchemy Trade model
│   └── utils/
│       ├── config.py             # Pydantic Settings from .env
│       ├── db.py                 # SQLite persistence layer
│       └── logger.py             # Structured logging (structlog)
├── scripts/
│   ├── export_results.py         # Exports trades.db → results.json
│   ├── push_results_cron.sh      # Cron: export + push to GitHub
│   ├── view_results.py           # CLI viewer for trade results
│   └── backtest.py               # Backtesting against historical data
├── tests/
│   ├── unit/                     # Unit tests (mocked)
│   └── integration/              # Integration tests
├── data/
│   └── trades.db                 # SQLite (git-ignored)
└── .env                          # Secrets — NEVER committed`}</pre>
        </div>
      </Section>
    </div>
  )
}
