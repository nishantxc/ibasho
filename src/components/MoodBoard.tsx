import type { RootState } from '@/store/store';
import { Post } from '@/types/types';
import { api } from '@/utils/api';
import { motion } from 'framer-motion';
import { Eye, Loader, MessageCircle, Sparkles } from 'lucide-react';
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
  const [knockedDoors, setKnockedDoors] = useState<Set<string>>(new Set());
  const [existingChats, setExistingChats] = useState<Set<string>>(new Set());
  
  const user = useSelector((state: RootState) => state.userProfile);

  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

  // Fetch existing chat participants to check if user already reached out
  const fetchExistingChats = async () => {
    if (!user) return;
    try {
      const response = await api.chatParticipants.getChatParticipants();
      const chatIds = new Set<string>();
      
      (response.chat_participants || []).forEach((participant: any) => {
        // Extract the other user's ID from chat_id format "userId1_userId2"
        const [userId1, userId2] = participant.chat_id.split('_');
        const otherUserId = userId1 === user.user_id ? userId2 : userId1;
        chatIds.add(otherUserId);
      });
      
      setExistingChats(chatIds);
    } catch (error) {
      console.error("Error fetching existing chats:", error);
    }
  };

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
    // Prevent multiple requests for the same post
    if (knockedDoors.has(post.user_id) || existingChats.has(post.user_id)) {
      return;
    }

    try {
      setKnockedDoors(prev => new Set(prev).add(post.user_id));
      
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
          username: post.username,
        },
      });

      // Update existing chats to include this new one
      setExistingChats(prev => new Set(prev).add(post.user_id));
  
      // Navigate to Whisper tab with the chat context
      if (onSendMessage) {
        onSendMessage(post);
      }
    } catch (error) {
      console.error('Error creating chat participant:', error);
      // Remove from knocked doors if there was an error
      setKnockedDoors(prev => {
        const newSet = new Set(prev);
        newSet.delete(post.user_id);
        return newSet;
      });
    }
  };

  useEffect(() => {
    console.log("Checking if we need to fetch posts");
    fetchSharedPosts();
    fetchExistingChats();
  }, []); // Still runs on mount, but respects cache

  // Add refresh button for manual updates
  const handleRefresh = () => {
    fetchSharedPosts(true); // Force refresh
    fetchExistingChats(); // Also refresh existing chats
  };

  // Function to determine button state and text
  const getButtonState = (post: Post) => {
    const hasExistingChat = existingChats.has(post.user_id);
    const hasKnockedDoor = knockedDoors.has(post.user_id);
    
    if (hasExistingChat) {
      return {
        text: "Already connected ✨",
        disabled: true,
        className: "inline-flex items-center gap-1.5 rounded-full border border-green-300 bg-green-50/80 px-3 py-1.5 text-xs font-medium text-green-700 cursor-default"
      };
    }
    
    if (hasKnockedDoor) {
      return {
        text: "Door knocked ✨",
        disabled: true,
        className: "inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50/80 px-3 py-1.5 text-xs font-medium text-amber-700 cursor-default"
      };
    }
    
    return {
      text: "Say hello",
      disabled: false,
      className: "inline-flex items-center gap-1.5 rounded-full border border-blue-300 bg-blue-50/80 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
    };
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
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-6 h-6 text-gray-600" />
          <h1 className="text-2xl font-serif text-gray-800">Community Hearts</h1>
        </div>
        <p className="text-gray-600 font-mono text-sm">
          Shared moments from souls who understand
        </p>
        <button 
          onClick={handleRefresh}
          disabled={isLoading}
          className="mt-3 px-4 py-2 text-sm bg-gradient-to-r from-blue-50 to-pink-50 text-gray-700 rounded-full border border-gray-200 hover:bg-gradient-to-r hover:from-blue-100 hover:to-pink-100 disabled:opacity-50 transition-all"
        >
          {isLoading ? 'Loading...' : 'Refresh connections'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {postsToShow.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <MessageCircle className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-400 font-mono">No shared moments yet.</p>
            <p className="text-gray-300 font-mono text-sm mt-1">Be the first to share your heart</p>
          </div>
        ) : (
          postsToShow.map((post: Post, index: number) => {
            const buttonState = getButtonState(post);
            
            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                className="rounded-xl border border-gray-200/70 bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-4 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-9 w-9 overflow-hidden rounded-full bg-gradient-to-br from-blue-100 to-pink-100">
                      {post.avatar ? (
                        <Image src={post?.avatar} alt={post.username} fill className="object-cover" sizes="36px" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-sm text-gray-600 font-medium">
                          {post.username?.slice(0, 1)?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-800 font-medium">{post.username}</span>
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
                <div className="relative mt-3 px-3">
                  <div className="relative w-full h-64 overflow-hidden rounded-xl">
                    <Image
                      src={post.photo}
                      alt="Shared moment"
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
                <div className="flex items-center justify-between px-4 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <button className="px-3 py-1.5 rounded-full text-[11px] font-mono text-gray-600 bg-gray-100/80 hover:bg-gray-200/80 transition-colors">
                      you're not alone 💙
                    </button>
                    <button className="px-3 py-1.5 rounded-full text-[11px] font-mono text-gray-600 bg-gray-100/80 hover:bg-gray-200/80 transition-colors">
                      strength & light ✨
                    </button>
                    {post.mood && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono text-gray-700 bg-gray-50/80 border border-gray-200">
                        {post.mood}
                      </span>
                    )}
                  </div>
                  {post.username !== user.username && (
                    <motion.button
                      className={buttonState.className}
                      whileHover={!buttonState.disabled ? { scale: 1.03 } : {}}
                      whileTap={!buttonState.disabled ? { scale: 0.97 } : {}}
                      onClick={() => !buttonState.disabled && handleSendMessage(post)}
                      disabled={buttonState.disabled}
                    >
                      <MessageCircle size={14} />
                      {buttonState.text}
                    </motion.button>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-4 pb-4 text-[11px] text-gray-500 font-mono border-t border-gray-100/50 pt-3">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                    shared by {post.username == user.username ? 'you' : post.username}
                  </span>
                  <span className="text-gray-400">
                    {moment(post.created_at).format('MMM D')}
                  </span>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
};

export default MoodBoard;