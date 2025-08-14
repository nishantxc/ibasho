"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

// Mock API function for demo
const insightsAPI = {
  createEmotionalInsights: async ({ range }: { range: number }) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      journalCount: 15,
      summary: {
        weekLabel: "Week 32 • Aug 4–11",
        archetype: {
          name: "The Warrior",
          description: "A resilient and determined soul, forged in the fire of adversity.",
          rarityPct: 60
        },
        moodScore: 72,
        weekSummary: "This week was a tumultuous journey of emotions, with moments of overwhelming darkness and fleeting glimpses of joy.",
        insights: [
          { metric: "Calm", value: 65, rank: "Below Average" },
          { metric: "Joy", value: 89, rank: "Above Average" },
          { metric: "Resilience", value: 74, rank: "Average" }
        ],
        personalNote: "It's clear that you're facing challenges, but don't lose sight of the moments of joy and calm. They're a testament to your strength.",
        theme: {
          bg: "#8B5CF6", // Purple theme
          card: "bg-white/10 backdrop-blur-sm border border-white/20"
        }
      }
    };
  }
};

// Utility function to determine if a color is light or dark
const isLightColor = (color: string): boolean => {
  if (!color) return false;
  
  // Handle hex colors
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate brightness using standard formula
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128;
  }
  
  // For other color formats, assume dark for safety
  return false;
};

// Create gradient background based on theme
const createGradientBackground = (themeColor: string, isLight: boolean) => {
  if (!themeColor) {
    return `radial-gradient(ellipse 120% 80% at 50% 0%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse 100% 60% at 80% 100%, rgba(236, 72, 153, 0.15) 0%, transparent 50%),
            linear-gradient(135deg, #0f0f23 0%, #1a1a2e 30%, #16213e 70%, #0f0f23 100%)`;
  }
  
  const baseColor = themeColor.replace('#', '');
  const r = parseInt(baseColor.substr(0, 2), 16);
  const g = parseInt(baseColor.substr(2, 2), 16);
  const b = parseInt(baseColor.substr(4, 2), 16);
  
  if (isLight) {
    return `radial-gradient(ellipse 120% 80% at 50% 0%, rgba(${r}, ${g}, ${b}, 0.3) 0%, rgba(255, 255, 255, 0.1) 50%),
            radial-gradient(ellipse 100% 60% at 80% 100%, rgba(${r}, ${g}, ${b}, 0.2) 0%, transparent 50%),
            linear-gradient(135deg, #f8f9fa 0%, #e9ecef 30%, #dee2e6 70%, #f8f9fa 100%)`;
  } else {
    return `radial-gradient(ellipse 120% 80% at 50% 0%, rgba(${r}, ${g}, ${b}, 0.4) 0%, transparent 50%),
            radial-gradient(ellipse 100% 60% at 80% 100%, rgba(${r}, ${g}, ${b}, 0.3) 0%, transparent 50%),
            linear-gradient(135deg, #0f0f23 0%, #1a1a2e 30%, #16213e 70%, #0f0f23 100%)`;
  }
};

export default function PremiumWrappedStory({ days = 90 }: { days?: number }) {
  const [payload, setPayload] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const json = await insightsAPI.createEmotionalInsights({ range: days });
        const summary = json?.summary;
        if (!summary) throw new Error('No summary returned from insights API');

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
            bg: summary.theme?.bg ?? "#8B5CF6",
            card: summary.theme?.card ?? "bg-white/[0.08] backdrop-blur-xl border border-white/10",
          },
        };
        setPayload(safePayload);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [days]);

  // Determine if theme is light
  const isLight = payload ? isLightColor(payload.theme.bg) : false;
  const textColor = isLight ? 'text-gray-800' : 'text-white';
  const textColorSecondary = isLight ? 'text-gray-600' : 'text-white/70';
  const textColorTertiary = isLight ? 'text-gray-500' : 'text-white/60';
  const textColorQuaternary = isLight ? 'text-gray-400' : 'text-white/50';

  const gradientBg = payload ? createGradientBackground(payload.theme.bg, isLight) : '';

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 bg-gray-100">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="border-4 border-white relative w-[380px] sm:w-[420px] rounded-[28px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)]"
        style={{
          background: gradientBg
        }}
      >
        {/* Content */}
        <div className="relative h-full p-8 flex flex-col">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <div className={`${textColorTertiary} text-xs font-medium tracking-[0.2em] uppercase mb-6`}>
              {loading ? 'Loading…' : (payload?.weekLabel ?? '')}
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className={`text-2xl font-black ${textColor} mb-2 tracking-tight`}
            >
              {payload?.archetype?.name ?? ''}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className={`${textColorSecondary} text-sm leading-relaxed max-w-xs mx-auto mb-2`}
            >
              {payload?.archetype?.description ?? ''}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2 }}
              className={`inline-block px-4 py-1.5 rounded-full ${isLight ? 'bg-black/10 border border-black/20' : 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-white/10'} ${textColorSecondary} text-xs font-medium`}
            >
              {payload ? `Rare type • Only ${payload?.archetype?.rarityPct}% this week` : ' '}
            </motion.div>
          </motion.div>

          {/* Improved Mood Score */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.4, type: "spring" }}
            className="flex justify-center mb-8"
          >
            <div className="relative">
              {/* Outer ring with gradient */}
              <div className="w-28 h-28 rounded-full relative">
                {/* Background circle */}
                <div className={`absolute inset-0 rounded-full ${isLight ? 'bg-black/10' : 'bg-white/10'}`}></div>
                
                {/* Progress ring */}
                <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke={isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"}
                    strokeWidth="4"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="url(#moodGradient)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${(payload?.moodScore ?? 0) * 2.64} 264`}
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="moodGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="50%" stopColor="#EC4899" />
                      <stop offset="100%" stopColor="#3B82F6" />
                    </linearGradient>
                  </defs>
                </svg>
                
                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className={`text-2xl font-black ${textColor}`}>
                    {payload?.moodScore ?? 0}
                  </div>
                  <div className={`text-[10px] ${textColorQuaternary} font-bold tracking-widest`}>
                    MOOD
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Personal Journey Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6 }}
            className="text-center mb-8"
          >
            <div className={`${isLight ? 'bg-white/40 backdrop-blur-sm border border-black/20' : 'bg-white/10 backdrop-blur-xl border border-white/20'} rounded-2xl p-4 shadow-xl`}>
              <div className={`${textColor} text-sm font-medium leading-relaxed`}>
                "{payload?.weekSummary ?? ''}"
              </div>
              <div className={`${textColorTertiary} text-xs mt-2 italic`}>
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
              <div 
                key={i} 
                className={`${isLight ? 'bg-white/40 backdrop-blur-sm border border-black/20' : 'bg-white/10 backdrop-blur-xl border border-white/20'} rounded-xl p-3 text-center`}
              >
                <div className={`text-[10px] uppercase tracking-wider ${textColorQuaternary} mb-1 font-bold`}>
                  {insight.metric}
                </div>
                <div className={`text-xl font-black ${textColor} mb-1`}>
                  {insight.value}%
                </div>
                <div className={`${textColorSecondary} text-[10px] font-medium`}>
                  {insight.rank}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Elegant Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.6 }}
            className="text-center mt-auto"
          >
            <div className={`${textColorQuaternary} text-[10px] tracking-[0.15em] uppercase font-medium`}>
              Emotional Intelligence • {payload?.weekLabel ?? ''}
            </div>
          </motion.div>
        </div>

        {/* Ambient floating elements */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-1 h-1 ${isLight ? 'bg-black/20' : 'bg-white/20'} rounded-full`}
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