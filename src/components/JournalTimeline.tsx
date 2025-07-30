import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Heart, Share2 } from 'lucide-react';

interface JournalEntry {
  id: number;
  photo: string;
  caption: string;
  mood: string;
  timestamp: string;
  rotation: number;
}

interface JournalTimelineProps {
  journalEntries?: JournalEntry[];
  onBack?: () => void;
}

const JournalTimeline: React.FC<JournalTimelineProps> = ({ 
  journalEntries = [], 
  onBack 
}) => {
  return (
<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
      <h3 className="text-2xl font-serif text-gray-800 mb-6 text-center">Your Journey</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {journalEntries.slice(0, 20).map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
              animate={{ opacity: 1, scale: 1, rotate: entry.rotation }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.05, rotate: 0, transition: { duration: 0.2 } }}
              className="bg-white rounded-lg shadow-lg overflow-hidden transform"
              style={{ filter: 'sepia(10%) saturate(110%)' }}
            >
              <div className="relative">
                <img src={entry.photo} alt="Journal entry" className="w-full h-48 object-cover" />

                <div className="absolute -top-2 left-4 w-8 h-6 bg-yellow-200 opacity-70 transform rotate-12 rounded-sm"></div>
                <div className="absolute -top-2 right-4 w-8 h-6 bg-yellow-200 opacity-70 transform -rotate-12 rounded-sm"></div>
              </div>

              <div className="p-4">
                <p className="text-gray-800 font-mono text-sm mb-2" style={{ fontFamily: 'Caveat, cursive' }}>
                  {entry.caption}
                </p>
                <p className="text-gray-500 text-xs font-mono">
                  {new Date(entry.timestamp).toLocaleDateString()} • {entry.mood}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default JournalTimeline;