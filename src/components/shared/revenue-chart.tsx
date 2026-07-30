'use client';

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import type { RevenueDataPoint } from '@/lib/data/provider-dashboard';

export function RevenueChart({ data }: { data: RevenueDataPoint[] }) {
  const chartData = data.map((d) => ({ ...d, revenue: d.revenueCents / 100 }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis dataKey="label" axisLine={false} tickLine={false} fontSize={12} />
          <YAxis
            axisLine={false}
            tickLine={false}
            fontSize={12}
            tickFormatter={(v) => `$${v}`}
            width={50}
          />
          <Tooltip
            formatter={(value: number) => [formatCurrency(value * 100), 'Revenue']}
            contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))' }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#2563EB"
            strokeWidth={2}
            fill="url(#revenueGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
