import './globals.css'

export const metadata = {
  title: 'Chu Trading Desk — Live Dashboard',
  description: 'Real-time paper trading results powered by Claude AI',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-950 text-gray-100 font-sans">
        <nav className="border-b border-gray-800 bg-gray-900/80 backdrop-blur sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🤖</span>
              <div>
                <h1 className="font-bold text-white text-sm">Chu Trading Desk</h1>
                <p className="text-xs text-gray-400">Multi-Agent Trading System</p>
              </div>
              <div className="flex items-center gap-4">
                <a href="/" className="text-sm text-gray-300 hover:text-white transition-colors">Live Results</a>
                <a href="/strategy" className="text-sm text-gray-300 hover:text-white transition-colors">Strategy</a>
                <a href="/architecture" className="text-sm text-gray-300 hover:text-white transition-colors">Architecture</a>
                <a href="/security" className="text-sm text-gray-300 hover:text-white transition-colors">Security</a>
                <a href="/tests" className="text-sm text-gray-300 hover:text-white transition-colors">Tests</a>
                <a href="/agents" className="text-sm text-gray-300 hover:text-white transition-colors">Agents</a>
              </div>
              <div className="hidden">
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"></span>
                PAPER TRADING
              </span>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
