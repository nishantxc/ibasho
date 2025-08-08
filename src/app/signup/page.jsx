"use client";

import React, { useState, useEffect } from 'react';
import SignupForm from '../../components/SignupForm';
import { getCurrentUser } from '../../../supabase/Supabase';
import { motion } from 'framer-motion';

const SignupPage = () => {
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

  return <SignupForm onSignupSuccess={() => setIsLoggedIn(true)} />;
};

export default SignupPage;