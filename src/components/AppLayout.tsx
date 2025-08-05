"use client"

import React, { useEffect, useState } from 'react';
import { store } from '../store/store'
import { Provider } from 'react-redux'
import { motion } from 'framer-motion';
import { User } from '@/types/types';
import { api } from '@/utils/api';
import { getCurrentUser, signOut } from '../../supabase/Supabase';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
      <Provider store={store}>
        <div className="container mx-auto px-4 py-8 md:flex gap-8">
          {children}
        </div>
      </Provider>
    </div>
  );
};

export default AppLayout; 