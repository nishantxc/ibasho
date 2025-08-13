import { motion } from "framer-motion";
import { BellElectric, Book, House, MessageCircleHeart, Star } from "lucide-react";
import React from "react";

type View = 'home' | 'journal' | 'community' | 'whisper' | 'insights'

interface NavigationProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  onAfterNavigate?: () => void;
  className?: string;
}

const Navigation = React.memo(({ currentView, setCurrentView, onAfterNavigate, className }: NavigationProps) => (
  <motion.nav
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className={
      className ??
      "md:w-[25%] flex flex-col items-stretch gap-3 mb-8"
    }
  >
    {([
      { key: 'home', label: 'Check In', icon: <House /> },
      { key: 'journal', label: 'Journal', icon: <Book /> },
      { key: 'community', label: 'Community', icon: <Star /> },
      { key: 'whisper', label: 'Whisper', icon: <MessageCircleHeart /> },
      { key: 'insights', label: 'Insights', icon: <BellElectric /> },
    ] as { key: View; label: string; icon: React.ReactNode }[]).map((item) => (
      <motion.button
        key={item.key}
        onClick={() => {
          setCurrentView(item.key);
          onAfterNavigate?.();
        }}
        className={`md:w-[20vh] lg:w-[30vh] flex items-center px-6 py-3 rounded-full font-mono text-sm transition-colors ${
          currentView === item.key
            ? 'bg-pink-200 text-gray-800'
            : 'bg-white text-gray-600 hover:bg-gray-50'
        }`}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
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