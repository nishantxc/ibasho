import { motion } from "framer-motion";
import { Book, House, MessageCircleHeart, Star } from "lucide-react";
import React from "react";

interface NavigationProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

const Navigation = React.memo(({ currentView, setCurrentView }: NavigationProps) => (
  <motion.nav 
    initial={{ opacity: 0, y: 20 }} 
    animate={{ opacity: 1, y: 0 }} 
    className="w-[25%] flex flex-col items-center gap-4 mb-8"
  >
    {[
      { key: 'home', label: 'Check In', icon: <House /> },
      { key: 'journal', label: 'Journal', icon: <Book /> },
      { key: 'community', label: 'Community', icon: <Star /> },
      { key: 'whisper', label: 'Whisper', icon: <MessageCircleHeart /> },
    ].map((item) => (
      <motion.button
        key={item.key}
        onClick={() => setCurrentView(item.key)}
        className={`w-full flex items-center px-6 py-3 rounded-full font-mono text-sm transition-colors ${
          currentView === item.key 
            ? 'bg-pink-200 text-gray-800' 
            : 'bg-white text-gray-600 hover:bg-gray-50'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={`Navigate to ${item.label}`}
      >
        <span className="mr-2">{item.icon}</span>
        <span>{item.label}</span>
      </motion.button>
    ))}
  </motion.nav>
));

Navigation.displayName = 'Navigation';

export default Navigation;