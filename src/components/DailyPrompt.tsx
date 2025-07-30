import React from 'react';
import { motion } from 'framer-motion';

const DailyPrompt = () => {
  const prompts = [
    "How does your heart feel today?",
    "What small moment brought you peace?",
    "What are you carrying that you'd like to release?",
    "Where did you find beauty today?",
    "What does your soul need to hear right now?"
  ];

  const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-pink-50 to-blue-50 rounded-lg p-6 mb-6 border border-pink-100"
    >
      <h2 className="text-lg font-serif text-gray-800 mb-2">Today's Reflection</h2>
      <p className="text-gray-600 font-mono text-sm italic">"{randomPrompt}"</p>
    </motion.div>
  );
};

export default DailyPrompt;