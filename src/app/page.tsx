"use client"

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Heart, Mail, X, Eye, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

const IbashoLanding = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { scrollY } = useScroll();
  const containerRef = useRef(null);

  const router = useRouter();

  // Parallax transforms
  const heroY = useTransform(scrollY, [0, 1000], [0, -200]);
  const fogY = useTransform(scrollY, [0, 1000], [0, -300]);
  const polaroidY = useTransform(scrollY, [0, 800], [0, -100]);

  // Fake posts for moodboard
  const posts = [
    { id: 1, image: 'linear-gradient(135deg, #F7DAD9 0%, #AFCBFF 100%)', caption: 'Sunset felt like a soft ending today.', mood: '#tender' },
    { id: 2, image: 'linear-gradient(135deg, #AFCBFF 0%, #F9F9F9 100%)', caption: 'Rain sounds like forgiveness.', mood: '#numb' },
    { id: 3, image: 'linear-gradient(135deg, #F9F9F9 0%, #F7DAD9 100%)', caption: 'Coffee tastes like morning hope.', mood: '#gentle' },
    { id: 4, image: 'linear-gradient(135deg, #F7DAD9 0%, #2B2B2B 100%)', caption: 'Heavy hearts need soft places.', mood: '#raw' },
    { id: 5, image: 'linear-gradient(135deg, #AFCBFF 0%, #F7DAD9 100%)', caption: 'Breathing felt difficult today.', mood: '#tender' },
    { id: 6, image: 'linear-gradient(135deg, #F9F9F9 0%, #AFCBFF 100%)', caption: 'Found peace in small things.', mood: '#still' },
  ];

  // Floating animation for polaroid
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Whisper messages for connection section
  const whispers = [
    "I felt this too.",
    "Thank you for sharing.",
    "You're not alone in this.",
    "This resonates deeply.",
    "Sending you softness."
  ];

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
      setTimeout(() => setIsSubmitted(false), 3000);
      setEmail('');
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-100 to-gray-50 overflow-hidden">
      {/* Animated Background Fog */}
      <motion.div 
        style={{ y: fogY }}
        className="fixed inset-0 pointer-events-none"
      >
        <div className="absolute inset-0 opacity-60">
          <motion.div
            animate={{ 
              background: [
                'radial-gradient(circle at 20% 50%, rgba(247, 218, 217, 0.3) 0%, transparent 50%)',
                'radial-gradient(circle at 80% 30%, rgba(175, 203, 255, 0.3) 0%, transparent 50%)',
                'radial-gradient(circle at 40% 70%, rgba(247, 218, 217, 0.3) 0%, transparent 50%)',
                'radial-gradient(circle at 60% 20%, rgba(175, 203, 255, 0.3) 0%, transparent 50%)',
              ]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="w-full h-full"
          />
        </div>
      </motion.div>

      {/* Hero Section */}
      <motion.section style={{ y: heroY }} className="relative min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-8">
          {/* Floating Polaroid */}
          <motion.div
            style={{
              x: mousePosition.x,
              y: mousePosition.y,
              rotateX: mousePosition.y * 0.5,
              rotateY: mousePosition.x * 0.5,
            }}
            animate={{ 
              y: [-10, 10, -10],
              rotateZ: [-2, 2, -2]
            }}
            transition={{ 
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="w-64 h-80 mx-auto mb-8 bg-white rounded-lg shadow-2xl p-4 transform perspective-1000"
          >
            <div className="w-full h-3/4 bg-gradient-to-br from-pink-100 via-blue-100 to-gray-100 rounded-md mb-4 relative overflow-hidden">
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0 bg-gradient-to-br from-pink-200 to-blue-200"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Heart className="w-8 h-8 text-gray-400 opacity-60" />
              </div>
            </div>
            <p className="text-sm text-gray-600 font-light text-center">A place for your feelings</p>
          </motion.div>

          {/* Hero Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="space-y-6"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-gray-800 leading-tight">
              A place for your{' '}
              <motion.span
                animate={{ color: ['#F7DAD9', '#AFCBFF', '#F7DAD9'] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="italic"
              >
                feelings
              </motion.span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 font-light max-w-2xl mx-auto leading-relaxed">
              Capture what you feel. Share when you want. Be seen, softly.
            </p>
          </motion.div>

          {/* CTA Button */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative px-8 py-4 bg-gradient-to-r from-pink-200 to-blue-200 text-gray-800 rounded-full font-medium text-lg shadow-lg overflow-hidden group"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-pink-300 to-blue-300 opacity-0 group-hover:opacity-100"
              transition={{ duration: 0.3 }}
              onClick={() => router.push('/home')}
            />
            <span className="relative z-10">Enter your space</span>
          </motion.button>
        </div>
      </motion.section>

      {/* What Is Ibasho Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Animated Polaroid Scroll */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="relative h-96 overflow-hidden"
          >
            <motion.div
              animate={{ y: [-20, -400, -20] }}
              transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
              className="space-y-6"
            >
              {[...posts, ...posts].map((post, index) => (
                <div key={`scroll-${index}`} className="w-48 h-56 bg-white rounded-lg shadow-lg p-4 transform rotate-1">
                  <div 
                    className="w-full h-3/4 rounded-md mb-2"
                    style={{ background: post.image }}
                  />
                  <p className="text-xs text-gray-600 font-light blur-sm">{post.caption}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Explanation Text */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="space-y-6"
          >
            <h2 className="text-4xl font-bold text-gray-800 leading-tight">
              Your emotions deserve a{' '}
              <span className="text-pink-400">home</span>
            </h2>
            <p className="text-lg text-gray-600 font-light leading-relaxed">
              Ibasho is your private mood journal — photo-first, real-time, unfiltered. 
              Share when it helps. Stay silent when it heals.
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-pink-300 rounded-full"></div>
                <span className="text-gray-600">Capture moments, not performances</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                <span className="text-gray-600">Connect through vulnerability</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <span className="text-gray-600">Belong without judgment</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Moodboard Grid */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-pink-50">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-center text-gray-800 mb-12"
          >
            Shared softly
          </motion.h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10, rotateZ: Math.random() * 4 - 2 }}
                className="bg-white rounded-lg shadow-lg p-4 cursor-pointer group"
                onClick={() => {
                  setSelectedPost(post);
                  setIsModalOpen(true);
                }}
              >
                <div 
                  className="w-full h-32 rounded-md mb-3 relative overflow-hidden"
                  style={{ background: post.image }}
                >
                  <motion.div
                    className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 flex items-center justify-center"
                    transition={{ duration: 0.3 }}
                  >
                    <Eye className="w-6 h-6 text-white" />
                  </motion.div>
                </div>
                <motion.div
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-xs text-gray-600 font-light mb-1">{post.caption}</p>
                  <span className="text-xs text-blue-400 font-medium">{post.mood}</span>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Weekly Mood Summary */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative h-80 bg-white rounded-2xl shadow-lg p-8"
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-6">This week's rhythm</h3>
            <svg className="w-full h-48" viewBox="0 0 400 150">
              <motion.path
                d="M 50 100 Q 100 60 150 80 T 250 70 T 350 90"
                stroke="#F7DAD9"
                strokeWidth="3"
                fill="none"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                transition={{ duration: 2, ease: 'easeInOut' }}
              />
              <motion.path
                d="M 50 120 Q 100 90 150 100 T 250 85 T 350 110"
                stroke="#AFCBFF"
                strokeWidth="3"
                fill="none"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                transition={{ duration: 2, delay: 0.5, ease: 'easeInOut' }}
              />
            </svg>
            <div className="flex justify-between text-sm text-gray-500 mt-4">
              <span>#tender</span>
              <span>#numb</span>
              <span>#gentle</span>
              <span>#raw</span>
              <span>#still</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="space-y-6"
          >
            <h2 className="text-4xl font-bold text-gray-800 leading-tight">
              This week, your emotions moved like{' '}
              <span className="text-blue-400">waves</span>
            </h2>
            <p className="text-lg text-gray-600 font-light leading-relaxed">
              Moments of ache, followed by light. Ibasho lets you see how you feel — without judgment.
            </p>
            <div className="bg-gradient-to-r from-pink-50 to-blue-50 rounded-lg p-6">
              <p className="text-gray-700 italic">
                "Tracking my feelings helped me realize I wasn't broken — I was just human."
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Connection Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-gray-50 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-gray-800 mb-12"
          >
            Whispered connections
          </motion.h2>
          
          <div className="relative h-64">
            {whispers.map((whisper, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8, y: 100 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: index * 0.8, duration: 0.8 }}
                className="absolute left-1/2 transform -translate-x-1/2 bg-white rounded-full px-6 py-3 shadow-lg"
                style={{
                  top: `${20 + (index * 40)}px`,
                  left: `${30 + (index * 15)}%`,
                }}
              >
                <p className="text-gray-700 font-light text-sm">{whisper}</p>
                <MessageCircle className="w-4 h-4 text-gray-400 inline-block ml-2" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-800 to-gray-900">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-white leading-tight"
          >
            You don't need to perform.
            <br />
            <span className="text-pink-300">You just need a place to land.</span>
          </motion.h2>
          
          <motion.form
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onSubmit={handleEmailSubmit}
            className="max-w-md mx-auto space-y-4"
          >
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="w-full px-6 py-4 bg-white bg-opacity-10 text-white placeholder-gray-300 rounded-full border border-gray-600 focus:border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-opacity-50"
                required
              />
              <Mail className="absolute right-4 top-4 w-5 h-5 text-gray-400" />
            </div>
            
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full px-8 py-4 bg-gradient-to-r from-pink-400 to-blue-400 text-white rounded-full font-medium text-lg shadow-lg"
            >
              {isSubmitted ? 'Welcome to the family' : 'Join the Waitlist'}
            </motion.button>
          </motion.form>
          
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-gray-400 font-light"
          >
            We'll whisper when it's ready.
          </motion.p>
        </div>
      </section>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div 
                className="w-full h-64 rounded-lg mb-6"
                style={{ background: selectedPost.image }}
              />
              
              <p className="text-lg text-gray-800 mb-4 leading-relaxed">
                "{selectedPost.caption}"
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-400 font-medium">
                  {selectedPost.mood}
                </span>
                <div className="flex items-center space-x-4 text-gray-500">
                  <Heart className="w-5 h-5" />
                  <MessageCircle className="w-5 h-5" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IbashoLanding;