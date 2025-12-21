'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Activity, Target, TrendingUp } from 'lucide-react';
import { DailyNutrition, NutritionTargets } from '@/lib/nutrition/nutritionHistory';

interface NutritionDashboardProps {
  daily: DailyNutrition[];
  targets: NutritionTargets;
  petName: string;
}

export function NutritionDashboard({ daily, targets, petName }: NutritionDashboardProps) {
  const summary = {
    avgCalories: daily.reduce((sum, d) => sum + d.calories, 0) / daily.length || 0,
    avgProtein: daily.reduce((sum, d) => sum + d.protein, 0) / daily.length || 0,
    avgFat: daily.reduce((sum, d) => sum + d.fat, 0) / daily.length || 0,
    avgCarbs: daily.reduce((sum, d) => sum + d.carbs, 0) / daily.length || 0,
    avgFiber: daily.reduce((sum, d) => sum + (d.fiber || 0), 0) / daily.length || 0,
  };

  const getStatusColor = (value: number, range?: [number, number]) => {
    if (!range) return 'text-gray-500';
    if (value >= range[0] && value <= range[1]) return 'text-green-600';
    return 'text-amber-600';
  };

  const getStatusText = (value: number, range?: [number, number]) => {
    if (!range) return 'No target';
    if (value >= range[0] && value <= range[1]) return 'On target';
    return 'Outside range';
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Nutrition Dashboard</h1>
        <p className="text-lg text-gray-600">Weekly nutrition overview for {petName}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-surface p-4 rounded-lg shadow border border-surface-highlight">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Calories</p>
              <p className="text-2xl font-bold">{Math.round(summary.avgCalories)}</p>
            </div>
            <Activity className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-surface p-4 rounded-lg shadow border border-surface-highlight">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Protein (g)</p>
              <p className={`text-2xl font-bold ${getStatusColor(summary.avgProtein, targets.proteinRange)}`}>
                {summary.avgProtein.toFixed(1)}
              </p>
              <p className="text-xs text-gray-500">{getStatusText(summary.avgProtein, targets.proteinRange)}</p>
            </div>
            <Target className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-surface p-4 rounded-lg shadow border border-surface-highlight">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Fat (g)</p>
              <p className={`text-2xl font-bold ${getStatusColor(summary.avgFat, targets.fatRange)}`}>
                {summary.avgFat.toFixed(1)}
              </p>
              <p className="text-xs text-gray-500">{getStatusText(summary.avgFat, targets.fatRange)}</p>
            </div>
            <Target className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-surface p-4 rounded-lg shadow border border-surface-highlight">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Carbs (g)</p>
              <p className={`text-2xl font-bold ${getStatusColor(summary.avgCarbs, targets.carbsRange)}`}>
                {summary.avgCarbs.toFixed(1)}
              </p>
              <p className="text-xs text-gray-500">{getStatusText(summary.avgCarbs, targets.carbsRange)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-surface p-4 rounded-lg shadow border border-surface-highlight">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Fiber (g)</p>
              <p className={`text-2xl font-bold ${getStatusColor(summary.avgFiber, targets.fiberRange)}`}>
                {summary.avgFiber.toFixed(1)}
              </p>
              <p className="text-xs text-gray-500">{getStatusText(summary.avgFiber, targets.fiberRange)}</p>
            </div>
            <Target className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calories Chart */}
        <div className="bg-surface p-6 rounded-lg shadow border border-surface-highlight">
          <h3 className="text-lg font-semibold mb-4">Daily Calories</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={daily}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="calories" stroke="#f97316" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Protein Chart */}
        <div className="bg-surface p-6 rounded-lg shadow border border-surface-highlight">
          <h3 className="text-lg font-semibold mb-4">Daily Protein</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={daily}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="protein" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Fat Chart */}
        <div className="bg-surface p-6 rounded-lg shadow border border-surface-highlight">
          <h3 className="text-lg font-semibold mb-4">Daily Fat</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={daily}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="fat" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Carbs & Fiber Chart */}
        <div className="bg-surface p-6 rounded-lg shadow border border-surface-highlight">
          <h3 className="text-lg font-semibold mb-4">Daily Carbs & Fiber</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={daily}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="carbs" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="fiber" stroke="#8b5cf6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Target Ranges Info */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Target Ranges</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="font-medium">Protein:</p>
            <p className="text-blue-700">
              {targets.proteinRange ? `${targets.proteinRange[0]}-${targets.proteinRange[1]}g` : 'No target'}
            </p>
          </div>
          <div>
            <p className="font-medium">Fat:</p>
            <p className="text-blue-700">
              {targets.fatRange ? `${targets.fatRange[0]}-${targets.fatRange[1]}g` : 'No target'}
            </p>
          </div>
          <div>
            <p className="font-medium">Carbs:</p>
            <p className="text-blue-700">
              {targets.carbsRange ? `${targets.carbsRange[0]}-${targets.carbsRange[1]}g` : 'No target'}
            </p>
          </div>
          <div>
            <p className="font-medium">Fiber:</p>
            <p className="text-blue-700">
              {targets.fiberRange ? `${targets.fiberRange[0]}-${targets.fiberRange[1]}g` : 'No target'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}