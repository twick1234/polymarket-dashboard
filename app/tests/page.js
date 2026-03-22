export const metadata = {
  title: 'Tests — Polymarket Claude Bot',
}

function Section({ title, children }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
      <h2 className="text-base font-semibold text-white border-b border-gray-800 pb-3">{title}</h2>
      {children}
    </div>
  )
}

const TEST_SUITES = [
  {
    file: 'tests/unit/test_risk_manager.py',
    module: 'RiskManager',
    coverage: 94,
    tests: [
      { name: 'test_approve_valid_trade', desc: 'Approves a trade with good edge and confidence' },
      { name: 'test_reject_low_edge', desc: 'Rejects trade when edge is below minimum threshold' },
      { name: 'test_reject_low_confidence', desc: 'Rejects trade when Claude confidence is too low' },
      { name: 'test_reject_max_drawdown', desc: 'Halts trading when portfolio falls below drawdown limit' },
      { name: 'test_reject_max_positions', desc: 'Rejects trade when max open positions reached' },
      { name: 'test_kelly_position_sizing', desc: 'Verifies Kelly Criterion math for position sizing' },
      { name: 'test_kelly_capped_at_max_pct', desc: 'Kelly result is capped at max position % of capital' },
      { name: 'test_consecutive_losses_halt', desc: 'Stops trading after 5 consecutive losing trades' },
      { name: 'test_record_trade_outcome', desc: 'Win/loss tracking updates portfolio state correctly' },
      { name: 'test_portfolio_summary', desc: 'Summary stats match expected values from trade history' },
    ]
  },
  {
    file: 'tests/unit/test_order_executor.py',
    module: 'OrderExecutor',
    coverage: 67,
    tests: [
      { name: 'test_execute_opportunity_success', desc: 'Full entry order flow — YES direction' },
      { name: 'test_execute_opportunity_no_direction', desc: 'Full entry order flow — NO direction' },
      { name: 'test_execute_rejects_unapproved', desc: 'Does not execute when risk decision is rejected' },
      { name: 'test_take_profit_trigger', desc: 'Closes position when price hits 2.5× entry' },
      { name: 'test_stop_loss_trigger', desc: 'Closes position when price drops 40%' },
      { name: 'test_max_hold_time_trigger', desc: 'Force-closes position after 72-hour max hold' },
      { name: 'test_pnl_calculated_correctly', desc: 'P&L math verified for both profit and loss cases' },
      { name: 'test_on_trade_closed_callback', desc: 'Registered callbacks are fired on trade close' },
      { name: 'test_get_stats_empty', desc: 'Stats return safe defaults when no trades exist' },
      { name: 'test_get_stats_with_trades', desc: 'Win rate, avg P&L, and totals calculated correctly' },
    ]
  },
  {
    file: 'tests/unit/test_claude_client.py',
    module: 'ClaudeAnalyzer',
    coverage: 64,
    tests: [
      { name: 'test_estimate_probability_yes_edge', desc: 'Returns positive edge when Claude > market price' },
      { name: 'test_estimate_probability_no_edge', desc: 'Returns negative edge when Claude < market price' },
      { name: 'test_estimate_confidence_threshold', desc: 'Marks estimate non-tradeable below 60% confidence' },
      { name: 'test_batch_estimate_respects_concurrency', desc: 'Batch mode limits concurrent API calls to 5' },
      { name: 'test_batch_estimate_empty_input', desc: 'Empty list returns empty result, no API calls' },
      { name: 'test_probability_clamped_to_range', desc: 'Claude output clamped to [0.01, 0.99] range' },
      { name: 'test_edge_calculation', desc: 'edge = claude_probability − market_price' },
      { name: 'test_expected_value_calculation', desc: 'EV = edge × confidence drives trade prioritisation' },
    ]
  },
  {
    file: 'tests/unit/test_polymarket_client.py',
    module: 'PolymarketClient',
    coverage: 55,
    tests: [
      { name: 'test_get_markets_filters_inactive', desc: 'Closed and inactive markets are excluded' },
      { name: 'test_get_markets_filters_low_liquidity', desc: 'Markets below min liquidity are excluded' },
      { name: 'test_get_markets_pagination_limit', desc: 'Pagination capped at 2 pages max (1,000 markets)' },
      { name: 'test_paper_order_simulates_fill', desc: 'Paper client returns simulated fill at market price' },
      { name: 'test_paper_order_applies_slippage', desc: 'BUY orders apply +2% slippage to entry price' },
      { name: 'test_get_balance_paper_mode', desc: 'Paper client returns configured starting capital' },
    ]
  },
  {
    file: 'tests/unit/test_strategy.py',
    module: 'ProbabilityMismatchStrategy',
    coverage: 100,
    tests: [
      { name: 'test_evaluate_returns_true_when_edge_met', desc: 'Trades when edge and confidence thresholds are met' },
      { name: 'test_evaluate_returns_false_low_edge', desc: 'Skips trade when edge is below 8%' },
      { name: 'test_evaluate_returns_false_low_confidence', desc: 'Skips trade when confidence is below 60%' },
      { name: 'test_score_higher_for_bigger_edge', desc: 'Higher edge markets score higher for prioritisation' },
      { name: 'test_score_includes_liquidity_bonus', desc: 'High-liquidity markets get a score bonus' },
      { name: 'test_trade_direction_yes_positive_edge', desc: 'Positive edge → BUY YES shares' },
      { name: 'test_trade_direction_no_negative_edge', desc: 'Negative edge → BUY NO shares' },
      { name: 'test_name_property', desc: 'Strategy name returns expected string' },
      { name: 'test_min_edge_boundary', desc: 'Exactly at min edge threshold is approved' },
      { name: 'test_min_confidence_boundary', desc: 'Exactly at min confidence threshold is approved' },
    ]
  },
  {
    file: 'tests/unit/test_trade_model.py',
    module: 'TradeModel',
    coverage: 100,
    tests: [
      { name: 'test_from_trade_maps_fields', desc: 'TradeModel.from_trade() maps all fields correctly' },
      { name: 'test_round_trip_serialization', desc: 'Trade → TradeModel → Trade preserves all values' },
      { name: 'test_status_enum_mapping', desc: 'TradeStatus enum values map to correct DB strings' },
    ]
  },
  {
    file: 'tests/integration/test_paper_trading.py',
    module: 'Full Paper Trade Cycle',
    coverage: null,
    tests: [
      { name: 'test_full_paper_trade_cycle', desc: 'End-to-end: market scan → Claude analysis → risk check → paper order → position monitor → close on take-profit' },
      { name: 'test_risk_halts_on_drawdown', desc: 'Integration: bot stops placing trades when drawdown limit hit' },
      { name: 'test_paper_client_no_wallet_needed', desc: 'Paper mode runs without any wallet configuration' },
    ]
  },
]

export default function TestsPage() {
  const totalTests = TEST_SUITES.reduce((sum, s) => sum + s.tests.length, 0)
  const avgCoverage = Math.round(
    TEST_SUITES.filter(s => s.coverage !== null).reduce((sum, s) => sum + s.coverage, 0) /
    TEST_SUITES.filter(s => s.coverage !== null).length
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Tests & Quality</h1>
        <p className="text-gray-400 mt-1">Test coverage, what each test verifies, and how quality is enforced</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Tests</p>
          <p className="text-2xl font-bold text-green-400">{totalTests}</p>
          <p className="text-xs text-gray-500 mt-0.5">All passing</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Test Suites</p>
          <p className="text-2xl font-bold text-blue-400">{TEST_SUITES.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Unit + integration</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Avg Coverage</p>
          <p className="text-2xl font-bold text-yellow-400">{avgCoverage}%</p>
          <p className="text-xs text-gray-500 mt-0.5">Core modules</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Framework</p>
          <p className="text-2xl font-bold text-purple-400">pytest</p>
          <p className="text-xs text-gray-500 mt-0.5">+ pytest-asyncio</p>
        </div>
      </div>

      {/* Coverage by module */}
      <Section title="Coverage by Module">
        <div className="space-y-3">
          {[
            { module: 'strategies/probability_mismatch.py', pct: 100 },
            { module: 'strategies/base_strategy.py', pct: 100 },
            { module: 'models/trade.py', pct: 100 },
            { module: 'risk/risk_manager.py', pct: 94 },
            { module: 'utils/config.py', pct: 79 },
            { module: 'execution/order_executor.py', pct: 67 },
            { module: 'clients/claude_client.py', pct: 64 },
            { module: 'clients/polymarket_client.py', pct: 55 },
          ].map(item => (
            <div key={item.module} className="flex items-center gap-3">
              <p className="text-xs font-mono text-gray-400 w-64 flex-shrink-0">{item.module}</p>
              <div className="flex-1 bg-gray-800 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${item.pct >= 90 ? 'bg-green-500' : item.pct >= 70 ? 'bg-yellow-500' : 'bg-orange-500'}`}
                  style={{ width: `${item.pct}%` }}
                />
              </div>
              <p className={`text-xs font-mono w-10 text-right ${item.pct >= 90 ? 'text-green-400' : item.pct >= 70 ? 'text-yellow-400' : 'text-orange-400'}`}>
                {item.pct}%
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* Test suites */}
      {TEST_SUITES.map(suite => (
        <Section key={suite.file} title={`${suite.module} — ${suite.tests.length} tests`}>
          <p className="text-xs text-gray-500 font-mono">{suite.file}</p>
          <div className="mt-3 space-y-0">
            {suite.tests.map(test => (
              <div key={test.name} className="flex gap-3 items-start py-2.5 border-b border-gray-800/40 last:border-0">
                <span className="text-green-400 text-xs flex-shrink-0 mt-0.5">✓</span>
                <div>
                  <p className="text-xs font-mono text-yellow-400">{test.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{test.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      ))}

      {/* How to run */}
      <Section title="Running Tests Locally">
        <div className="bg-black/60 rounded-lg p-4 font-mono text-xs text-green-400 leading-loose">
          <p className="text-gray-500"># Activate virtual environment</p>
          <p>source venv/bin/activate</p>
          <p className="text-gray-500 mt-2"># Run all tests with coverage</p>
          <p>python -m pytest tests/</p>
          <p className="text-gray-500 mt-2"># Run only unit tests</p>
          <p>python -m pytest tests/unit/ -v</p>
          <p className="text-gray-500 mt-2"># Run a specific test</p>
          <p>python -m pytest tests/unit/test_risk_manager.py::test_kelly_position_sizing -v</p>
          <p className="text-gray-500 mt-2"># Run pre-commit hooks</p>
          <p>pre-commit run --all-files</p>
        </div>
      </Section>
    </div>
  )
}
