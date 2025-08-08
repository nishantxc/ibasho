import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageCircle, Sparkles } from 'lucide-react';
import { supabase } from '../../supabase/Supabase';
import { api } from '@/utils/api';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

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

type ChatMessage = {
  id: string;
  user_id: string;
  username: string;
  content: string;
  created_at: string;
  chat_id: string;
  is_own_message?: boolean;
};

const WhisperPage: React.FC<WhisperPageProps> = ({ 
  initialPostReference, 
  onBackToCommunity 
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatParticipants, setChatParticipants] = useState<any[]>([]);
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);
  const [sentInvites, setSentInvites] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [selectedChatId, setSelectedChatId] = useState<string>('');

  const user = useSelector((state: RootState) => state.userProfile);

  // Remove moods/likes for simplified chat

  // Fetch messages from Supabase
  // const fetchMessages = async () => {
  //   if (!currentUser) return;

  //   try {
  //     const { data, error } = await supabase
  //       .from('messages')
  //       .select(`
  //         *,
  //         sender:users!messages_sender_id_fkey(name),
  //         receiver:users!messages_receiver_id_fkey(name)
  //       `)
  //       .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
  //       .order('created_at', { ascending: true });

  //     if (error) throw error;

  //     const formattedMessages = data?.map((msg: any) => ({
  //       ...msg,
  //       sender_name: msg.sender?.name || 'Anonymous',
  //       is_own_message: msg.sender_id === currentUser.id
  //     })) || [];

  //     setMessages(formattedMessages);
  //   } catch (error) {
  //     console.error('Error fetching messages:', error);
  //   }
  // };

  // Fetch chat participants for current user
  const fetchChatParticipants = async () => {
    if (!user) return;

    console.log(user, "fetchChatParticipants user");
    
    try {
      const response = await api.chatParticipants.getChatParticipants();
      console.log(response, "response.chatParticipants");
      const list = response.chat_participants || [];
      console.log(list, "listtttttttt");
      
      // current user id
      const currentId = user.user_id;
      const accepted = list.filter((p: any) => p.request_status === 'accepted');
      const pending = list.filter((p: any) => p.request_status === 'pending' && p.sender_id === currentId);
      const sent = list.filter((p: any) => p.request_status === 'pending' && p.user_id === currentId);
      setChatParticipants(accepted);
      setPendingInvites(pending);
      setSentInvites(sent);
      // Auto-select first chat if none selected
      if (!selectedChatId && list.length > 0) {
        setSelectedChatId(list[0].chat_id);
      }
    } catch (error) {
      console.error('Error fetching chat participants:', error);
    }
  };

  // Update useEffect to fetch chat participants
  useEffect(() => {
    if (user) {
      fetchChatParticipants();
    }
  }, []);

  // If opened with a post reference, pre-select its chat
  useEffect(() => {
    if (user && initialPostReference) {
      const userIds = [user.user_id, initialPostReference.owner_id].sort();
      const chatId = `${userIds[0]}_${userIds[1]}`;
      setSelectedChatId(chatId);
    }
  }, [user, initialPostReference]);

  // Update fetchMessages to use chat_id
  const fetchMessages = async (chatId?: string) => {
    if (!user || !chatId) return;

    try {
      const response = await api.messages.getMessages({ chat_id: chatId });
      console.log(response, 'messages');
      const formatted: ChatMessage[] = (response.messages || []).map((m: any) => ({
        id: m.id,
        user_id: m.user_id,
        username: m.username || 'Anonymous',
        content: m.content,
        created_at: m.created_at,
        chat_id: m.chat_id,
        is_own_message: m.user_id === user.user_id,
      }));
      setMessages(formatted);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Update handleSendMessage to use chat_id
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    try {
      let chatId = selectedChatId;
      if (!chatId && initialPostReference) {
        const userIds = [user.user_id, initialPostReference.owner_id].sort();
        chatId = `${userIds[0]}_${userIds[1]}`;
        setSelectedChatId(chatId);
      }
      if (!chatId) return;

      const result = await api.messages.createMessage({ content: newMessage, chat_id: chatId });
      const m = result.message;
      const newMsg: ChatMessage = {
        id: m.id,
        user_id: m.user_id,
        username: m.username || 'Anonymous',
        content: m.content,
        created_at: m.created_at,
        chat_id: m.chat_id,
        is_own_message: true,
      };
      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Add sidebar for chat participants
  const RenderSidebar = () => (
    <div className="w-full bg-white p-4">
      <h3 className="font-semibold text-gray-800 border border-gray-200 p-4 mb-2">Requests</h3>
      <div className="space-y-2 mb-4">
        {pendingInvites.length === 0 && (
          <p className="text-sm text-gray-500 px-4">No requests</p>
        )}
        {pendingInvites.map((invite) => (
          <div key={invite.id} className="flex items-center justify-between px-4 py-2 rounded border">
            <div className="flex items-center gap-3">
              <div className='border border-black text-black rounded-full px-2'>
                {(invite.requester?.username || 'U').substring(0, 1)}
              </div>
              <p className="text-sm text-black font-medium">{invite.requester?.username || 'Unknown'}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="text-xs px-2 py-1 rounded bg-green-100 text-green-700"
                onClick={async () => {
                  await api.chatParticipants.updateChatParticipantStatus({ chat_id: invite.chat_id, request_status: 'accepted' })
                  fetchChatParticipants()
                }}
              >
                Accept
              </button>
              <button
                className="text-xs px-2 py-1 rounded bg-red-100 text-red-700"
                onClick={async () => {
                  await api.chatParticipants.updateChatParticipantStatus({ chat_id: invite.chat_id, request_status: 'declined' })
                  fetchChatParticipants()
                }}
              >
                Decline
              </button>
            </div>
          </div>
        ))}
      </div>

      <h3 className="font-semibold text-gray-800 border border-gray-200 p-4 mb-2">Sent Requests</h3>
      <div className="space-y-2 mb-4">
        {sentInvites.length === 0 && (
          <p className="text-sm text-gray-500 px-4">No sent requests</p>
        )}
        {sentInvites.map((invite) => (
          <div key={invite.id} className="flex items-center justify-between px-4 py-2 rounded border">
            <div className="flex items-center gap-3">
              <div className='border border-black text-black rounded-full px-2'>
                {(invite.recipient?.username || 'U').substring(0, 1)}
              </div>
              <p className="text-sm text-black font-medium">{invite.recipient?.username || 'Unknown'}</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">Pending</div>
          </div>
        ))}
      </div>
      
      <h3 className="font-semibold text-gray-800 border border-gray-200 p-4 mb-2">Chats</h3>
      <div className="space-y-2">
        {chatParticipants.map((participant) => (
          <motion.div
            key={participant.id}
            className="flex items-center gap-4 py-3 rounded-lg hover:bg-gray-50 cursor-pointer"
            onClick={() => {
              setSelectedChatId(participant.chat_id);
              fetchMessages(participant.chat_id);
            }}
          >
            <div className='border border-black text-black rounded-full px-2'>
             {(participant.user_id === user.user_id ? participant.recipient?.username : participant.requester?.username || 'U').substring(0, 1)}
            </div>
            <p className="text-sm text-black font-medium">
              {participant.user_id === user.user_id ? (participant.recipient?.username || 'Unknown') : (participant.requester?.username || 'Unknown')}
            </p>
            {/* <p className="text-xs text-gray-500">Chat ID: {participant.chat_id}</p> */}
          </motion.div>
        ))}
      </div>
    </div>
  );

  // Realtime subscription for selected chat
  useEffect(() => {
    if (!selectedChatId) return;
    // Initial load
    fetchMessages(selectedChatId);

    const channel = supabase
      .channel(`messages-${selectedChatId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${selectedChatId}` },
        (payload) => {
          const m: any = payload.new;
          setMessages((prev) => [
            ...prev,
            {
              id: m.id,
              user_id: m.user_id,
              username: m.username || 'Anonymous',
              content: m.content,
              created_at: m.created_at,
              chat_id: m.chat_id,
              is_own_message: m.user_id === user.user_id,
            },
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedChatId]);

  // const handleSendMessage = async () => {
  //   if (!newMessage.trim() || !currentUser) return;

  //   try {
  //     const messageData = {
  //       // sender_id: currentUser.id,
  //       content: newMessage,
  //       username: "something"
  //       // mood: selectedMood,
  //       // ...(initialPostReference && {
  //       //   post_reference: initialPostReference
  //       // })
  //     };

  //     const { data, error } = await supabase
  //       .from('messages')
  //       .insert([messageData])
  //       .select()
  //       .single();

  //     if (error) throw error;

  //     // Add the new message to the local state
  //     const newMessageObj: Message = {
  //       ...data,
  //       sender_name: currentUser.user_metadata?.name || generateAnonymousName(),
  //       is_own_message: true
  //     };

  //     setMessages(prev => [...prev, newMessageObj]);
  //     setNewMessage('');
      
  //     // Clear post reference after sending
  //     if (initialPostReference && onBackToCommunity) {
  //       onBackToCommunity();
  //     }
  //   } catch (error) {
  //     console.error('Error sending message:', error);
  //   }
  // };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
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

  return (
    <div className="w-full flex max-h-[80vh] bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Sidebar - Online Users */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="w-[40%] md:w-[30%] bg-white bg-opacity-60 backdrop-blur-sm border border-gray-200 py-6"
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

          <RenderSidebar />
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
                    style={{ backgroundColor: '#E5E7EB' }}
                  >
                    <MessageCircle className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className={`flex-1 ${message.is_own_message ? 'text-right' : ''}`}>
                    <div className={`flex items-center space-x-2 mb-1 ${message.is_own_message ? 'justify-end' : ''}`}>
                      <span className="text-sm font-medium text-gray-800">{message.username}</span>
                      <span className="text-xs text-gray-400">{new Date(message.created_at).toLocaleString()}</span>
                    </div>
                    
                    <div className={`bg-white bg-opacity-70 backdrop-blur-sm rounded-2xl p-4 shadow-sm ${message.is_own_message ? 'bg-blue-100' : ''}`}>
                      <p className="text-gray-800 leading-relaxed">{message.content}</p>
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