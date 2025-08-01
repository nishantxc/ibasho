import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Heart, Share2 } from 'lucide-react';
import PolaroidModal from './PolaroidModal';
import { JournalEntry } from '@/types/types';
import Image from 'next/image';

interface JournalTimelineProps {
  journalEntries?: JournalEntry[];
  onBack?: () => void;
}

const JournalTimeline: React.FC<JournalTimelineProps> = ({
  journalEntries = [],
  onBack
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | undefined>(undefined);

  const handleEntryClick = (entry: JournalEntry) => {
    console.log(entry, "entry");
    setSelectedEntry(entry);
    setIsModalOpen(true);
  }

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEntry(undefined);
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className=" w-full mb-8">
      <h3 className="z-10 text-2xl font-serif text-gray-800 mb-6 text-center">Your Space</h3>

      <div className="min-h-[70vh] relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8 border-8 border-white drop-shadow-md rounded-md">
        {/* <div className="absolute inset-0 z-0 opacity-100 pointer-events-none ">
          <Image
            src="/japan.jpg"
            alt="Moodboard"
            fill
            style={{ objectFit: "cover" }}
          // className="blur-sm"
          />
        </div> */}
        {journalEntries.length <=0 && <div className='flex items-center justify-center w-full h-full text-gray-600'>
        No Journal Entries yet, start decorating your space!
        </div>}
        <AnimatePresence>
          {journalEntries.slice(0, 20).map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
              animate={{ opacity: 1, scale: 1, rotate: entry.rotation }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.05, rotate: 0, transition: { duration: 0.2 } }}
              className="bg-white shadow-lg h-fit"
              style={{
                filter: 'sepia(10%) saturate(110%)',
                transform: `rotate(${entry.rotation}deg)`
              }}
              onClick={() => handleEntryClick(entry)}
            >
              <div className="relative p-2 overflow-visible">
                <img src={entry.photo} alt="Journal entry" className="w-full h-48 object-cover" />
                <div className="absolute -top-4 left-4 w-6 h-8 bg-gradient-to-br from-yellow-200 to-yellow-400 opacity-80 transform rotate-12 pointer-events-none"></div>
                <div className="absolute -top-4 right-4 w-6 h-8 bg-gradient-to-br from-yellow-200 to-yellow-400 opacity-80 transform -rotate-12 pointer-events-none"></div>
              </div>

              <div className="px-4">
                <p className="text-gray-800 font-serif italic text-sm mb-2">
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

      {isModalOpen && (
        <PolaroidModal
          isModalOpen={isModalOpen}
          setIsModalOpen={handleCloseModal}
          entry={selectedEntry}
        />
      )}
    </motion.div>
  );
};

export default JournalTimeline;