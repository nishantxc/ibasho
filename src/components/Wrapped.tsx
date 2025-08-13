"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { insightsAPI } from "@/utils/api";

/**
 * Premium Illustrated Emotional Wrapped Story
 * — Custom SVG illustrations for archetypes
 * — Personal achievement showcase (not advertisement)
 * — Ultra-premium visual design
 */

export default function PremiumWrappedStory({ days = 90 }: { days?: number }) {
  const [payload, setPayload] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      try {
        setLoading(true)

        // Only call API if the local journal count differs from the last insights count
        let shouldFetch = true
        let lastInsightsCount: number | null = null
        let cachedPayload: any | null = null
        if (typeof window !== 'undefined') {
          try {
            lastInsightsCount = Number(localStorage.getItem('ibasho:lastInsightsCount') || '0')
            const lastJournalCount = Number(localStorage.getItem('ibasho:lastJournalCount') || '0')
            const cached = localStorage.getItem('ibasho:lastInsightsPayload')
            cachedPayload = cached ? JSON.parse(cached) : null
            shouldFetch = lastInsightsCount !== lastJournalCount || !cachedPayload
            if (!shouldFetch && cachedPayload) {
              setPayload(cachedPayload)
              setLoading(false)
              return
            }
          } catch {}
        }

        const json = await insightsAPI.createEmotionalInsights({ range: days })
        const summary = json?.summary
        if (!summary) throw new Error('No summary returned from insights API')

        // Provide safe defaults if fields are missing
        const safePayload = {
          weekLabel: summary.weekLabel ?? "This Week",
          archetype: {
            name: summary.archetype?.name ?? "Your Archetype",
            description: summary.archetype?.description ?? "A reflection of your emotional pattern",
            rarityPct: summary.archetype?.rarityPct ?? 0,
          },
          moodScore: Math.round(Number(summary.moodScore ?? 0)),
          weekSummary: summary.weekSummary ?? "",
          insights: Array.isArray(summary.insights) ? summary.insights : [],
          personalNote: summary.personalNote ?? "",
          theme: {
            bg:
              summary.theme?.bg ??
              `radial-gradient(ellipse 120% 80% at 50% 0%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
               radial-gradient(ellipse 100% 60% at 80% 100%, rgba(236, 72, 153, 0.15) 0%, transparent 50%),
               linear-gradient(135deg, #0f0f23 0%, #1a1a2e 30%, #16213e 70%, #0f0f23 100%)`,
            card: summary.theme?.card ?? "bg-white/[0.08] backdrop-blur-xl border border-white/10",
          },
        }
        setPayload(safePayload)

        // Persist the latest insights payload and count returned by API for gatekeeping
        if (typeof window !== 'undefined') {
          try {
            if (typeof json?.journalCount === 'number') {
              localStorage.setItem('ibasho:lastInsightsCount', String(json.journalCount))
            }
            localStorage.setItem('ibasho:lastInsightsPayload', JSON.stringify(safePayload))
          } catch {}
        }
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    })()
  }, [days])

  return (
    <div className=" w-full min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="border-4 border-white relative w-[380px] sm:w-[420px] rounded-[28px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)]"
        style={{ backgroundImage: payload?.theme?.bg }}
      >
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 opacity-20"
             style={{
               backgroundImage: `
                 radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1) 0%, transparent 20%),
                 radial-gradient(circle at 80% 80%, rgba(255,255,255,0.05) 0%, transparent 20%),
                 radial-gradient(circle at 50% 50%, rgba(255,255,255,0.02) 0%, transparent 30%)
               `
             }}
        />

        {/* Content */}
        <div className="relative h-full p-8 flex flex-col">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <div className="text-white/60 text-xs font-medium tracking-[0.2em] uppercase mb-6">
              {loading ? 'Loading…' : (payload?.weekLabel ?? '')}
            </div>
            
            {/* Custom Archetype Illustration */}
            {/* <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.4, type: "spring", duration: 1 }}
              className="mb-6 h-12 w-12"
            >
              <DeepFeelerIllustration />
            </motion.div> */}
            
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="text-2xl font-black text-white mb-2 tracking-tight"
            >
              {payload?.archetype?.name ?? ''}
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-white/70 text-sm leading-relaxed max-w-xs mx-auto mb-2"
            >
              {payload?.archetype?.description ?? ''}
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2 }}
              className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-white/10 text-white/80 text-xs font-medium"
            >
              {payload ? `Rare type • Only ${payload?.archetype?.rarityPct}% this week` : ' '} 
            </motion.div>
          </motion.div>

          {/* Mood Score - More Integrated */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.4, type: "spring" }}
            className="flex justify-center mb-8"
          >
            <div className="relative">
              <div
                className="w-32 h-32 rounded-full flex items-center justify-center border-4 border-white/10"
                style={{
                  background: `conic-gradient(
                    from -90deg,
                    rgba(139, 92, 246, 1) 0deg,
                    rgba(236, 72, 153, 1) ${(payload?.moodScore ?? 0) * 2}deg,
                    rgba(59, 130, 246, 1) ${(payload?.moodScore ?? 0) * 3.6}deg,
                    rgba(255, 255, 255, 0.1) ${(payload?.moodScore ?? 0) * 3.6}deg
                  )`
                }}
              >
                <div className="w-24 h-24 rounded-full bg-black/60 backdrop-blur flex flex-col items-center justify-center">
                  <div className="text-3xl font-black text-white">{payload?.moodScore ?? 0}</div>
                  <div className="text-[9px] text-white/60 font-bold tracking-widest">OVERALL</div>
                </div>
              </div>
              {/* <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-white/70 text-xs text-center">
                <div className="font-medium">This Week</div>
              </div> */}
            </div>
          </motion.div>

          {/* Personal Journey Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6 }}
            className="text-center mb-8"
          >
            <div className={`${payload?.theme?.card ?? ''} rounded-2xl p-4 shadow-xl`}>
              <div className="text-white/90 text-sm font-medium leading-relaxed">
                "{payload?.weekSummary ?? ''}"
              </div>
              <div className="text-white/50 text-xs mt-2 italic">
                {payload?.personalNote ?? ''}
              </div>
            </div>
          </motion.div>

          {/* Insights Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.2 }}
            className="grid grid-cols-3 gap-3 mb-6"
          >
            {(payload?.insights ?? []).map((insight: any, i: number) => (
              <div key={i} className={`${payload.theme.card} rounded-xl p-3 text-center`}>
                <div className="text-[10px] uppercase tracking-wider text-white/50 mb-1 font-bold">
                  {insight.metric}
                </div>
                <div className="text-xl font-black text-white mb-1">{insight.value}%</div>
                <div className="text-white/70 text-[10px] font-medium">{insight.rank}</div>
              </div>
            ))}
          </motion.div>

          {/* Elegant Footer - No CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.6 }}
            className="text-center mt-auto"
          >
            <div className="text-white/40 text-[10px] tracking-[0.15em] uppercase font-medium">
              Emotional Intelligence • {payload?.weekLabel ?? ''}
            </div>
          </motion.div>

        </div>

        {/* Ambient floating elements */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            style={{
              top: `${20 + i * 25}%`,
              right: `${15 + i * 5}%`
            }}
            animate={{ 
              opacity: [0.2, 0.8, 0.2],
              scale: [0.5, 1.2, 0.5]
            }}
            transition={{ 
              duration: 3 + i, 
              repeat: Infinity, 
              delay: i * 0.7 
            }}
          />
        ))}

      </motion.section>
    </div>
  );
}