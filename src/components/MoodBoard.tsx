import type { RootState } from '@/store/store';
import { Post } from '@/types/types';
import { api } from '@/utils/api';
import { motion } from 'framer-motion';
import { Eye, Loader, MessageCircle, Sparkles, Heart, Star } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
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
        text: "Connected",
        icon: <Heart size={12} className="text-emerald-400" />,
        disabled: true,
        className: "inline-flex items-center gap-2 rounded-full border border-emerald-200/50 bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-2 text-xs font-medium text-emerald-700 cursor-default shadow-sm backdrop-blur-sm"
      };
    }

    if (hasKnockedDoor) {
      return {
        text: "Whispered",
        icon: <Star size={12} className="text-amber-400" />,
        disabled: true,
        className: "inline-flex items-center gap-2 rounded-full border border-amber-200/50 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-2 text-xs font-medium text-amber-700 cursor-default shadow-sm backdrop-blur-sm"
      };
    }

    return {
      text: "Send whisper",
      icon: <MessageCircle size={12} className="text-purple-400" />,
      disabled: false,
      className: "inline-flex items-center gap-2 rounded-full border border-purple-200/50 bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-2 text-xs font-medium text-purple-700 hover:from-purple-100 hover:to-pink-100 transition-all duration-300 cursor-pointer shadow-sm backdrop-blur-sm hover:shadow-md"
    };
  };

  if (isLoading) {
    return (
      <div className='w-full h-[80vh] flex items-center justify-center bg-transparent'>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="relative"
        >
          <Sparkles className="text-4xl text-purple-400 mx-auto mt-20" />
          <div className="absolute -inset-2 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-lg"></div>
        </motion.div>
      </div>
    )
  }

  // Exclude the current user's own posts from the community feed
  const postsToShow = sharedPosts.filter((post) => post.user_id !== user.user_id);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full space-y-8 relative"
    >
      {/* Magical background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-purple-200/20 to-pink-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-blue-200/20 to-cyan-200/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-gradient-to-r from-rose-200/20 to-orange-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="text-center mb-12 relative z-10">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-center gap-3"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles className="w-6 h-6 text-black" />
          </motion.div>
          <p className="text-2xl font-serif text-gray-800">
            Community Feed
          </p>
        </motion.div>
        <p className="text-gray-600 font-mono text-sm">
          Shared moments from souls who understand</p>
        <motion.button
          onClick={handleRefresh}
          disabled={isLoading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 text-sm bg-gradient-to-r from-purple-100 via-pink-100 to-rose-100 text-purple-800 rounded-full border border-purple-200/50 hover:from-purple-200 hover:via-pink-200 hover:to-rose-200 disabled:opacity-50 transition-all duration-300 shadow-lg backdrop-blur-sm font-medium"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader className="w-4 h-4 animate-spin" />
              Weaving magic...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Refresh feed
            </span>
          )}
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        {postsToShow.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.8 }}
              className="relative inline-block mb-6"
            >
              <MessageCircle className="w-16 h-16 mx-auto text-purple-300" />
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-200/30 to-pink-200/30 rounded-full blur-xl"></div>
            </motion.div>
            <p className="text-purple-400 font-serif text-xl mb-2">The realm awaits your first whisper</p>
            <p className="text-gray-400 font-serif italic">Share your heart to begin the magic</p>
          </div>
        ) : (
          postsToShow.map((post: Post, index: number) => {
            const buttonState = getButtonState(post);

            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 30, rotateX: 15 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
                // whileHover={{ y: -8, rotateX: 5 }}
                className="group relative"
              >
                {/* Outer ornate border frame */}
                <div style={{
                  background: 'linear-gradient(to bottom, #fefefe, #f8f6f1)',
                  filter: 'sepia(5%) saturate(105%)'
                }} className="relative bg-white rounded-lg p-4 shadow-lg">

                  {/* Corner decorative elements */}
                  <div className="absolute top-2 left-2 w-6 h-6 border-l-2 border-t-2 border-amber-400/60 rounded-tl-lg"></div>
                  <div className="absolute top-2 right-2 w-6 h-6 border-r-2 border-t-2 border-amber-400/60 rounded-tr-lg"></div>
                  <div className="absolute bottom-2 left-2 w-6 h-6 border-l-2 border-b-2 border-amber-400/60 rounded-bl-lg"></div>
                  <div className="absolute bottom-2 right-2 w-6 h-6 border-r-2 border-b-2 border-amber-400/60 rounded-br-lg"></div>

                  {/* Top ornate label */}
                  {/* <div className="relative mb-4">
                    <div className="bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 rounded-2xl px-6 py-2 text-center border-2 border-amber-300/50 shadow-inner">
                      <div className="flex items-center justify-center gap-2">
                        <Star className="w-4 h-4 text-amber-600" />
                        <h3 className="font-serif text-sm text-amber-800 tracking-wider uppercase">{post.username}</h3>
                        <Star className="w-4 h-4 text-amber-600" />
                      </div>
                      <div className="w-16 h-0.5 bg-amber-400 mx-auto mt-1 rounded-full"></div>
                    </div>
                  </div> */}

                  {/* Main content area with inset border */}
                  {/* <div className="bg-gradient-to-br from-cream-50 via-white to-amber-50/30 rounded-2xl border-2 border-amber-300/30 shadow-inner p-1"> */}

                  {/* Dark magical window frame */}
                  {/* <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 rounded-xl relative overflow-hidden"> */}

                  {/* Magical stars scattered in background */}
                  <div className="absolute inset-0 opacity-60">
                    <div className="absolute top-4 left-8 text-yellow-300">
                      <Star className="w-3 h-3" />
                    </div>
                    <div className="absolute top-12 right-12 text-yellow-200">
                      <Sparkles className="w-2 h-2" />
                    </div>
                    <div className="absolute bottom-20 left-6 text-yellow-400">
                      <Star className="w-2 h-2" />
                    </div>
                    <div className="absolute bottom-8 right-8 text-yellow-300">
                      <Sparkles className="w-3 h-3" />
                    </div>
                    <div className="absolute top-1/3 right-6 text-yellow-200">
                      <Star className="w-2 h-2" />
                    </div>
                    <div className="absolute top-2/3 left-12 text-yellow-400">
                      <Sparkles className="w-2 h-2" />
                    </div>
                  </div>

                  {/* Username tag in top left */}
                  {/* <div className="absolute top-4 left-4 z-20">
                        <div className="bg-gradient-to-r from-amber-600 to-yellow-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg border border-amber-500">
                          {post.username}
                        </div>
                      </div> */}

                  {/* Visibility indicator for own posts */}
                  {post.username == user.username && (
                    <div className="absolute top-4 right-4 z-20">
                      <div className="flex items-center gap-1 bg-slate-600/80 text-white px-2 py-1 rounded-full text-xs backdrop-blur-sm">
                        <Eye size={10} />
                        {post.visibility}
                      </div>
                    </div>
                  )}

                  {/* Main image */}
                  <div className="relative w-full h-80">
                    <div className="relative w-full h-full rounded-lg overflow-hidden border-2 border-amber-400/30 shadow-inner">
                      <Image
                        src={post.photo}
                        alt="Enchanted moment"
                        fill
                        className="object-cover transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        priority={false}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                    </div>
                  </div>
                  {/* </div> */}

                  {/* Caption area with parchment feel */}
                  <div className="bg-gradient-to-br from-cream-100 via-amber-50 to-cream-100 rounded-xl mt-2 p-5 border border-amber-200/50 shadow-inner">
                    <p className="text-slate-700 text-base leading-relaxed font-serif text-center italic">
                      "{post.caption}"
                    </p>

                    {/* Divider line */}
                    <div className="flex items-center gap-3 my-4">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent"></div>
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent"></div>
                    </div>

                    {/* Profile section */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="relative">
                        <div className="h-10 w-10 overflow-hidden rounded-full bg-gradient-to-br from-amber-200 to-yellow-200 shadow-md ring-2 ring-amber-300/50">
                          {post.avatar ? (
                            <Image src={post?.avatar} alt={post.username} fill className="object-cover" sizes="40px" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-sm text-amber-700 font-bold">
                              {post.username?.slice(0, 1)?.toUpperCase()}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-slate-600 font-serif">
                          Shared by <span className="font-medium text-slate-800">{post.username == user.username ? 'you' : post.username}</span>
                        </div>
                        <div className="text-xs text-slate-500 font-serif italic">
                          {moment(post.created_at).format('MMMM Do, YYYY')} • {moment(post.created_at).fromNow()}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center justify-between">
                      <div className="flex flex-wrap items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-3 py-1.5 rounded-full text-xs font-serif text-blue-700 bg-gradient-to-r from-blue-100/80 to-cyan-100/80 hover:from-blue-200/80 hover:to-cyan-200/80 transition-all duration-300 border border-blue-200/50 shadow-sm"
                        >
                          💙 cherished
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-3 py-1.5 rounded-full text-xs font-serif text-purple-700 bg-gradient-to-r from-purple-100/80 to-pink-100/80 hover:from-purple-200/80 hover:to-pink-200/80 transition-all duration-300 border border-purple-200/50 shadow-sm"
                        >
                          ✨ blessed
                        </motion.button>
                        {post.mood && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-serif text-rose-700 bg-gradient-to-r from-rose-100/80 to-orange-100/80 border border-rose-200/50 shadow-sm">
                            🌸 {post.mood}
                          </span>
                        )}
                      </div>

                      {post.username !== user.username && (
                        <motion.button
                          className={buttonState.className + " font-serif"}
                          whileHover={!buttonState.disabled ? { scale: 1.05, y: -1 } : {}}
                          whileTap={!buttonState.disabled ? { scale: 0.95 } : {}}
                          onClick={() => !buttonState.disabled && handleSendMessage(post)}
                          disabled={buttonState.disabled}
                        >
                          {buttonState.icon}
                          {buttonState.text}
                        </motion.button>
                      )}
                    </div>
                  </div>
                  {/* </div> */}
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