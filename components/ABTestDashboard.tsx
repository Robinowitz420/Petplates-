'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, RefreshCw, Trophy, TrendingUp } from 'lucide-react';
import { getConversionStats, type ButtonVariant } from '@/lib/utils/abTesting';

// Admin dashboard to view A/B test results in-app
export default function ABTestDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  const loadStats = () => {
    setStats(getConversionStats());
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-green-700 hover:bg-green-600 text-white p-3 rounded-full shadow-lg z-40 border-2 border-orange-500"
        title="View A/B Test Results"
      >
        <BarChart3 size={24} />
      </button>
    );
  }

  if (!stats) {
    return null;
  }

  // Calculate totals and winner
  const variants = Object.entries(stats) as [ButtonVariant, any][];
  const totalClicks = variants.reduce((sum, [_, data]) => sum + data.total, 0);
  const winner = variants.reduce((best, current) => 
    current[1].total > best[1].total ? current : best
  );

  const getVariantLabel = (id: ButtonVariant) => {
    const labels = {
      'shop-now': 'Shop Now',
      'buy-amazon': 'Buy on Amazon',
      'get-ingredients': 'Get Ingredients'
    };
    return labels[id] || id;
  };

  const getPercentage = (count: number) => {
    if (totalClicks === 0) return 0;
    return Math.round((count / totalClicks) * 100);
  };

  return (
    <div className="fixed bottom-4 right-4 bg-surface border-2 border-orange-500/50 rounded-2xl shadow-2xl p-6 w-96 z-50 max-h-[80vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-surface-highlight">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="text-orange-400" size={24} />
          A/B Test Results
        </h3>
        <div className="flex gap-2">
          <button
            onClick={loadStats}
            className="text-gray-400 hover:text-white p-1"
            title="Refresh"
          >
            <RefreshCw size={20} />
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-white p-1"
            title="Close"
          >
            ×
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6 p-4 bg-green-900/20 border border-green-700/30 rounded-lg">
        <div className="text-center">
          <div className="text-3xl font-black text-green-400 mb-1">
            {totalClicks}
          </div>
          <div className="text-sm text-gray-400">Total Clicks Tracked</div>
        </div>
      </div>

      {/* Winner Badge */}
      {totalClicks > 10 && (
        <div className="mb-4 p-3 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border border-orange-500/50 rounded-lg">
          <div className="flex items-center gap-2 text-orange-400 font-bold text-sm">
            <Trophy size={20} />
            <span>Current Leader: {getVariantLabel(winner[0])}</span>
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {winner[1].total} clicks ({getPercentage(winner[1].total)}%)
          </div>
        </div>
      )}

      {/* Variant Breakdown */}
      <div className="space-y-3">
        {variants.map(([variant, data]) => {
          const percentage = getPercentage(data.total);
          const isWinner = variant === winner[0] && totalClicks > 10;
          
          return (
            <div
              key={variant}
              className={`p-4 rounded-lg border-2 transition-all ${
                isWinner
                  ? 'bg-orange-900/20 border-orange-500/50'
                  : 'bg-surface-highlight border-surface-highlight'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-white flex items-center gap-2">
                  {isWinner && <Trophy size={16} className="text-orange-400" />}
                  {getVariantLabel(variant)}
                </div>
                <div className="text-lg font-bold text-orange-400">
                  {data.total}
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-surface rounded-full h-2 mb-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    isWinner ? 'bg-orange-500' : 'bg-gray-600'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{percentage}% of total clicks</span>
                {isWinner && (
                  <span className="flex items-center gap-1 text-orange-400">
                    <TrendingUp size={12} />
                    Leading
                  </span>
                )}
              </div>
              
              {/* Context Breakdown */}
              {Object.keys(data.byContext).length > 0 && (
                <div className="mt-2 pt-2 border-t border-surface text-xs">
                  <div className="text-gray-500 mb-1">By context:</div>
                  <div className="flex gap-2 flex-wrap">
                    {Object.entries(data.byContext).map(([context, count]: [string, any]) => (
                      <span
                        key={context}
                        className="bg-surface px-2 py-1 rounded text-gray-400"
                      >
                        {context}: {count}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 pt-4 border-t border-surface-highlight space-y-2">
        <button
          onClick={() => {
            if (confirm('Reset all A/B test data?')) {
              localStorage.removeItem('ab_button_clicks');
              loadStats();
            }
          }}
          className="w-full py-2 px-4 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 text-red-400 rounded-lg text-sm font-semibold transition-colors"
        >
          Reset Test Data
        </button>
        
        <button
          onClick={() => {
            if (confirm('Change your variant? (will refresh page)')) {
              localStorage.removeItem('ab_button_variant');
              window.location.reload();
            }
          }}
          className="w-full py-2 px-4 bg-green-600/20 hover:bg-green-600/30 border border-green-500/50 text-green-400 rounded-lg text-sm font-semibold transition-colors"
        >
          Change My Variant
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-4 p-3 bg-surface-lighter rounded-lg">
        <p className="text-xs text-gray-500 leading-relaxed">
          <strong className="text-gray-400">How it works:</strong> Each visitor is randomly assigned one of 3 button text variants. 
          We track which variant gets more clicks to find the best performing copy.
        </p>
        <p className="text-xs text-gray-500 mt-2">
          <strong className="text-gray-400">Console:</strong> Run <code className="bg-surface px-1 rounded">logABTestResults()</code> for details.
        </p>
      </div>
    </div>
  );
}

