import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Heart, MessageCircle, Users, Sparkles } from 'lucide-react';

interface Message {
  id: number;
  author: string;
  content: string;
  timestamp: string;
  mood: string;
  likes: number;
}

interface User {
  id: number;
  name: string;
  mood: string;
  lastSeen: string;
}

const WhisperPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      author: 'gentle soul',
      content: 'The rain today feels like permission to be sad.',
      timestamp: '2 min ago',
      mood: '#tender',
      likes: 3
    },
    {
      id: 2,
      author: 'quiet observer',
      content: 'Found a moment of peace in my morning coffee. Small victories.',
      timestamp: '5 min ago',
      mood: '#grateful',
      likes: 7
    },
    {
      id: 3,
      author: 'midnight dreamer',
      content: 'Sometimes I wonder if anyone else feels this untethered.',
      timestamp: '12 min ago',
      mood: '#floating',
      likes: 5
    },
    {
      id: 4,
      author: 'soft warrior',
      content: 'Crying felt good today. Like releasing what I was carrying.',
      timestamp: '18 min ago',
      mood: '#release',
      likes: 9
    },
    {
      id: 5,
      author: 'tender heart',
      content: 'The sunset reminded me that endings can be beautiful too.',
      timestamp: '24 min ago',
      mood: '#hope',
      likes: 12
    }
  ]);

  const [onlineUsers] = useState<User[]>([
    { id: 1, name: 'gentle soul', mood: '#tender', lastSeen: 'now' },
    { id: 2, name: 'quiet observer', mood: '#grateful', lastSeen: 'now' },
    { id: 3, name: 'midnight dreamer', mood: '#floating', lastSeen: '3m' },
    { id: 4, name: 'soft warrior', mood: '#release', lastSeen: 'now' },
    { id: 5, name: 'tender heart', mood: '#hope', lastSeen: '1m' },
  ]);

  const [newMessage, setNewMessage] = useState<string>('');
  const [selectedMood, setSelectedMood] = useState<string>('#tender');
  const [likedMessages, setLikedMessages] = useState<Set<number>>(new Set());

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

  const generateAnonymousName = (): string => {
    const adjectives = ['gentle', 'quiet', 'soft', 'tender', 'whispered', 'midnight', 'morning', 'peaceful'];
    const nouns = ['soul', 'heart', 'dreamer', 'observer', 'warrior', 'spirit', 'thoughts', 'breath'];
    return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: messages.length + 1,
        author: generateAnonymousName(),
        content: newMessage,
        timestamp: 'now',
        mood: selectedMood,
        likes: 0
      };
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleLike = (messageId: number) => {
    if (!likedMessages.has(messageId)) {
      setLikedMessages(prev => new Set([...prev, messageId]));
      setMessages(prev => prev.map(msg =>
        msg.id === messageId ? { ...msg, likes: msg.likes + 1 } : msg
      ));
    }
  };

  const getMoodColor = (mood: string) => {
    const moodObj = moods.find(m => m.tag === mood);
    return moodObj ? moodObj.color : '#F9F9F9';
  };

  return (
    <div className="w-full flex h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Sidebar - Online Users */}
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
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

          <div className="flex items-center space-x-2 mb-6">
            <Users className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-600 font-medium">
              {onlineUsers.filter(u => u.lastSeen === 'now').length} souls present
            </span>
          </div>

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
                    style={{ backgroundColor: getMoodColor(user.mood) }}
                  >
                    <Sparkles className="w-4 h-4 text-gray-600" />
                  </div>
                  {user.lastSeen === 'now' && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{user.name}</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">{user.mood}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-400">{user.lastSeen === 'now' ? 'online' : user.lastSeen}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 p-6 space-y-4" style={{ overflow: 'hidden', minHeight: 0 }}>
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="flex items-start space-x-3 mb-2">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: getMoodColor(message.mood) }}
                  >
                    <MessageCircle className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium text-gray-800">{message.author}</span>
                      <span className="text-xs text-gray-500">{message.mood}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-400">{message.timestamp}</span>
                    </div>
                    <div className="bg-white bg-opacity-70 backdrop-blur-sm rounded-2xl p-4 shadow-sm">
                      <p className="text-gray-800 leading-relaxed">{message.content}</p>
                    </div>
                    {/* Like Button */}
                    <div className="flex items-center space-x-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
          {/* Mood Selector */}
          {/* <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2 font-medium">How are you feeling?</p>
            <div className="flex flex-wrap gap-2">
              {moods.map(mood => (
                <motion.button
                  key={mood.tag}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedMood(mood.tag)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedMood === mood.tag
                      ? 'ring-2 ring-gray-400 ring-opacity-50'
                      : 'hover:ring-2 hover:ring-gray-300 hover:ring-opacity-50'
                  }`}
                  style={{ 
                    backgroundColor: mood.color,
                    color: '#374151'
                  }}
                >
                  {mood.tag}
                </motion.button>
              ))}
            </div>
          </div> */}

          {/* Message Input */}
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Share what's on your heart..."
                className="w-full px-4 py-3 bg-white bg-opacity-70 backdrop-blur-sm rounded-2xl border border-gray-200 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-opacity-50 resize-none"
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