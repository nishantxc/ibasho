import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Share2, Eye } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import type { SharedPost } from '@/store/slices/journalEntrySlice';

const MoodBoard: React.FC = () => {
  const sharedPosts = useSelector((state: RootState) => state.sharedPosts);

  const getMoodColor = (mood: string) => {
    const colors: { [key: string]: string } = {
      'Grateful': 'bg-green-100 text-green-800',
      'Raw': 'bg-red-100 text-red-800',
      'Hopeful': 'bg-blue-100 text-blue-800',
      'Tender': 'bg-pink-100 text-pink-800',
      'Overwhelmed': 'bg-purple-100 text-purple-800',
      'Calm': 'bg-teal-100 text-teal-800'
    };
    return colors[mood] || 'bg-gray-100 text-gray-800';
  };

  const getMoodGradient = (mood: string) => {
    const gradients: { [key: string]: string } = {
      'Grateful': 'from-green-50 to-emerald-50',
      'Raw': 'from-red-50 to-pink-50',
      'Hopeful': 'from-blue-50 to-cyan-50',
      'Tender': 'from-pink-50 to-rose-50',
      'Overwhelmed': 'from-purple-50 to-indigo-50',
      'Calm': 'from-teal-50 to-blue-50'
    };
    return gradients[mood] || 'from-gray-50 to-slate-50';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full space-y-6"
    >
      <div className="text-center mb-8">
        <h1 className="text-2xl font-serif text-gray-800 mb-2">Community Moods</h1>
        <p className="text-gray-600 font-mono text-sm">
          Shared moments from others who understand
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sharedPosts.length === 0 ? (
          <div className="col-span-full text-center text-gray-400 font-mono">No shared moments yet.</div>
        ) : (
          sharedPosts.map((post: SharedPost, index: number) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-gradient-to-br ${getMoodGradient(post.mood)} rounded-lg p-2 shadow-lg border border-white/50`}
              whileHover={{ y: -5, scale: 1.02 }}
            >              
              <div className="relative">
                <img src={post.photo} alt="Journal entry" className="w-full h-48 object-cover rounded-lg py-2" />
              </div>
              <div className="mb-4">
                <p className="text-gray-800 font-mono text-sm italic mb-3">
                  "{post.caption}"
                </p>
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs font-mono ${getMoodColor(post.mood)}`}>
                    {post.mood}
                  </span>
                  <div className="flex items-center gap-2">
                    <motion.button
                      className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Heart size={14} />
                      <span className="text-xs">{post.reactions}</span>
                    </motion.button>
                    <motion.button
                      className="text-gray-500 hover:text-blue-500 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    > 
                      <Share2 size={14} />
                    </motion.button>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 font-mono">
                <span>Shared anonymously</span>
                <motion.button
                  className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                  whileHover={{ scale: 1.05 }}
                >
                  <Eye size={12} />
                  View
                </motion.button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-center py-8"
      >
        <p className="text-gray-600 font-mono text-sm mb-4">
          Share your own moment to connect with others
        </p>
        <motion.button
          className="bg-pink-300 hover:bg-pink-400 text-gray-800 px-6 py-3 rounded-full font-medium transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Share Your Moment
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default MoodBoard;