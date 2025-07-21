import React from 'react';
import { motion } from 'framer-motion';

const moodOptions = ['Grateful', 'Raw', 'Hopeful', 'Calm', 'Overwhelmed'];

const CheckInForm = ({ 
  caption, 
  moodTag, 
  setMoodTag, 
  handleCaption, 
  submitEntry, 
  photoData,
  error 
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="bg-white rounded-lg shadow-lg p-6 mb-6"
    >
      <div className="mb-4">
        <label className="block text-sm text-gray-500 font-mono mb-2">
          How are you feeling?
        </label>
        <textarea
          value={caption}
          onChange={handleCaption}
          placeholder="Describe your current feelings (100 characters)"
          maxLength={100}
          className="w-full h-24 p-4 border rounded-lg font-mono text-gray-800 placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-pink-300"
          style={{ fontFamily: 'Caveat, cursive' }}
          aria-label="Describe your feeling"
        />
        <div className="text-right text-xs text-gray-500 mt-1 font-mono">
          {caption.length}/100
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm text-gray-500 font-mono mb-2">
          Select your mood:
        </label>
        <div className="grid grid-cols-3 gap-2">
          {moodOptions.map((mood) => (
            <motion.button
              key={mood}
              type="button"
              className={`px-3 py-2 rounded-full text-sm font-mono ${
                moodTag === mood
                  ? 'bg-pink-200 text-gray-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => setMoodTag(mood)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {mood}
            </motion.button>
          ))}
        </div>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-500 text-sm mb-4 font-mono p-2 bg-red-50 rounded"
        >
          {error}
        </motion.div>
      )}

      <motion.button
        onClick={submitEntry}
        disabled={!photoData || !caption || !moodTag}
        className={`w-full py-3 rounded-full text-gray-800 font-medium transition-colors ${
          photoData && caption && moodTag
            ? 'bg-pink-300 hover:bg-pink-400'
            : 'bg-gray-200 opacity-50 cursor-not-allowed'
        }`}
        whileHover={photoData && caption && moodTag ? { scale: 1.02 } : {}}
        whileTap={photoData && caption && moodTag ? { scale: 0.98 } : {}}
        aria-label="Submit Entry"
      >
        {photoData ? "Save This Moment" : "Capture a Photo First"}
      </motion.button>
    </motion.div>
  );
};

export default React.memo(CheckInForm);