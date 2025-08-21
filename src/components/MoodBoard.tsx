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
        icon: <Heart size={12} className="text-emerald-600" />,
        disabled: true,
        className: "inline-flex items-center gap-2 px-3 py-1 text-xs font-mono text-emerald-700 bg-white border border-emerald-500 hover:bg-emerald-500 hover:text-white cursor-default rounded-sm"
      };
    }

    if (hasKnockedDoor) {
      return {
        text: "Whispered",
        icon: <Star size={12} className="text-amber-600" />,
        disabled: true,
        className: "inline-flex items-center gap-2 px-3 py-1 text-xs font-mono text-amber-700 bg-white border border-amber-500 cursor-default rounded-sm"
      };
    }

    return {
      text: "send whisper",
      icon: <MessageCircle size={12} className="text-purple-600" />,
      disabled: false,
      className: "inline-flex items-center gap-2 px-3 py-1 text-xs font-mono text-purple-700 bg-white border border-purple-500 hover:bg-purple-500 hover:text-white transition-all duration-300 cursor-pointer rounded-sm"
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

      <div className="text-center mb-12 relative z-10 flex flex-col items-center gap-1">
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
          className="w-fit p-2 text-sm bg-black font-medium rounded-sm"
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

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 relative z-10">
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
                className="group relative"
              >
                {/* Postcard Container */}
                <div
                  className="p-4 bg-gradient-to-br from-amber-50 via-white to-amber-50 shadow-2xl w-full rounded-sm overflow-hidden border border-black/30"
                  style={{
                    // background: 'linear-gradient(to bottom, #fefefe, #f8f6f1)',
                    filter: 'sepia(5%) saturate(105%)'
                  }}
                >
                  {/* Postcard Header */}
                  {/* <div className="flex justify-between items-start px-4 py-2"> */}
                    {/* <div className="flex flex-col min-w-0">
                      <h1 className="text-lg sm:text-xl font-serif text-gray-800 tracking-wider"
                        style={{ fontFamily: 'Georgia, serif' }}>
                        COMMUNITY POST
                      </h1>
                      <p className="text-xs text-gray-600 mt-1 font-mono">
                        FROM {post.username?.toUpperCase()}'S JOURNEY
                      </p>
                    </div> */}

                    {/* Postmark */}
                    {/* <div className="hidden md:flex justify-end mb-4">
                      <div className="w-16 h-16 rounded-full border-2 border-gray-400 flex items-center justify-center text-xs text-gray-600 font-mono bg-white/80">
                        <div className="text-center">
                          <div>{moment(post.created_at).format('MMM D')}</div>
                          <div className="text-[10px]">POSTMARK</div>
                        </div>
                      </div>
                    </div> */}

                    {/* Visibility indicator */}
                    {/* {post.username === user.username && (
                      <div className="flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-1 rounded-sm text-xs font-mono">
                        <Eye size={10} />
                        {post.visibility}
                      </div>
                    )} */}
                  {/* </div> */}

                  <div className="flex flex-col md:flex-row">

                    {/* Left side - Photo */}
                    <div className="w-full md:w-1/2 p-4 pt-0">
                    <div className="flex flex-col min-w-0 py-2">
                      <h1 className="text-lg sm:text-xl font-serif text-gray-800 tracking-wider"
                        style={{ fontFamily: 'Georgia, serif' }}>
                        COMMUNITY POST
                      </h1>
                      <p className="text-xs text-gray-600 mt-1 font-mono">
                        FROM {post.username?.toUpperCase()}'S JOURNEY
                      </p>
                    </div>
                      <div className="relative overflow-hidden rounded-sm shadow-lg">
                        <Image
                          src={post.photo}
                          alt="Community post"
                          width={400}
                          height={300}
                          className="w-full h-64 md:h-80 object-cover"
                          style={{ filter: 'contrast(1.1) brightness(1.05)' }}
                          sizes="(max-width: 768px) 100vw, 50vw"
                          priority={false}
                        />
                        {/* Subtle vintage overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/10"></div>
                      </div>
                    </div>
                      <div className='w-full h-[1px] md:h-100 md:w-[1px] bg-black/30 rounded-full mx-2'/>

                    {/* Right side - Postcard elements */}
                    <div className="w-full md:w-1/2 p-4 pt-0 flex flex-col">

                      {/* Address lines */}
                      <div className="space-y-3 mb-4">
                        <div className='w-full flex items-end justify-end'>
                        <Image className='hidden md:flex bg-white' src="/stamp.png" alt='stamp' width={100} height={24}/>
                        </div>
                        <div className="flex items-center">
                          <span className="text-xs font-mono text-gray-700 w-12">To:</span>
                          <span className="text-xs font-mono text-gray-800 ml-2 ">Everyone</span>
                          <div className="flex-1 border-b border-gray-300 h-4 ml-2 text-black"></div>
                        </div>
                        <div className="flex items-center">
                          <span className="text-xs font-mono text-gray-700 w-12">From:</span>
                          <span className="text-xs font-mono text-gray-800 ml-2">{post.username}</span>
                          <div className="flex-1 border-b border-gray-300 h-4 ml-2 text-black"></div>
                        </div>
                      </div>

                      {/* Message area */}
                      <div className="relative flex-1">
                        <div className="border border-gray-300 rounded-sm p-4 bg-white/50 min-h-32">
                          <div className="space-y-2">
                            {post.mood && (
                              <p className="text-xs font-mono text-gray-600">
                                Mood: <span className="font-semibold text-gray-800">{post.mood}</span>
                              </p>
                            )}
                            {post.mood && <div className="border-b border-gray-200"></div>}
                            <p className="text-sm font-serif text-gray-800 italic py-2">
                              "{post.caption}"
                            </p>
                          </div>
                        </div>
                        {/* Postmark */}
                        <div className="absolute md:bottom-2 bottom-0 right-2 flex justify-end mb-4 transform rotate-20">
                          <div className="w-16 h-16 rounded-full border-2 border-gray-400 flex items-center justify-center text-xs text-gray-600 font-mono bg-white/80">
                            <div className="text-center">
                              <div>{moment(post.created_at).format('MMM D')}</div>
                              <div className="text-[10px]">POSTMARK</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Profile section with timestamp */}
                      <div className="flex items-center gap-3 mt-4 mb-2">
                        <div className="relative">
                          <div className="h-8 w-8 overflow-hidden rounded-full bg-gradient-to-br from-gray-200 to-gray-300 shadow-md ring-2 ring-gray-300/50">
                            {post.avatar ? (
                              <Image src={post.avatar} alt={post.username} fill className="object-cover" sizes="32px" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-xs text-gray-700 font-bold">
                                {post.username?.slice(0, 1)?.toUpperCase()}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-gray-500 font-mono">
                            {moment(post.created_at).fromNow()}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center justify-between border-t border-gray-200 pt-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-2 py-1 text-xs font-mono text-blue-700 bg-white border border-blue-500 hover:bg-blue-500 hover:text-white transition-all duration-300 rounded-sm"
                          >
                            💙 cherish
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-2 py-1 text-xs font-mono text-purple-700 bg-white border border-purple-500 hover:bg-purple-500 hover:text-white transition-all duration-300 rounded-sm"
                          >
                            ✨ bless
                          </motion.button>
                        </div>

                        {post.username !== user.username && (
                          <motion.button
                            className={buttonState.className}
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

                      {/* Bottom signature */}
                      <div className="mt-2 text-right">
                        <p className="text-[10px] text-gray-500 font-mono">
                          Shared with love ✨
                        </p>
                      </div>
                    </div>
                  </div>
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