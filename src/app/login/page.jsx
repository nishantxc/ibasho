"use client"

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LoginPage = () => {
  const [loginStep, setLoginStep] = useState('welcome');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState('login');
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [kittenClicked, setKittenClicked] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleKittenClick = () => {
    setKittenClicked(true);
    setTimeout(() => setKittenClicked(false), 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setShowValidation(true);

    setTimeout(() => {
      setIsLoggedIn(true);
      setCurrentView('home');
      setIsLoading(false);
    }, 2000);
  };

  // If logged in, show a simple message since this is standalone
  if (isLoggedIn && currentView === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-blue-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 className="text-3xl font-serif text-gray-800 mb-4">Welcome!</h2>
          <p className="text-gray-600 font-mono">You are now logged in.</p>
        </motion.div>
      </div>
    );
  }

  if (loginStep === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-blue-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 5C75 20 80 50 50 65C20 50 25 20 50 5Z' fill='%23FAF7F0' fill-opacity='0.1'/%3E%3C/svg%3E')] opacity-20"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-md w-full"
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-pink-100">
            {/* Header with breathing animation */}
            <motion.div
              className="text-center mb-8"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            >
              <motion.h1 
                className="text-4xl font-serif text-gray-800 mb-2"
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                Ibasho
              </motion.h1>
              <motion.p 
                className="text-gray-600 font-mono text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 1.5 }}
              >
                A safe space for your feelings
              </motion.p>
            </motion.div>

            {/* Floating kitten */}
            <motion.div
              className="absolute -top-4 -right-4 cursor-pointer text-4xl"
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              onClick={handleKittenClick}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              🐱
              {kittenClicked && (
                <motion.div
                  className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs bg-pink-200 px-2 py-1 rounded-full font-mono"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                >
                  meow! 💕
                </motion.div>
              )}
            </motion.div>

            {/* Welcome message */}
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 2 }}
            >
              <p className="text-gray-700 font-serif text-lg leading-relaxed">
                You deserve to be seen, heard, and held in your feelings.
              </p>
              <motion.p 
                className="text-gray-500 font-mono text-sm mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
              >
                Take a gentle breath. You're exactly where you need to be.
              </motion.p>
            </motion.div>

            {/* CTA Buttons */}
            <div className="space-y-4">
              <motion.button
                onClick={() => setLoginStep('form')}
                className="w-full py-4 bg-gradient-to-r from-pink-200 to-rose-200 text-gray-800 rounded-2xl font-medium hover:from-pink-300 hover:to-rose-300 transition-all duration-300 shadow-lg"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
              >
                Continue your journey
              </motion.button>
              
              <motion.button
                onClick={() => {
                  setIsSignUp(true);
                  setLoginStep('form');
                }}
                className="w-full py-4 bg-gradient-to-r from-blue-200 to-indigo-200 text-gray-800 rounded-2xl font-medium hover:from-blue-300 hover:to-indigo-300 transition-all duration-300 shadow-lg"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.7 }}
              >
                Start feeling seen
              </motion.button>
            </div>

            {/* Trust indicators */}
            <motion.div
              className="flex justify-center items-center space-x-4 mt-8 text-xs text-gray-500 font-mono"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5 }}
            >
              <span>🔒 Private</span>
              <span>•</span>
              <span>💙 Safe</span>
              <span>•</span>
              <span>🌟 Anonymous sharing</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-blue-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FAF7F0' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
      
      <motion.div
        initial={{ opacity: 0, x: isSignUp ? 50 : -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-md w-full"
      >
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-pink-100">
          
          {/* Back button */}
          <motion.button
            onClick={() => setLoginStep('welcome')}
            className="absolute top-4 left-4 text-gray-500 hover:text-gray-700 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            ← Back
          </motion.button>

          {/* Floating kitten friend */}
          <motion.div
            className="absolute -top-6 -right-6 cursor-pointer text-5xl"
            animate={{ 
              y: [0, -15, 0],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ 
              duration: 5, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            onClick={handleKittenClick}
            whileHover={{ scale: 1.3, rotate: 15 }}
            whileTap={{ scale: 0.8 }}
          >
            🐱
            {kittenClicked && (
              <motion.div
                className="absolute -top-12 left-1/2 transform -translate-x-1/2 text-sm bg-yellow-200 px-3 py-1 rounded-full font-mono shadow-lg"
                initial={{ opacity: 0, scale: 0, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0, y: -10 }}
              >
                You've got this! 🌟
              </motion.div>
            )}
          </motion.div>

          {/* Header */}
          <motion.div
            className="text-center mb-8 pt-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-3xl font-serif text-gray-800 mb-2">
              {isSignUp ? 'Welcome to your safe space' : 'Welcome back'}
            </h2>
            <p className="text-gray-600 font-mono text-sm">
              {isSignUp 
                ? 'Every feeling matters. Every moment counts.' 
                : 'Ready to check in with yourself?'
              }
            </p>
          </motion.div>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {/* Email field with floating label */}
            <div className="relative">
              <input
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent transition-all duration-300 font-mono"
                placeholder="your.email@example.com"
                required
              />
              <motion.div
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: loginData.email ? 1 : 0 }}
              >
                <span className="text-green-500">✓</span>
              </motion.div>
            </div>

            {/* Password field */}
            <div className="relative">
              <input
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent transition-all duration-300 font-mono"
                placeholder="Your secure password"
                required
              />
              <motion.div
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: loginData.password ? 1 : 0 }}
              >
                <span className="text-green-500">✓</span>
              </motion.div>
            </div>

            {/* Validation message */}
            <AnimatePresence>
              {showValidation && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center text-sm font-mono text-green-600 bg-green-50 p-3 rounded-lg"
                >
                  Creating your safe space... 🌟
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-pink-300 to-rose-300 text-gray-800 rounded-xl font-medium hover:from-pink-400 hover:to-rose-400 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: isLoading ? 1 : 1.02, y: isLoading ? 0 : -2 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <motion.div
                    className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full mr-2"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  Preparing your space...
                </div>
              ) : (
                isSignUp ? 'Begin your journey' : 'Enter your space'
              )}
            </motion.button>

            {/* Switch between login/signup */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-gray-600 hover:text-gray-800 transition-colors font-mono underline"
              >
                {isSignUp 
                  ? 'Already have an account? Welcome back' 
                  : 'New here? Create your safe space'
                }
              </button>
            </div>
          </motion.form>

          {/* Footer comfort text */}
          <motion.div
            className="text-center mt-8 text-xs text-gray-500 font-mono"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <p>Your feelings are valid. Your journey matters.</p>
            <p className="mt-2">🔒 End-to-end encrypted • 💙 Always anonymous</p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;