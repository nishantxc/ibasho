import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Share2, Eye, MessageCircle, Text, MessageSquareHeart, LucideMessageSquareX, Send, Star } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { api } from '@/utils/api';
import { Post } from '@/types/types';

interface MoodBoardProps {
  onSendMessage?: (post: Post) => void;
}

const MoodBoard: React.FC<MoodBoardProps> = ({ onSendMessage }) => {

  const [sharedPosts, setSharedPosts] = useState<Post[]>([]);


  const { id, username, mood, avatar, bio } = useSelector((state: RootState) => state.userProfile);

  const fetchSharedPosts = async () => {
    try {
      const response = await api.posts.getPosts({ limit: 20 });
      setSharedPosts(response.posts);
      console.log("Fetched shared posts:", response.posts);
      // return response.posts;  // Return the fetched posts
    } catch (error) {
      console.error("Error fetching shared posts:", error);
      return [];  // Return an empty array on error
    }
  };

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

  const handleSendMessage = (post: Post) => {
    if (onSendMessage) {
      onSendMessage(post);
    }
  };

  useEffect(() => {
    console.log("Fetching fetchSharedPosts on mount");
    fetchSharedPosts();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full space-y-6"
    >
      <div className="text-center mb-8">
        <h1 className="text-2xl font-serif text-gray-800 mb-2">Community sdfdsf Feed</h1>
        <p className="text-gray-600 font-mono text-sm">
          Shared moments from others who understand
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sharedPosts.length === 0 ? (
          <div className="col-span-full text-center text-gray-400 font-mono">No shared moments yet.</div>
        ) : (
          sharedPosts.map((post: Post, index: number) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-gradient-to-br  rounded-lg p-2 shadow-lg border border-white/50`}
            // whileHover={{ y: -5, scale: 1.02 }}
            >
              {/* ${getMoodGradient(post.mood)} */}
              <div className="relative">
                <img src={post.photo} alt="Journal entry" className="w-full h-48 object-cover rounded-lg py-2" />
              </div>
              <div className="mb-4">
                <p className="text-gray-800 font-mono text-sm italic mb-3">
                  {post.caption}
                </p>
                <div className="flex items-center justify-between">
                  {/* <span className={`px-3 py-1 rounded-full text-xs font-mono `}>
                    {post.mood}
                  </span> */}
                  <div className="flex items-center gap-2">
                    <motion.button
                      className="text-[12px] flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      you're not alone.
                    </motion.button>
                    <motion.button
                      className="text-[12px] flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      looking forward!
                    </motion.button>
                    {post.username === username && <motion.button
                      className="text-gray-500 hover:text-blue-500 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleSendMessage(post)}
                    >
                      <Send size={14} />
                    </motion.button>}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 font-mono">
                <span>by {post.username}</span>
                <motion.button
                  className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                >
                  <Eye size={12} />
                  {post.visibility}
                </motion.button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default MoodBoard;