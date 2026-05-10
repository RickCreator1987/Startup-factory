/**
 * Risk Dashboard Component
 * 
 * React component for the administrative UI to monitor compliance status,
 * view risk scores, and manage wallet freezing/unfreezing.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

/**
 * Risk Dashboard Props
 */
interface RiskDashboardProps {
  /** RPC URL */
  rpcUrl?: string;
  /** Program ID */
  programId?: string;
  /** Refresh interval in ms */
  refreshInterval?: number;
}

/**
 * Risk Data
 */
interface RiskData {
  wallet: string;
  score: number;
  level: 'Low' | 'Medium' | 'High' | 'Critical';
  lastUpdated: number;
  frozen: boolean;
}

/**
 * Statistics
 */
interface Stats {
  totalWallets: number;
  verifiedWallets: number;
  highRiskWallets: number;
  frozenWallets: number;
  totalVolume: number;
}

/**
 * Risk Dashboard Component
 */
export const RiskDashboard: React.FC<RiskDashboardProps> = ({
  rpcUrl = 'https://api.devnet.solana.com',
  programId = 'KYCCo7vM2uLkGzqH6XqKJp1TJK5JjK9jW8vY9xQz1P2',
  refreshInterval = 30000,
}) => {
  // State
  const [riskData, setRiskData] = useState<RiskData[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalWallets: 0,
    verifiedWallets: 0,
    highRiskWallets: 0,
    frozenWallets: 0,
    totalVolume: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  
  // Colors
  const COLORS = {
    low: '#10b981',      // Green
    medium: '#f59e0b',  // Amber
    high: '#f97316',     // Orange
    critical: '#ef4444', // Red
    verified: '#14f195', // Solana Green
    frozen: '#6b7280',   // Gray
  };
  
  /**
   * Fetch risk data from API
   */
  const fetchRiskData = useCallback(async () => {
    try {
      setLoading(true);
      
      // In production, this would fetch from actual API
      // const response = await fetch(`${API_BASE}/risk/wallets`);
      // const data = await response.json();
      
      // Demo data
      const demoData: RiskData[] = [
        { wallet: 'Wallet1...', score: 25, level: 'Low', lastUpdated: Date.now(), frozen: false },
        { wallet: 'Wallet2...', score: 45, level: 'Medium', lastUpdated: Date.now(), frozen: false },
        { wallet: 'Wallet3...', score: 72, level: 'High', lastUpdated: Date.now(), frozen: false },
        { wallet: 'Wallet4...', score: 92, level: 'Critical', lastUpdated: Date.now(), frozen: true },
        { wallet: 'Wallet5...', score: 15, level: 'Low', lastUpdated: Date.now(), frozen: false },
      ];
      
      setRiskData(demoData);
      
      // Calculate stats
      const newStats: Stats = {
        totalWallets: demoData.length,
        verifiedWallets: demoData.filter(d => d.score < 60 && !d.frozen).length,
        highRiskWallets: demoData.filter(d => d.score >= 60).length,
        frozenWallets: demoData.filter(d => d.frozen).length,
        totalVolume: 1250000, // Demo value
      };
      
      setStats(newStats);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Initial fetch and interval
  useEffect(() => {
    fetchRiskData();
    
    const interval = setInterval(fetchRiskData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchRiskData, refreshInterval]);
  
  /**
   * Freeze a wallet
   */
  const handleFreeze = async (wallet: string) => {
    try {
      // In production, this would call the SDK
      // await sdk.freezeWallet(new PublicKey(wallet));
      
      console.log(`Freezing wallet: ${wallet}`);
      alert(`Wallet ${wallet} has been frozen`);
      fetchRiskData();
    } catch (err) {
      console.error('Failed to freeze wallet:', err);
    }
  };
  
  /**
   * Unfreeze a wallet
   */
  const handleUnfreeze = async (wallet: string) => {
    try {
      // In production, this would call the SDK
      // await sdk.unfreezeWallet(new PublicKey(wallet));
      
      console.log(`Unfreezing wallet: ${wallet}`);
      alert(`Wallet ${wallet} has been unfrozen`);
      fetchRiskData();
    } catch (err) {
      console.error('Failed to unfreeze wallet:', err);
    }
  };
  
  /**
   * Get risk distribution for pie chart
   */
  const getRiskDistribution = () => {
    const distribution = [
      { name: 'Low', value: riskData.filter(d => d.level === 'Low').length, color: COLORS.low },
      { name: 'Medium', value: riskData.filter(d => d.level === 'Medium').length, color: COLORS.medium },
      { name: 'High', value: riskData.filter(d => d.level === 'High').length, color: COLORS.high },
      { name: 'Critical', value: riskData.filter(d => d.level === 'Critical').length, color: COLORS.critical },
    ];
    return distribution.filter(d => d.value > 0);
  };
  
  // Loading state
  if (loading && riskData.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-white text-xl">Loading risk data...</div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-red-500 text-xl">Error: {error}</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Risk Dashboard</h1>
        <p className="text-slate-400">Monitor compliance status and manage risk</p>
      </header>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard 
          title="Total Wallets" 
          value={stats.totalWallets} 
          color={COLORS.verified}
        />
        <StatCard 
          title="Verified" 
          value={stats.verifiedWallets} 
          color={COLORS.verified}
        />
        <StatCard 
          title="High Risk" 
          value={stats.highRiskWallets} 
          color={COLORS.high}
        />
        <StatCard 
          title="Frozen" 
          value={stats.frozenWallets} 
          color={COLORS.frozen}
        />
        <StatCard 
          title="Total Volume" 
          value={`$${(stats.totalVolume / 1000).toFixed(1)}K`} 
          color={COLORS.verified}
        />
      </div>
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Risk Distribution Pie Chart */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-xl font-semibold mb-4">Risk Distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={getRiskDistribution()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {getRiskDistribution().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Risk Score Trend */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-xl font-semibold mb-4">Risk Score Trend</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={riskData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="wallet" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
              />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#14f195" 
                strokeWidth={2}
                dot={{ fill: '#14f195' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Wallet Table */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-semibold">Wallet Risk Table</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Wallet
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Risk Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Risk Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {riskData.map((wallet) => (
                <tr key={wallet.wallet} className="hover:bg-slate-700/30">
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">
                    {wallet.wallet}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-slate-700 rounded-full h-2 mr-2">
                        <div 
                          className="h-2 rounded-full" 
                          style={{ 
                            width: `${wallet.score}%`,
                            backgroundColor: COLORS[wallet.level.toLowerCase() as keyof typeof COLORS]
                          }}
                        />
                      </div>
                      <span className="text-sm">{wallet.score}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className="px-2 py-1 text-xs font-semibold rounded-full"
                      style={{ 
                        backgroundColor: `${COLORS[wallet.level.toLowerCase() as keyof typeof COLORS]}20`,
                        color: COLORS[wallet.level.toLowerCase() as keyof typeof COLORS]
                      }}
                    >
                      {wallet.level}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {wallet.frozen ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-500/20 text-gray-400">
                        Frozen
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-500/20 text-green-400">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                    {new Date(wallet.lastUpdated).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {wallet.frozen ? (
                      <button
                        onClick={() => handleUnfreeze(wallet.wallet)}
                        className="px-3 py-1 text-xs font-medium rounded bg-green-600 hover:bg-green-700 text-white transition-colors"
                      >
                        Unfreeze
                      </button>
                    ) : (
                      <button
                        onClick={() => handleFreeze(wallet.wallet)}
                        className="px-3 py-1 text-xs font-medium rounded bg-red-600 hover:bg-red-700 text-white transition-colors"
                      >
                        Freeze
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="mt-8 text-center text-slate-500 text-sm">
        <p>Solana KYC Compliance SDK - Risk Dashboard</p>
        <p>Program ID: {programId}</p>
      </footer>
    </div>
  );
};

/**
 * Stat Card Component
 */
interface StatCardProps {
  title: string;
  value: number | string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, color }) => (
  <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
    <div className="text-slate-400 text-sm mb-1">{title}</div>
    <div className="text-2xl font-bold" style={{ color }}>{value}</div>
  </div>
);

export default RiskDashboard;
