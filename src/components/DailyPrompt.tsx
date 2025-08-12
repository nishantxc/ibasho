import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

type Prompt = { text: string; source?: string };

const PROMPTS: Prompt[] = [
  { text: "What truth about yourself have you been avoiding because it might change everything?", source: "Dostoevsky-inspired" },
  { text: "If your inner voice wrote a letter tonight, what would its first sentence be?", source: "Rilke-inspired" },
  { text: "Where do you feel divided inside—and what would reconciliation look like?", source: "Jung-inspired" },
  { text: "What small act of courage is asking to be done today?", source: "Camus-inspired" },
  { text: "What do you cling to that no longer carries you?", source: "Kafka-inspired" },
  { text: "Name the grief you never gave a name. What does it need from you now?" },
  { text: "Which part of you is most tender today, and how can you protect it?" },
  { text: "What expectation could you release to make room for relief?" },
  { text: "If your body could speak without interruption, what would it say?" },
  { text: "Where did you experience meaning today—even if it was brief?", source: "Frankl-inspired" },
  { text: "Who would you be if you gently put down the performance?", source: "Woolf-inspired" },
  { text: "What question keeps returning to you—and what answer are you afraid of?" },
  { text: "Describe a moment today that was almost holy in its quiet." },
  { text: "What are you forgiving yourself for—now, not later?" },
  { text: "Where are you being honest but not kind—or kind but not honest?" },
  { text: "What longing have you outgrown but still carry from habit?" },
  { text: "If your fear could shrink by 10%, what would you attempt?" },
  { text: "What part of your story is you ready to rewrite?" },
  { text: "What would it mean to be on your own side, fully, today?" },
  { text: "Where are you tempted to rush—and what would slowness give you?" },
  { text: "What is the smallest faithful step toward the life you actually want?" },
  { text: "What beauty did you almost miss today? Describe it carefully." },
  { text: "Who are you when nobody is asking anything of you?" },
  { text: "If your heart had weather, what is today’s forecast—and why?" },
  { text: "What boundary would honor your peace without punishing anyone?" },
  { text: "Where does your past still speak too loudly in your present?" },
  { text: "What are you ready to release—even if it leaves a beautiful emptiness?" },
  { text: "What truth would you tell if you knew you would still be loved?" },
  { text: "If hope was a practice (not a feeling), what would you do next?" },
  { text: "What did today teach you about what matters?" },
];

const getDailyIndex = (length: number): number => {
  // Deterministic rotation every 24h (UTC day)
  const day = Math.floor(Date.now() / 86_400_000); // ms in a day
  return Math.abs(day) % length;
};

const DailyPrompt: React.FC = () => {
  const prompt = useMemo(() => PROMPTS[getDailyIndex(PROMPTS.length)], []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-pink-50 to-blue-50 rounded-xl p-6 mb-6 border border-pink-100/70"
    >
      <h2 className="text-lg font-serif text-gray-800 mb-2">Today’s Reflection</h2>
      <blockquote className="text-gray-700 font-mono text-sm italic leading-relaxed">
        “{prompt.text}”
      </blockquote>
      {prompt.source && (
        <div className="mt-2 text-[11px] text-gray-500">{prompt.source}</div>
      )}
      <div className="mt-4 text-xs text-gray-500">This prompt rotates every 24 hours.</div>
    </motion.div>
  );
};

export default DailyPrompt;