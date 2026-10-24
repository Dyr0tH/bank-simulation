import React from 'react';

export function StatCard({ title, value, subtext, icon: Icon, trend, trendLabel, color = 'slate' }) {
  const iconColorMap = {
    slate: 'bg-bank-100 text-bank-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    blue: 'bg-blue-50 text-blue-700',
    amber: 'bg-amber-50 text-amber-700',
    purple: 'bg-purple-50 text-purple-700',
    red: 'bg-red-50 text-red-700'
  };

  return (
    <div className="bank-card p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-bank-500">{title}</p>
          <div className="text-2xl font-bold tracking-tight text-bank-900 font-mono tabular-nums">
            {value}
          </div>
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-lg ${iconColorMap[color] || iconColorMap.slate}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtext || trend) && (
        <div className="mt-3.5 pt-3 border-t border-bank-100 flex items-center text-xs text-bank-600 justify-between">
          <span>{subtext}</span>
          {trend && (
            <span className={`font-medium ${trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
              {trend === 'up' ? '↑' : '↓'} {trendLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default StatCard;
