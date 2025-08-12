import type { RootState } from '@/store/store';
import { Post } from '@/types/types';
import { api } from '@/utils/api';
import { motion } from 'framer-motion';
import { Eye, Loader, MessageCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { supabase } from '../../supabase/Supabase';
import Image from 'next/image';
import moment from 'moment';

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

  const handleSendMessage = async (post: Post) => {
    try {
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
        initial_post_reference: {
          id: String(post.id),
          caption: post.caption,
          photo: post.photo,
          mood: post.mood || '',
          user_id: post.user_id,
        },
      });
  
      // Navigate to Whisper tab with the chat context
      if (onSendMessage) {
        onSendMessage(post);
      }
    } catch (error) {
      console.error('Error creating chat participant:', error);
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

  if(isLoading){
    return (
      <div className='w-full h-[80vh] flex items-center justify-center bg-transparent'>
        <Loader className="animate-spin text-4xl text-gray-500 mx-auto mt-20" />
      </div>
    )
  }

  // Exclude the current user's own posts from the community feed
  const postsToShow = sharedPosts.filter((post) => post.user_id !== user.user_id);

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {postsToShow.length === 0 ? (
          <div className="col-span-full text-center text-gray-400 font-mono">No shared moments yet.</div>
        ) : (
          postsToShow.map((post: Post, index: number) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              className="rounded-xl border border-gray-200/70 bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-3 pt-3">
                <div className="flex items-center gap-3">
                  <div className="relative h-8 w-8 overflow-hidden rounded-full bg-gray-200">
                    {post.avatar ? (
                      <Image src={post?.avatar} alt={post.username} fill className="object-cover" sizes="32px" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-[10px] text-gray-600 font-mono">
                        {post.username?.slice(0, 2)?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-800 font-medium">{post.username == user.username ? 'You' : post.username}</span>
                    <span className="text-[11px] text-gray-500 font-mono">{moment(post.created_at).fromNow()}</span>
                  </div>
                </div>
                {post.username == user.username && (
                  <div className="flex items-center gap-1 text-[11px] text-gray-600 font-mono">
                    <Eye size={12} />
                    {post.visibility}
                  </div>
                )}
              </div>

              {/* Media */}
              <div className="relative mt-2 px-2">
                <div className="relative w-full h-64 overflow-hidden rounded-lg">
                  <Image
                    src={post.photo}
                    alt="Journal entry"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    priority={false}
                  />
                </div>
              </div>

              {/* Caption */}
              <div className="px-4 pt-3">
                <p className="text-gray-800 text-sm leading-relaxed">
                  {post.caption}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button className="px-2.5 py-1 rounded-full text-[11px] font-mono text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                    you're not alone.
                  </button>
                  <button className="px-2.5 py-1 rounded-full text-[11px] font-mono text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                    looking forward!
                  </button>
                  {post.mood && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-gray-700 bg-gray-100">
                      {post.mood}
                    </span>
                  )}
                </div>
                {post.username !== user.username && (
                  <motion.button
                    className="inline-flex items-center gap-1.5 rounded-full border border-blue-300 bg-blue-50/80 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleSendMessage(post)}
                  >
                    <MessageCircle size={14} />
                    Say hi
                  </motion.button>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 pb-3 text-[11px] text-gray-500 font-mono">
                <span>
                  by {post.username == user.username ? 'You' : post.username}
                </span>
                {/* visibility already displayed for own posts in header */}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default MoodBoard;