import type { RootState } from '@/store/store';
import { Post } from '@/types/types';
import { api } from '@/utils/api';
import { motion } from 'framer-motion';
import { Eye, Send } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { supabase } from '../../supabase/Supabase';

interface MoodBoardProps {
  onSendMessage?: (post: Post) => void;
}

const MoodBoard: React.FC<MoodBoardProps> = ({ onSendMessage }) => {
  const [sharedPosts, setSharedPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  
  const user = useSelector((state: RootState) => state.userProfile);

  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

  const fetchSharedPosts = async (forceRefresh = false) => {
    const now = Date.now();
    // Skip if we have fresh data and not forcing refresh
    if (!forceRefresh && sharedPosts.length > 0 && (now - lastFetchTime) < CACHE_DURATION) {
      console.log("Using cached posts");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.posts.getPosts({ limit: 20 });
      setSharedPosts(response.posts);
      setLastFetchTime(now);
      console.log("Fetched fresh shared posts:", response.posts);
    } catch (error) {
      console.error("Error fetching shared posts:", error);
    } finally {
      setIsLoading(false);
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

  const handleSendMessage = async (post: Post) => {
    try {
      // Get current user ID
      // const { data: { user: currentUser } } = await supabase.auth.getUser();
      // if (!currentUser) return;
  
      // Ensure both users exist in the users table
      // await ensureUserExists(currentUser.id);
      // await ensureUserExists(post.user_id);
  
      // Create chat_id by concatenating user IDs (sorted to ensure consistency)
      const userIds = [user.user_id, post.user_id].sort();
      const chatId = `${userIds[0]}_${userIds[1]}`;
      
      // Create single chat participant row (invitation pending by default)
      await api.chatParticipants.createChatParticipant({
        username: user.username,
        avatar: user.avatar,
        chat_id: chatId,
        user_id: user.user_id, // requester
        sender_id: post.user_id, // recipient
        request_status: 'pending',
      });
  
      // Create chat participant for post owner (recipient)
      // await api.chatParticipants.createChatParticipant({
      //   chat_id: chatId,
      //   user_id: post.user_id,
      //   sender_id: user.user_id
      // });
  
      // Navigate to Whisper tab with the chat context
      if (onSendMessage) {
        onSendMessage(post);
      }
    } catch (error) {
      console.error('Error creating chat participant:', error);
    }
  };
  
  // Helper function to ensure user exists in users table
  const ensureUserExists = async (userId: string) => {
    try {
      const { data: existingUser } = await api.users.getUser(userId);
      if (!existingUser.user || !existingUser.user.user_id) {
        // Create user profile if it doesn't exist
        await api.users.createUser({
          user_id: userId,
          username: `user_${userId.substring(0, 8)}`,
          bio: '',
          avatar: ''
        });
      }
    } catch (error) {
      console.error('Error ensuring user exists:', error);
    }
  };

  useEffect(() => {
    console.log("Checking if we need to fetch posts");
    fetchSharedPosts();
  }, []); // Still runs on mount, but respects cache

  // Add refresh button for manual updates
  const handleRefresh = () => {
    fetchSharedPosts(true); // Force refresh
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full space-y-6"
    >
      <div className="text-center mb-8">
        <h1 className="text-2xl font-serif text-gray-800 mb-2">Community Feed</h1>
        <p className="text-gray-600 font-mono text-sm">
          Shared moments from others who understand
        </p>
        <button 
          onClick={handleRefresh}
          disabled={isLoading}
          className="mt-2 px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200 disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : 'Refresh'}
        </button>
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
                    {!(post.username == user.username) &&
                      <motion.button
                        className="text-gray-500 hover:text-blue-500 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleSendMessage(post)}
                      >
                        <Send size={14} />
                      </motion.button>
                    }
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 font-mono">
                <span>by {post.username == user.username ? "You" : post.username}</span>
                {post.username == user.username && <motion.button
                  className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                >
                  <Eye size={12} />
                  {post.visibility}
                </motion.button>}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default MoodBoard;