"use client"

import React, { useEffect, useState } from 'react';
import { persistor, store } from '../store/store'
import { Provider } from 'react-redux'
import { motion } from 'framer-motion';
import { User } from '@/types/types';
import { api } from '@/utils/api';
import { getCurrentUser, signOut } from '../../supabase/Supabase';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { PersistGate } from 'redux-persist/integration/react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <div>
            {children}
            <ToastContainer position="bottom-center" hideProgressBar newestOnTop closeOnClick draggable pauseOnHover={false} />
          </div>
        </PersistGate>
      </Provider>
    </div>
  );
};

export default AppLayout;