import React from 'react';
import { store } from '../store/store'
import { Provider } from 'react-redux'
import { motion } from 'framer-motion';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
      <Provider store={store}>
        <header className="w-full h-[10vh] flex justify-between bg-gradient-to-r from-pink-100/80 to-blue-100/80 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <motion.h1
              className="text-3xl font-light text-gray-800 font-serif"
              whileHover={{ scale: 1.05 }}
              aria-label="Ibasho Logo"
            >
              ibasho <span className='text-sm font-light'>(居場所)</span>
            </motion.h1>

            {/* <motion.button
              // onClick={() => setCurrentView('home')}
              className="px-6 py-3 bg-pink-200 rounded-full text-gray-800 font-medium hover:bg-pink-300 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Go to Check-In"
            >
              I'm here today
            </motion.button> */}
          </div>
        </header>
        <div className="container mx-auto px-4 py-8 flex gap-8">
          {children}
        </div>
      </Provider>
    </div>
  );
};

export default AppLayout; 