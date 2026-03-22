export const metadata = {
  title: 'Security — Polymarket Claude Bot',
}

function Section({ title, children }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
      <h2 className="text-base font-semibold text-white border-b border-gray-800 pb-3">{title}</h2>
      {children}
    </div>
  )
}

function Check({ label, detail, status = 'pass' }) {
  return (
    <div className="flex gap-3 items-start py-3 border-b border-gray-800/50 last:border-0">
      <span className={`flex-shrink-0 mt-0.5 text-base ${status === 'pass' ? 'text-green-400' : status === 'warn' ? 'text-yellow-400' : 'text-red-400'}`}>
        {status === 'pass' ? '✓' : status === 'warn' ? '⚠' : '✗'}
      </span>
      <div>
        <p className="text-sm text-white font-medium">{label}</p>
        {detail && <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{detail}</p>}
      </div>
    </div>
  )
}

export default function SecurityPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Security</h1>
        <p className="text-gray-400 mt-1">How secrets are protected, what scans run, and what the bot can and cannot do</p>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Secret Scanning', value: 'Active', sub: 'detect-secrets pre-commit', color: 'text-green-400' },
          { label: 'Static Analysis', value: 'Active', sub: 'Bandit on every commit', color: 'text-green-400' },
          { label: 'Lint / Type Check', value: 'Active', sub: 'Ruff + Mypy', color: 'text-green-400' },
          { label: 'Mode', value: 'Paper Only', sub: 'No real wallet connected', color: 'text-yellow-400' },
        ].map(item => (
          <div key={item.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{item.label}</p>
            <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{item.sub}</p>
          </div>
        ))}
      </div>

      {/* What this bot can and cannot do */}
      <Section title="What This Bot Can and Cannot Do">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-green-400 uppercase tracking-wider font-semibold mb-3">CAN DO (paper mode)</p>
            <div className="space-y-2">
              {[
                'Read public Polymarket market data',
                'Call Claude API (your Anthropic key)',
                'Write to local SQLite database',
                'Push results.json to your public GitHub repo',
                'Print logs to your terminal',
              ].map(item => (
                <div key={item} className="flex gap-2 items-start">
                  <span className="text-green-400 flex-shrink-0">✓</span>
                  <p className="text-xs text-gray-300">{item}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-red-400 uppercase tracking-wider font-semibold mb-3">CANNOT DO (paper mode)</p>
            <div className="space-y-2">
              {[
                'Spend real money — no wallet connected',
                'Access your exchange accounts',
                'Make inbound network connections',
                'Read or write outside the project directory',
                'Execute shell commands beyond its own scripts',
              ].map(item => (
                <div key={item} className="flex gap-2 items-start">
                  <span className="text-red-400 flex-shrink-0">✗</span>
                  <p className="text-xs text-gray-300">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Secret protection */}
      <Section title="Secret & Key Protection">
        <Check
          label=".env file is git-ignored"
          detail="The .env file containing your ANTHROPIC_API_KEY is excluded from Git via .gitignore. It will never appear in any commit or be pushed to GitHub."
        />
        <Check
          label="detect-secrets pre-commit hook"
          detail="Every commit is scanned for accidental secret leaks (API keys, passwords, tokens). The commit is blocked if a secret pattern is detected. Baseline stored in .secrets.baseline."
        />
        <Check
          label="No wallet private key in use"
          detail="Paper trading mode requires only the Anthropic API key. The Polygon wallet fields are empty and optional — no real money is accessible."
        />
        <Check
          label="Anthropic API key scope"
          detail="Your API key is only used for Claude inference calls. It has no access to your Anthropic billing or account management."
        />
        <Check
          label="Public data repo contains no secrets"
          detail="The polymarket-data GitHub repo only contains results.json — trade history and statistics. No keys, no personal data, no wallet addresses."
          status="pass"
        />
        <Check
          label="API key rotation recommended"
          detail="If you suspect your Anthropic key is compromised, rotate it at console.anthropic.com/settings/keys and update the .env file. The bot restarts automatically on next run."
          status="warn"
        />
      </Section>

      {/* Pre-commit hooks */}
      <Section title="Automated Security Checks (Pre-commit Hooks)">
        <p className="text-sm text-gray-400">These run automatically on every git commit and block the commit if any check fails:</p>
        <div className="mt-3 space-y-0">
          {[
            { tool: 'detect-secrets', purpose: 'Scans all staged files for API keys, passwords, tokens, and other secrets', blocks: 'Commit' },
            { tool: 'Bandit', purpose: 'Static security analysis — flags SQL injection, shell injection, hardcoded passwords, insecure random, etc.', blocks: 'Commit' },
            { tool: 'Ruff', purpose: 'Linting and code style — catches bugs, unused imports, type errors', blocks: 'Commit' },
            { tool: 'Black', purpose: 'Code formatting — enforces consistent style across all Python files', blocks: 'Commit' },
            { tool: 'Trailing whitespace / EOF', purpose: 'File hygiene checks', blocks: 'Commit' },
          ].map(item => (
            <div key={item.tool} className="grid grid-cols-4 gap-3 py-3 border-b border-gray-800/50 last:border-0 text-xs">
              <p className="text-yellow-400 font-mono font-semibold">{item.tool}</p>
              <p className="text-gray-300 col-span-2">{item.purpose}</p>
              <p className="text-red-400">{item.blocks}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Network */}
      <Section title="Network Security">
        <p className="text-sm text-gray-400 mb-2">The bot makes only outbound HTTPS connections. It accepts no inbound connections.</p>
        <div className="space-y-0">
          {[
            { host: 'api.anthropic.com', purpose: 'Claude API — probability estimation', protocol: 'HTTPS / TLS 1.3' },
            { host: 'clob.polymarket.com', purpose: 'Market data fetch (public API)', protocol: 'HTTPS / TLS 1.2+' },
            { host: 'gamma-api.polymarket.com', purpose: 'Market metadata (public API)', protocol: 'HTTPS / TLS 1.2+' },
            { host: 'github.com', purpose: 'Push results.json to polymarket-data repo', protocol: 'HTTPS / TLS 1.3' },
          ].map(item => (
            <div key={item.host} className="grid grid-cols-3 gap-3 py-3 border-b border-gray-800/50 last:border-0 text-xs">
              <p className="text-blue-400 font-mono">{item.host}</p>
              <p className="text-gray-300">{item.purpose}</p>
              <p className="text-green-400">{item.protocol}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">Rate limiting: 1 second delay between Polymarket API pages. Exponential backoff on errors (tenacity). Max 5 concurrent Claude calls.</p>
      </Section>

      {/* Dependency scanning */}
      <Section title="Dependency & Vulnerability Scanning">
        <Check
          label="Safety — Python CVE scanning"
          detail="Checks all Python dependencies against the Safety DB for known CVEs. Run manually: safety check"
        />
        <Check
          label="Bandit — insecure code patterns"
          detail="Flags: shell injection, SQL injection, hardcoded passwords, MD5/SHA1 usage, pickle deserialization, and 200+ other patterns."
        />
        <Check
          label="Ruff security rules (S-prefix)"
          detail="Enforces secure coding patterns inline during development — catches issues before they're committed."
        />
        <Check
          label="Dependency pinning"
          detail="All Python dependencies are pinned in requirements.txt to avoid supply chain attacks via unpinned upgrades."
          status="warn"
        />
      </Section>

      {/* Incident response */}
      <Section title="If Something Goes Wrong">
        <div className="space-y-3">
          {[
            { scenario: 'Anthropic API key leaked', action: 'Go to console.anthropic.com/settings/keys → Revoke key → Create new one → Update .env', urgency: 'High' },
            { scenario: 'Bot running up unexpected API costs', action: 'Stop the bot (Ctrl+C or pkill -f src.main) → Check logs in logs/bot.log → Review scan frequency in .env', urgency: 'Medium' },
            { scenario: 'results.json contains sensitive data', action: 'Delete the file from polymarket-data repo → Force push → The dashboard will show waiting state', urgency: 'Low' },
          ].map(item => (
            <div key={item.scenario} className="p-4 bg-gray-800/40 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-white">{item.scenario}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  item.urgency === 'High' ? 'bg-red-500/10 text-red-400' :
                  item.urgency === 'Medium' ? 'bg-yellow-500/10 text-yellow-400' :
                  'bg-gray-500/10 text-gray-400'
                }`}>{item.urgency}</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">{item.action}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}
