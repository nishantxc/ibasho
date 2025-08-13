"use client"

import React, { memo } from 'react'
import { motion } from 'framer-motion'

interface CheckInFormProps {
  caption: string
  moodTag: string
  setMoodTag: (value: string) => void
  setCaption: (value: string) => void
  submitEntry: () => void | Promise<void>
  photoData: string | null
  error: string
  moodScore: number
  setMoodScore: (value: number) => void
}

const CheckInForm = memo<CheckInFormProps>(({ 
  caption,
  moodTag,
  setMoodTag,
  setCaption,
  submitEntry,
  photoData,
  error,
  moodScore,
  setMoodScore,
}) => {
  const moodOptions = [
    // Positive/pleasant
    'Joyful', 'Grateful', 'Hopeful', 'Calm',
    // Engaged/activated
    'Focused', 'Curious',
    // Internalizing/quiet distress
    'Sad', 'Lonely', 'Anxious', 'Overwhelmed',
    // Externalizing/activated distress
    'Angry',
    // Depleted/fatigue
    'Tired',
  ]

  const handleCaptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCaption(e.target.value)
  }

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
          onChange={handleCaptionChange}
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-40 overflow-y-auto pr-1">
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

      <div className="mb-6">
        <label className="block text-sm text-gray-500 font-mono mb-2">
          Rate your mood (1–9):
        </label>
        <div className="px-1">
          <input
            type="range"
            min={1}
            max={9}
            step={1}
            value={moodScore}
            onChange={(e) => setMoodScore(parseInt(e.target.value))}
            className="w-full accent-pink-300"
            aria-label="Mood score from 1 to 9"
          />
          <div className="flex justify-between mt-2 text-[10px] text-gray-500 font-mono">
            {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
              <div key={n} className="flex flex-col items-center" style={{ width: '11%' }}>
                <div className={`w-1 h-1 rounded-full ${moodScore === n ? 'bg-pink-400' : 'bg-gray-300'}`} />
                <span className="mt-1">{n}</span>
                <span className="mt-0.5 h-3">
                  {n === 1 && 'Very tired'}
                  {n === 3 && 'Tired'}
                  {n === 5 && 'Neutral'}
                  {n === 7 && 'Happy'}
                  {n === 9 && 'Very happy'}
                </span>
              </div>
            ))}
          </div>
          <div className="text-right text-xs text-gray-600 mt-2 font-mono">Selected: {moodScore}</div>
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
        {photoData ? 'Save This Moment' : 'Capture a Photo First'}
      </motion.button>
    </motion.div>
  )
})

CheckInForm.displayName = 'CheckInForm'

export default CheckInForm


