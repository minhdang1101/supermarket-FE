import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

export function StatsCard({
  title,
  value,
  unit,
  change,
  icon,
  trend = 'neutral',
}) {
  const isPositive = trend === 'up';
  const isNegative = trend === 'down';

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
          </div>
          {change !== undefined && (
            <div
              className={`text-xs mt-2 font-medium flex items-center gap-1 ${
                isPositive
                  ? 'text-green-600'
                  : isNegative
                  ? 'text-red-600'
                  : 'text-gray-500'
              }`}
            >
              {isPositive && <TrendingUp size={14} />}
              {isNegative && <TrendingDown size={14} />}
              {isPositive || isNegative ? (
                <span>{Math.abs(change)}%</span>
              ) : null}
            </div>
          )}
        </div>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
    </Card>
  );
}
