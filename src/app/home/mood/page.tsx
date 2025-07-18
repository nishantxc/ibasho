"use client";

import React from "react";
import { motion } from "framer-motion";
import { DownloadCloud } from "lucide-react";
   
const moodData = [
  {
    id: "1",
    imageUrl: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400",
    caption: "The ocean whispered secrets I needed to hear",
    tags: ["#healing"],
  },
  {
    id: "2",
    imageUrl: "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=400",
    caption: "Endings can be beautiful too",
    tags: ["#grief", "#beauty"],
  },
  {
    id: "3",
    imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400",
    caption: "Peace in the chaos of leaves",
    tags: ["#hopeful"],
  },
];

const MoodQuilt: React.FC = () => {
  return (
    <div className="bg-[#F3EFEA] min-h-screen py-12 px-4 flex flex-col items-center font-sans">
      <h1 className="text-4xl font-serif text-[#2B2B2B] mb-2">Mood Quilt</h1>
      <p className="text-[#B0B0B0] italic mb-8">Every square a feeling, stitched gently together</p>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl"
      >
        {moodData.map((mood, index) => (
          <motion.div
            key={mood.id}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            whileHover={{ scale: 1.02, rotate: [-1, 1, -1] }}
            className="bg-white shadow-md rounded-xl overflow-hidden transition-transform duration-300"
          >
            <div className="aspect-[3/4] w-full bg-gray-100">
              <img
                src={mood.imageUrl}
                alt={mood.caption}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-3">
              <p className="text-sm text-[#2B2B2B] italic mb-2">{mood.caption}</p>
              <div className="flex flex-wrap gap-1">
                {mood.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2 py-[2px] rounded-full bg-[#F7DAD9] text-[#2B2B2B] font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <button
        className="mt-10 flex items-center gap-2 bg-[#AFCBFF] text-white px-5 py-3 rounded-full hover:bg-opacity-80 transition-colors shadow-lg"
        onClick={() => {
          // in next version: capture screenshot via html2canvas/dom-to-image
          alert("Share feature coming soon 💌");
        }}
      >
        <DownloadCloud size={16} /> Save & Share Mood Quilt
      </button>
    </div>
  );
};

export default MoodQuilt;
