"use client"

import React, { useState, useEffect } from 'react';
import LoginForm from '../../components/LoginForm';
import { getCurrentUser } from '../../../supabase/Supabase';
import { motion } from 'framer-motion';

const LoginPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { user } = await getCurrentUser();
      if (user) {
        setIsLoggedIn(true);
      }
    };
    checkUser();
  }, []);

  // if (isLoggedIn) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-blue-50 flex items-center justify-center p-4">
  //       <motion.div
  //         initial={{ opacity: 0, y: 50 }}
  //         animate={{ opacity: 1, y: 0 }}
  //         transition={{ duration: 0.8 }}
  //         className="text-center"
  //       >
  //         <h2 className="text-3xl font-serif text-gray-800 mb-4">Welcome!</h2>
  //         <p className="text-gray-600 font-mono">You are now logged in.</p>
  //       </motion.div>
  //     </div>
  //   );
  // }

  return <LoginForm onLoginSuccess={() => setIsLoggedIn(true)} />;
};

export default LoginPage;