import React from "react";
import { motion } from "framer-motion";

const moodOptions = ['Grateful', 'Raw', 'Hopeful', 'Calm', 'Overwhelmed'];

const CheckInForm = ({ caption, moodTag, setMoodTag, handleCaption, submitEntry, photoData, error }) => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <textarea
        value={caption}
        onChange={handleCaption}
        placeholder="How are you feeling? (100 characters)"
        maxLength={100}
        className="w-full h-24 p-4 border rounded-lg font-mono text-gray-800 placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-pink-300"
        style={{ fontFamily: 'Caveat, cursive' }}
        aria-label="Describe your feeling"
      />

      <div className="mt-4">
        <label className="text-sm text-gray-500 font-mono" htmlFor="mood-select">Mood:</label>
        <select
          id="mood-select"
          value={moodTag}
          onChange={(e) => setMoodTag(e.target.value)}
          className="ml-2 p-2 border rounded-lg font-mono"
          aria-label="Select mood"
        >
          <option value="">Select a mood</option>
          {moodOptions.map((mood) => (
            <option key={mood} value={mood}>{mood}</option>
          ))}
        </select>
      </div>

      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-gray-500 font-mono">{caption && caption?.length}/100</span>

        <motion.button
          onClick={submitEntry}
          disabled={!photoData || !caption || !moodTag}
          className="px-6 py-3 bg-blue-200 rounded-full text-gray-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-300 transition-colors"
          whileHover={{ scale: photoData && caption && moodTag ? 1.05 : 1 }}
          whileTap={{ scale: photoData && caption && moodTag ? 0.95 : 1 }}
          aria-label="Submit Entry"
        >
          Capture this moment
        </motion.button>
      </div>

      {error && <p className="text-red-500 text-sm mt-2 font-mono">{error}</p>}
    </motion.div>
  );
};

export default React.memo(CheckInForm); // prevent re-render unless props change
