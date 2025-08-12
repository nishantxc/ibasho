import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageCircle, Sparkles, Menu, X, Loader } from 'lucide-react';
import { supabase } from '../../supabase/Supabase';
import { api } from '@/utils/api';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { initialPostReference } from '@/types/types';

interface WhisperPageProps {
  initialPostReference?: initialPostReference;
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
  const [loading, setLoading] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isInvitesOpen, setIsInvitesOpen] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const user = useSelector((state: RootState) => state.userProfile);

  // Fetch chat participants for current user
  const fetchChatParticipants = async () => {
    setLoading(true);
    if (!user) return;
    try {
      const response = await api.chatParticipants.getChatParticipants();
      const list = response.chat_participants || [];

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
    setLoading(false);
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
      const userIds = [user.user_id, initialPostReference.user_id].sort();
      const chatId = `${userIds[0]}_${userIds[1]}`;
      setSelectedChatId(chatId);
    }
  }, [user, initialPostReference]);

  // Update fetchMessages to use chat_id
  const fetchMessages = async (chatId?: string) => {
    if (!user || !chatId) return;
    setLoading(true);

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

    setLoading(false);
  };

  // Update handleSendMessage to use chat_id
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    try {
      let chatId = selectedChatId;
      if (!chatId && initialPostReference) {
        const userIds = [user.user_id, initialPostReference.user_id].sort();
        chatId = `${userIds[0]}_${userIds[1]}`;
        setSelectedChatId(chatId);
      }
      if (!chatId) return;

      const result = await api.messages.createMessage({ content: newMessage, chat_id: chatId, username: user.username });
      const m = result.message;
      console.log(m, "find user name");
      
      const newMsg: ChatMessage = {
        id: m.id,
        user_id: m.user_id,
        username: m.username || 'Anonymous',
        content: m.content,
        created_at: m.created_at,
        chat_id: m.chat_id,
        is_own_message: true,
      };
      setMessages(prev => {
        const exists = prev.some((msg) => msg.id === newMsg.id);
        if (exists) return prev;
        return [...prev, newMsg];
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Add sidebar for chat participants (Chats only)
  const RenderSidebar = () => (
    <div className="w-full py-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800">Chats</h3>
        <button
          className="text-xs px-2 py-1 rounded border border-gray-200 bg-white/70 text-gray-700 hover:bg-gray-50"
          onClick={() => setIsInvitesOpen(true)}
        >
          Invites
        </button>
      </div>
      <div className="space-y-1">
        {chatParticipants.map((participant) => (
          <motion.div
            key={participant.id}
            className={`flex items-center gap-3 px-2 py-3 rounded-lg cursor-pointer ${selectedChatId === participant.chat_id ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
            onClick={() => {
              setSelectedChatId(participant.chat_id);
              fetchMessages(participant.chat_id);
              setIsSidebarOpen(false);
            }}
          >
            <div className='border border-black text-black rounded-full px-2'>
              {(participant.user_id === user.user_id ? participant.initial_post_reference?.username : participant.username || 'U').substring(0, 1)}
            </div>
            <p className="text-sm text-black font-medium truncate">
              {participant.user_id === user.user_id ? (participant.initial_post_reference?.username || 'Unknown') : (participant.username || 'Unknown')}
            </p>
          </motion.div>
        ))}
        {chatParticipants.length === 0 && (
          <p className="text-xs text-gray-500 px-2 py-2">No chats yet</p>
        )}
      </div>
    </div>
  );

  const RenderInvitesModal = () => (
    <AnimatePresence>
      {isInvitesOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-black/30" onClick={() => setIsInvitesOpen(false)} />
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="relative z-10 w-[92%] max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-white/70">
              <h4 className="text-sm font-semibold text-gray-800">Invites</h4>
              <button className="p-2" onClick={() => setIsInvitesOpen(false)}>
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="p-4 grid grid-cols-1 gap-4 max-h-[70vh] overflow-y-auto">
              <div>
                <h5 className="text-xs font-medium text-gray-700 mb-2">Requests</h5>
                <div className="space-y-2">
                  {pendingInvites.length === 0 && (
                    <p className="text-xs text-gray-500">No requests</p>
                  )}
                  {pendingInvites.map((invite) => (
                    <div key={invite.id} className="flex items-center justify-between px-3 py-2 rounded-lg border border-gray-200 bg-white">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className='border border-black text-black rounded-full px-2'>
                          {(invite.initial_post_reference?.username || 'U').substring(0, 1)}
                        </div>
                        <p className="text-sm text-black font-medium truncate">{invite.requester?.username || 'Unknown'}</p>
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
              </div>
              <div>
                <h5 className="text-xs font-medium text-gray-700 mb-2">Sent Requests</h5>
                <div className="space-y-2">
                  {sentInvites.length === 0 && (
                    <p className="text-xs text-gray-500">No sent requests</p>
                  )}
                  {sentInvites.map((invite) => (
                    <div key={invite.id} className="flex items-center justify-between px-3 py-2 rounded-lg border border-gray-200 bg-white">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className='border border-black text-black rounded-full px-2'>
                          {(invite.recipient?.username || 'U').substring(0, 1)}
                        </div>
                        <p className="text-sm text-black font-medium truncate">{invite.recipient?.username || 'Unknown'}</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">Pending</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const getCurrentChatDisplay = (): { name: string; initial: string } | null => {
    if (!selectedChatId) return null;
    const candidates = chatParticipants.filter((p: any) => p.chat_id === selectedChatId);
    if (candidates.length === 0) return null;
    const other = candidates.find((p: any) => p.user_id !== user?.user_id) || candidates[0];
    const name = other.user_id === user?.user_id ? (other.initial_post_reference?.username || 'Unknown') : (other.username || 'Unknown');
    const initial = (name || 'U').substring(0, 1);
    return { name, initial };
  };

  useEffect(() => {
    if (!selectedChatId) return;
    fetchMessages(selectedChatId);

    const channel = supabase
      .channel(`messages-${selectedChatId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${selectedChatId}` },
        (payload) => {
          const newMessageRow: any = payload.new;
          setMessages((previousMessages) => {
            const alreadyExists = previousMessages.some((msg) => msg.id === newMessageRow.id);
            if (alreadyExists) return previousMessages;
            return [
              ...previousMessages,
              {
                id: newMessageRow.id,
                user_id: newMessageRow.user_id,
                username: newMessageRow.username || 'Anonymous',
                content: newMessageRow.content,
                created_at: newMessageRow.created_at,
                chat_id: newMessageRow.chat_id,
                is_own_message: newMessageRow.user_id === user?.user_id,
              },
            ];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedChatId]);

  // Auto-scroll to latest message when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if(loading) {
    return (
      <div className='w-full h-[80vh] flex items-center justify-center bg-tranparent'>
        <Loader className="animate-spin text-4xl text-gray-500 mx-auto mt-20" />
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col md:flex-row max-h-[85vh] bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Sidebar - Desktop */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="hidden md:block md:w-[32%] lg:w-[28%] xl:w-[24%] bg-white/60 backdrop-blur-sm border-r border-gray-200 py-6"
        style={{ overflow: 'hidden' }}
      >
        <div className="mb-6 px-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5 text-gray-700" />
            <h3 className="text-xl font-semibold text-gray-800">Community Whispers</h3>
          </motion.div>

          <RenderSidebar />
        </div>
      </motion.div>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            <div className="absolute inset-0 bg-black/20" onClick={() => setIsSidebarOpen(false)} />
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="relative z-50 h-full w-[88%] max-w-sm bg-white/80 backdrop-blur border-r border-gray-200 py-6"
            >
              <div className="flex items-center justify-between px-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-gray-700" />
                  <h3 className="text-lg font-semibold text-gray-800">Chats</h3>
                </div>
                <button aria-label="Close sidebar" className="p-2" onClick={() => setIsSidebarOpen(false)}>
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="px-2">
                <RenderSidebar />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-y-scroll h-[50vh] md:h-[80vh]">
        {/* Mobile top bar */}
        <div className="md:hidden sticky top-0 z-10 bg-white/60 backdrop-blur border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button
            aria-label="Open sidebar"
            className="p-2 rounded-lg border border-gray-200 bg-white/70"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex items-center gap-2 text-gray-800 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 text-sm">
              {(getCurrentChatDisplay()?.initial || 'U')}
            </div>
            <span className="text-sm font-medium truncate max-w-[45vw]">{getCurrentChatDisplay()?.name || 'Select a chat'}</span>
          </div>
          <button
            className="text-xs px-2 py-1 rounded border border-gray-200 bg-white/70 text-gray-700"
            onClick={() => setIsInvitesOpen(true)}
          >
            Invites
          </button>
        </div>
        {/* Desktop chat top bar */}
        <div className="hidden md:flex sticky top-0 z-10 bg-white/60 backdrop-blur border-b border-gray-200 px-5 py-3 items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 text-sm">
              {(getCurrentChatDisplay()?.initial || 'U')}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-gray-800 truncate">{getCurrentChatDisplay()?.name || 'Select a chat'}</span>
              <span className="text-xs text-gray-500 truncate">Direct message</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="text-xs px-3 py-1.5 rounded border border-gray-200 bg-white/70 text-gray-700 hover:bg-gray-50"
              onClick={() => setIsInvitesOpen(true)}
            >
              Invites
            </button>
          </div>
        </div>
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
        <div className="h-full flex-1 p-4 md:p-6 space-y-4 overflow-y-auto">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.04, 0.2) }}
                className={`group ${message.is_own_message ? 'flex justify-end' : ''}`}
              >
                <div className={`flex items-end gap-3 mb-2 max-w-[80%] md:max-w-[70%] ${message.is_own_message ? 'flex-row-reverse' : ''}`}>
                  <div className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-200">
                    {/* <MessageCircle className="w-4 h-4 md:w-5 md:h-5 text-gray-600" /> */}
                    <p className="p-4 text-gray-600">
                      
                      {message.username.split('')[0]}
                      </p>
                  </div>
                  <div className={`flex-1 ${message.is_own_message ? 'text-right' : ''}`}>
                    <div className={`flex items-center gap-2 mb-1 ${message.is_own_message ? 'justify-end' : ''}`}>
                      <span className="text-xs md:text-sm font-medium text-gray-800">{message.username}</span>
                      <span className="text-[10px] md:text-xs text-gray-400">{new Date(message.created_at).toLocaleString()}</span>
                    </div>

                    <div className={`${message.is_own_message ? 'bg-gradient-to-r from-blue-100 to-blue-50' : 'bg-white/80'} backdrop-blur-sm rounded-3xl p-3 md:p-4 shadow-sm border border-gray-100` }>
                      <p className="text-gray-800 leading-relaxed break-words">{message.content}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200 bg-white/60 backdrop-blur-sm p-4">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={initialPostReference ? "Send a message about this post..." : "Share what's on your heart..."}
                className="text-black/80 w-full px-3 md:px-4 py-3 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-opacity-50 resize-none"
                rows={1}
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
              className="px-4 md:px-6 py-3 bg-gradient-to-r from-pink-200 to-blue-200 text-gray-800 rounded-2xl font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transition-shadow"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
      <RenderInvitesModal />
    </div>
  );
};

export default WhisperPage;