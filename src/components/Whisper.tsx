import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Heart, MessageCircle, Users, Sparkles, Image } from 'lucide-react';
import { supabase } from '../../supabase/Supabase';
import type { Message, User } from '../types/types';

interface WhisperPageProps {
  initialPostReference?: {
    id: number;
    caption: string;
    photo: string;
    mood: string;
    owner_id: string;
  };
  onBackToCommunity?: () => void;
}

const WhisperPage: React.FC<WhisperPageProps> = ({ 
  initialPostReference, 
  onBackToCommunity 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [selectedMood, setSelectedMood] = useState<string>('#tender');
  const [likedMessages, setLikedMessages] = useState<Set<string>>(new Set());
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const moods = [
    { tag: '#tender', color: '#F7DAD9' },
    { tag: '#numb', color: '#AFCBFF' },
    { tag: '#grateful', color: '#E8F5E8' },
    { tag: '#floating', color: '#F3E8FF' },
    { tag: '#release', color: '#FFF2E8' },
    { tag: '#hope', color: '#E8F8FF' },
    { tag: '#melancholy', color: '#F0F0F0' },
    { tag: '#steady', color: '#E8FFE8' }
  ];

  // Get current user on component mount
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      if (user) {
        await fetchMessages();
        await fetchOnlineUsers();
      }
      setLoading(false);
    };
    getCurrentUser();
  }, []);

  // Fetch messages from Supabase
  const fetchMessages = async () => {
    if (!currentUser) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!messages_sender_id_fkey(name),
          receiver:users!messages_receiver_id_fkey(name)
        `)
        .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedMessages = data?.map((msg: any) => ({
        ...msg,
        sender_name: msg.sender?.name || 'Anonymous',
        is_own_message: msg.sender_id === currentUser.id
      })) || [];

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Fetch online users
  const fetchOnlineUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, username')
        .limit(10);

      if (error) throw error;
      console.log(data, "data");
      setOnlineUsers(data || []);
    } catch (error) {
      console.error('Error fetching online users:', error);
    }
  };

  const generateAnonymousName = (): string => {
    const adjectives = ['gentle', 'quiet', 'soft', 'tender', 'whispered', 'midnight', 'morning', 'peaceful'];
    const nouns = ['soul', 'heart', 'dreamer', 'observer', 'warrior', 'spirit', 'thoughts', 'breath'];
    return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return;

    try {
      const messageData = {
        // sender_id: currentUser.id,
        content: newMessage,
        username: "something"
        // mood: selectedMood,
        // ...(initialPostReference && {
        //   post_reference: initialPostReference
        // })
      };

      const { data, error } = await supabase
        .from('messages')
        .insert([messageData])
        .select()
        .single();

      if (error) throw error;

      // Add the new message to the local state
      const newMessageObj: Message = {
        ...data,
        sender_name: currentUser.user_metadata?.name || generateAnonymousName(),
        is_own_message: true
      };

      setMessages(prev => [...prev, newMessageObj]);
      setNewMessage('');
      
      // Clear post reference after sending
      if (initialPostReference && onBackToCommunity) {
        onBackToCommunity();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleLike = async (messageId: string) => {
    if (!likedMessages.has(messageId)) {
      try {
                 const messageToUpdate = messages.find(m => m.id === messageId);
         if (!messageToUpdate) return;
         
         const { error } = await supabase
           .from('messages')
           .update({ likes: messageToUpdate.likes + 1 })
           .eq('id', messageId);

        if (error) throw error;

        setLikedMessages(prev => new Set([...prev, messageId]));
        setMessages(prev => prev.map(msg =>
          msg.id === messageId ? { ...msg, likes: msg.likes + 1 } : msg
        ));
      } catch (error) {
        console.error('Error liking message:', error);
      }
    }
  };

  const getMoodColor = (mood: string) => {
    const moodObj = moods.find(m => m.tag === mood);
    return moodObj ? moodObj.color : '#F9F9F9';
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center h-64">
        <div className="text-gray-500">Loading whispers...</div>
      </div>
    );
  }

  return (
    <div className="w-full flex max-h-[80vh] bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Sidebar - Online Users */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="w-80 bg-white bg-opacity-60 backdrop-blur-sm border-r border-gray-200 p-6"
        style={{ overflow: 'hidden' }}
      >
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h3 className="text-2xl font-serif text-gray-800 mb-2 text-center">Community Whispers</h3>
            <p className="text-gray-600 text-sm font-mono text-center">
              Share your feelings and connect with others who share your journey.
            </p>
          </motion.div>

          <div className="space-y-3">
            {onlineUsers.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white hover:bg-opacity-50 transition-colors"
              >
                <div className="relative">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    // style={{ backgroundColor: getMoodColor(user.mood) }}
                  >
                    <Sparkles className="w-4 h-4 text-gray-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{user.username}</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">{user.mood}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Post Reference Header */}
        {initialPostReference && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white bg-opacity-80 backdrop-blur-sm border-b border-gray-200 p-4"
          >
            <div className="flex items-center space-x-3">
              <img 
                src={initialPostReference.photo} 
                alt="Post reference" 
                className="w-12 h-12 object-cover rounded-lg"
              />
              <div className="flex-1">
                <p className="text-sm text-gray-800 font-medium">Replying to a post</p>
                <p className="text-xs text-gray-600 truncate">"{initialPostReference.caption}"</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onBackToCommunity}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Messages */}
        <div className="h-full flex-1 p-6 space-y-4 overflow-y-scroll">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`group ${message.is_own_message ? 'flex justify-end' : ''}`}
              >
                <div className={`flex items-start space-x-3 mb-2 max-w-[70%] ${message.is_own_message ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: getMoodColor(message.mood) }}
                  >
                    <MessageCircle className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className={`flex-1 ${message.is_own_message ? 'text-right' : ''}`}>
                    <div className={`flex items-center space-x-2 mb-1 ${message.is_own_message ? 'justify-end' : ''}`}>
                      <span className="text-sm font-medium text-gray-800">{message.sender_name}</span>
                      <span className="text-xs text-gray-500">{message.mood}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-400">{formatTimestamp(message.created_at)}</span>
                    </div>
                    
                    {/* Post Reference */}
                    {message.post_reference && (
                      <div className="mb-2 p-2 bg-gray-100 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Image className="w-4 h-4 text-gray-500" />
                          <span className="text-xs text-gray-600">Referenced post</span>
                        </div>
                      </div>
                    )}
                    
                    <div className={`bg-white bg-opacity-70 backdrop-blur-sm rounded-2xl p-4 shadow-sm ${message.is_own_message ? 'bg-blue-100' : ''}`}>
                      <p className="text-gray-800 leading-relaxed">{message.content}</p>
                    </div>
                    
                    {/* Like Button */}
                    <div className={`flex items-center space-x-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity ${message.is_own_message ? 'justify-end' : ''}`}>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleLike(message.id)}
                        className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs transition-colors ${
                          likedMessages.has(message.id) 
                            ? 'bg-pink-200 text-pink-800' 
                            : 'bg-gray-200 text-gray-600 hover:bg-pink-100'
                        }`}
                      >
                        <Heart className={`w-3 h-3 ${likedMessages.has(message.id) ? 'fill-current' : ''}`} />
                        <span>{message.likes}</span>
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200 bg-white bg-opacity-60 backdrop-blur-sm p-6">
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={initialPostReference ? "Send a message about this post..." : "Share what's on your heart..."}
                className="text-black/80 w-full px-4 py-3 bg-white bg-opacity-70 backdrop-blur-sm rounded-2xl border border-gray-200 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-opacity-50 resize-none"
                rows={2}
                maxLength={280}
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                {newMessage.length}/280
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="px-6 py-3 bg-gradient-to-r from-pink-200 to-blue-200 text-gray-800 rounded-2xl font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transition-shadow"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhisperPage;