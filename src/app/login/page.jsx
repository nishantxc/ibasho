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

  return <LoginForm onLoginSuccess={() => setIsLoggedIn(true)} />;
};

export default LoginPage;