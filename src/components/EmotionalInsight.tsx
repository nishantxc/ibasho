'use client';
import { insightsAPI } from '@/utils/api';
import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function EmotionalInsights({ userId, days=90 }: { userId: string; days?: number }) {
  const [data, setData] = useState<any[]>([]);
  const [narrative, setNarrative] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("HI FELLAS");
    
    (async () => {
      try {
        setLoading(true);
        const json = await insightsAPI.createEmotionalInsights({ range: days })
        console.log(json, "llm json");
        
        const chartData = Array.isArray(json?.trend)
          ? json.trend.map((t: any) => ({
              week: t.week,
              blended: t.avgScore,
              moodAvg: t.avgScore,
              sentAvg: t.avgScore,
            }))
          : []
        setData(chartData);
        setNarrative(typeof json?.narrative === 'string' ? json.narrative : '');
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId, days]);

  if (loading) return <div className="p-4 text-sm text-zinc-600">breathing in… organizing your reflections</div>;
  if (error) return <div className="p-4 text-sm text-red-600">{error}</div>;

  return (
    <div className="rounded-2xl border-0 shadow-xl bg-[#F3E9DC]">
      <div className="p-6 grid gap-6 md:grid-cols-5">
        <div className="md:col-span-3 bg-white/70 rounded-2xl p-4">
          <div className="text-sm text-[#2B2B2B] mb-3">Weekly emotional drift</div>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ left: 12, right: 12, top: 8, bottom: 8 }}>
                <XAxis dataKey="week" tick={{ fontSize: 12 }} tickMargin={8} />
                <YAxis domain={[-2, 2]} tick={{ fontSize: 12 }} tickCount={5} />
                <Tooltip formatter={(v: any) => v} labelFormatter={(l) => `Week of ${l}`} />
                <ReferenceLine y={0} strokeDasharray="4 4" />
                <Line type="monotone" dataKey="moodAvg" dot={false} strokeWidth={2} />
                <Line type="monotone" dataKey="sentAvg" dot={false} strokeWidth={2} />
                <Line type="monotone" dataKey="blended" dot={false} strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mt-3 text-xs text-[#4A4A4A]">
            <span className="inline-flex items-center gap-1">▮ mood</span>
            <span className="inline-flex items-center gap-1">▮ sentiment</span>
            <span className="inline-flex items-center gap-1 font-medium">▮ blended</span>
          </div>
        </div>
        <div className="md:col-span-2 bg-white/70 rounded-2xl p-4 flex flex-col gap-3">
          <div className="text-sm text-[#2B2B2B]">Gentle reflection</div>
          <div className="prose prose-sm max-w-none text-[#2B2B2B] whitespace-pre-wrap">{narrative}</div>
        </div>
      </div>
    </div>
  );
}