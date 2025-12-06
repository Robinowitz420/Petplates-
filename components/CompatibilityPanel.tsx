'use client';

import { AlertTriangle, CheckCircle, XCircle, Target, Info } from 'lucide-react';
import { MealAnalysis } from '@/lib/analyzeCustomMeal';

interface CompatibilityPanelProps {
  analysis: MealAnalysis | null;
  isAnalyzing: boolean;
  totalGrams: number;
  ingredientCount: number;
}

export default function CompatibilityPanel({
  analysis,
  isAnalyzing,
  totalGrams,
  ingredientCount
}: CompatibilityPanelProps) {
  if (isAnalyzing) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
          <span className="text-gray-600 text-sm">Analyzing...</span>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center text-gray-400 text-sm">
          <Info size={24} className="mx-auto mb-2 opacity-50" />
          <p>Add ingredients to see compatibility score</p>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle size={20} className="text-green-600" />;
    if (score >= 60) return <AlertTriangle size={20} className="text-yellow-600" />;
    return <XCircle size={20} className="text-red-600" />;
  };

  return (
    <div className="space-y-4">
      {/* Compatibility Score */}
      <div className={`bg-white rounded-lg border-2 p-6 ${getScoreColor(analysis.score)}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {getScoreIcon(analysis.score)}
            <h3 className="font-semibold text-lg">Compatibility Score</h3>
          </div>
          <div className="text-3xl font-bold">{analysis.score}/100</div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-white/50 rounded-full h-3 mb-2">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              analysis.score >= 80 ? 'bg-green-600' :
              analysis.score >= 60 ? 'bg-yellow-600' :
              'bg-red-600'
            }`}
            style={{ width: `${analysis.score}%` }}
          />
        </div>

        <div className="text-xs opacity-75 mt-2">
          {analysis.score >= 80 && '✓ Excellent match for your pet'}
          {analysis.score >= 60 && analysis.score < 80 && '⚠ Good, but could be improved'}
          {analysis.score < 60 && '✗ Needs adjustments for safety'}
        </div>
      </div>

      {/* Warnings & Safety Alerts */}
      {(analysis.toxicityWarnings.length > 0 || analysis.allergyWarnings.length > 0) && (
        <div className="bg-red-50 rounded-lg border border-red-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-red-600" />
            <h4 className="font-semibold text-red-900 text-sm">Safety Alerts</h4>
          </div>
          <div className="space-y-1">
            {analysis.toxicityWarnings.slice(0, 3).map((warning, idx) => (
              <div key={idx} className="text-xs text-red-800">
                ⚠️ {warning.message}
              </div>
            ))}
            {analysis.allergyWarnings.slice(0, 2).map((warning, idx) => (
              <div key={idx} className="text-xs text-red-800">
                ⚠️ {typeof warning === 'string' ? warning : warning.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Safe Choices Indicator */}
      {analysis.score >= 60 && (
        <div className="bg-green-50 rounded-lg border border-green-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={16} className="text-green-600" />
            <h4 className="font-semibold text-green-900 text-sm">Safe Choices</h4>
          </div>
          <div className="text-xs text-green-800">
            ✓ All selected ingredients are safe for your pet
          </div>
        </div>
      )}

      {/* Quick Nutrition Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h4 className="font-semibold text-gray-900 text-sm mb-3">Quick Summary</h4>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600">Total:</span>
            <span className="font-medium">{totalGrams}g • {ingredientCount} ingredients</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Calories:</span>
            <span className="font-medium">
              {((analysis.nutrients as any).kcal ?? (analysis.nutrients as any).calories_kcal ?? (analysis.nutrients as any).energy_kcal ?? 0).toFixed(0)} kcal
            </span>
          </div>
          {analysis.caToPratio && (
            <div className="flex justify-between">
              <span className="text-gray-600">Ca:P Ratio:</span>
              <span className="font-medium">{analysis.caToPratio.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Suggestions */}
      {analysis.suggestions.length > 0 && (
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
          <h4 className="font-semibold text-blue-900 text-sm mb-2">Suggestions</h4>
          <div className="space-y-1">
            {analysis.suggestions.slice(0, 2).map((suggestion, idx) => (
              <div key={idx} className="text-xs text-blue-800">
                💡 {typeof suggestion === 'string' ? suggestion : suggestion.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

