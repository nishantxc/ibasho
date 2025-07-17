"use client"

import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
  const fogRef = useRef(null);

  useEffect(() => {
    gsap.to(fogRef.current, {
      backgroundPosition: '300% 0',
      duration: 60,
      ease: 'none',
      repeat: -1
    });
  }, []);

  return (
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-[#F7DAD9] via-[#AFCBFF] to-[#F9F9F9]">
      {/* Fog effect background */}
      <div
        ref={fogRef}
        className="absolute inset-0 bg-[url('/assets/fog-texture.png')] bg-repeat opacity-30 animate-pulse"
        style={{
          backgroundSize: '400% 400%',
        }}
      />

      {/* Floating Polaroid */}
      <motion.div
        whileHover={{ rotateY: 5, rotateX: 5 }}
        transition={{ type: 'spring', stiffness: 100 }}
        className="z-10 relative w-64 h-80 bg-white shadow-2xl rounded-xl overflow-hidden border border-[#F7DAD9]"
      >
        <img
          src="/assets/polaroids/cover.jpg"
          alt="Polaroid"
          className="object-cover w-full h-full"
        />
      </motion.div>

      {/* Text + CTA */}
      <div className="absolute bottom-20 text-center z-10">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-4xl md:text-6xl font-bold text-[#2B2B2B]"
        >
          A place for your feelings.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="text-lg mt-4 text-[#2B2B2B]/70"
        >
          Capture what you feel. Share when you want. Be seen, softly.
        </motion.p>

        <motion.button
          whileHover={{ scale: 1.02 }}
          className="mt-6 px-6 py-3 bg-[#F7DAD9] text-[#2B2B2B] rounded-full shadow-md hover:shadow-xl transition-all duration-300 relative overflow-hidden"
        >
          <span className="z-10 relative">Begin your ritual</span>
          <motion.span
            layoutId="ripple"
            className="absolute inset-0 bg-white opacity-10 rounded-full"
            animate={{ scale: [0, 3], opacity: [0.2, 0] }}
            transition={{
              repeat: Infinity,
              repeatType: 'loop',
              duration: 2,
              ease: 'easeOut'
            }}
          />
        </motion.button>
      </div>
    </section>
  );
};

export default Hero;
