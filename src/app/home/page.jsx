"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, House, MessageCircle, MessageCircleHeart, Star } from 'lucide-react';
import WhisperPage from "@/components/Whisper"
import CheckInForm from "@/components/CheckInForm"

const SeenlyApp = () => {
  const [currentView, setCurrentView] = useState('home');
  const [photoData, setPhotoData] = useState(null);
  const [caption, setCaption] = useState('');
  const [moodTag, setMoodTag] = useState('');
  const [journalEntries, setJournalEntries] = useState([]);
  const [sharedPosts, setSharedPosts] = useState([
    { id: 1, caption: "Found peace in my morning coffee", mood: "Grateful", reactions: 12 },
    { id: 2, caption: "Struggling but still here", mood: "Raw", reactions: 8 },
    { id: 3, caption: "Small wins today", mood: "Hopeful", reactions: 15 },
  ]);
  const [cameraOpen, isCameraOpen] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [catMode, setCatMode] = useState(false);
  const [error, setError] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Konami code for cat mode
  const konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
  const [konamiIndex, setKonamiIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.keyCode === konamiCode[konamiIndex]) {
        setKonamiIndex((prev) => prev + 1);
        if (konamiIndex + 1 === konamiCode.length) {
          setCatMode(true);
          setKonamiIndex(0);
        }
      } else {
        setKonamiIndex(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [konamiIndex]);

  // Camera cleanup
  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraOpen]);

  // HTTPS check for dev
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      setError('Camera requires HTTPS. Please deploy to a secure server.');
    }
  }, []);

  // const startCamera = async () => {
  //   try {
  //     const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
  //     if (videoRef.current) {
  //       videoRef.current.srcObject = stream;
  //       await videoRef.current.play();
  //     }
  //     isCameraOpen(true);
  //   } catch (err) {  
  //     console.error("Camera error:", err);
  //   }
  // };

  const startCamera = async () => {
    setCameraLoading(true);
    setError('');
    try {
      let stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        videoRef.current.onloadedmetadata = () => {
          videoRef.current
            .play()
            .then(() => {
              console.log('Camera started successfully');
            })
            .catch((err) => {
              setError('Failed to start video. Try again or check permissions.');
              console.error('Video play error:', err);
            });
        };
      }

      isCameraOpen(true);
      setCameraLoading(false);
    } catch (err) {
      setError('Camera access failed. Please allow camera permissions or check device settings.');
      console.error('Error accessing camera:', err);
      setCameraLoading(false);
    }
  };


  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');

      // Check if video is ready
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        setError('Camera not ready. Please wait or try again.');
        console.error('Video dimensions not ready:', video.videoWidth, video.videoHeight);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);

      try {
        const dataURL = canvas.toDataURL('image/jpeg');
        if (!dataURL || dataURL === 'data:,') {
          setError('Failed to capture photo. Try again.');
          console.error('Invalid canvas data');
          return;
        }
        setPhotoData(dataURL);
        isCameraOpen(false);

        // Stop camera stream
        const stream = video.srcObject;
        stream.getTracks().forEach((track) => track.stop());
      } catch (err) {
        setError('Error capturing photo. Please try again.');
        console.error('Capture error:', err);
      }
    } else {
      setError('Camera or canvas not available. Please try again.');
      console.error('Missing videoRef or canvasRef');
    }
  };

  const cancelCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach((track) => track.stop());
    }
    isCameraOpen(false);
    setCameraLoading(false);
    setError('');
  };

  const submitEntry = () => {
    if (!photoData || !caption || !moodTag) {
      setError('Please capture a photo, add a caption, and select a mood.');
      return;
    }
    const newEntry = {
      id: Date.now(),
      photo: photoData,
      caption,
      mood: moodTag,
      timestamp: new Date().toISOString(),
      rotation: Math.random() * 6 - 3,
    };
    setJournalEntries([...journalEntries, newEntry]);
    setPhotoData(null);
    setCaption('');
    setMoodTag('');
    setCurrentView('journal');
    setError('');
  };

  const sharePost = (post) => {
    const shareText = `"${post.caption}" - This helped me feel less alone today. Check out Ibasho 💫`;
    if (navigator.share) {
      navigator.share({
        title: 'Ibasho Moment',
        text: shareText,
        url: window.location.href,
      }).catch((err) => console.error('Share failed:', err));
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Share text copied to clipboard!');
    }
  };

  const CatIcon = () => (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="text-2xl"
      whileHover={{ scale: 1.2, rotate: 10 }}
    >
      🐱
    </motion.div>
  );


  const handleCaption = (e) => {
    const { value } = e.target;
    setCaption(value);
  }

  const AppLayout = ({ children }) => (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 font-serif">
      <header className="p-6 bg-gradient-to-r from-pink-100/80 to-blue-100/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <motion.h1
            className="text-3xl font-light text-gray-800 font-serif"
            whileHover={{ scale: 1.05 }}
            aria-label="Ibasho Logo"
          >
            ibasho <span className='text-sm font-light'>(居場所)</span>
          </motion.h1>

          <motion.button
            onClick={() => setCurrentView('home')}
            className="px-6 py-3 bg-pink-200 rounded-full text-gray-800 font-medium hover:bg-pink-300 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Go to Check-In"
          >
            I'm here today
          </motion.button>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto p-6">{children}</main>

      <footer className="relative z-10 text-center p-6 text-gray-600 font-mono text-sm">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
          You're safe here 💙
        </motion.p>
      </footer>
    </div>
  );

  const DailyPrompt = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
      <div className="relative inline-block">
        <motion.h2
          className="text-2xl text-gray-800 font-serif mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 2 }}
        >
          What did you feel most today?
        </motion.h2>

        {catMode && (
          <motion.div
            className="absolute -right-12 top-0"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 }}
          >
            <CatIcon />
          </motion.div>
        )}
      </div>

      <motion.div
        className="text-sm text-gray-500 font-mono"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        Today, most users felt 'Grateful'
        <motion.span className="inline-block ml-2" animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          🙏
        </motion.span>
      </motion.div>
    </motion.div>
  );

  const PhotoCapture = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-lg shadow-lg p-6 mb-6"
    >
      <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square max-w-md mx-auto border-4 border-white shadow-md">
        {/* Always render video */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300`}
          // className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${cameraOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          //   }`}
          style={{ minHeight: '200px', minWidth: '200px' }}
        />

        {/* If a photo is captured, show it */}
        {photoData && !cameraOpen && (
          <motion.img
            src={photoData}
            alt="Captured moment"
            className="w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.2 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          />
        )}

        {/* If camera is loading */}
        {cameraLoading && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500 font-mono z-10 bg-white/80">
            <svg className="animate-spin h-8 w-8 mr-3" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Loading camera...
          </div>
        )}

        {/* Controls if camera is on */}
        {cameraOpen && (
          <div className="absolute inset-0 flex items-end justify-center pb-4 z-20">
            <div className="flex space-x-4">
              <motion.button
                onClick={capturePhoto}
                className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Capture Photo"
              >
                📸
              </motion.button>
              <motion.button
                onClick={cancelCamera}
                className="w-16 h-16 bg-red-200 rounded-full shadow-lg flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Cancel Camera"
              >
                ❌
              </motion.button>
            </div>
          </div>
        )}

        {/* Button to start camera (if no photo yet and not showing camera) */}
        {!cameraOpen && !photoData && (
          <motion.button
            onClick={startCamera}
            className="absolute inset-0 w-full h-full flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Start Camera"
          >
            <div className="text-center">
              <div className="text-6xl mb-4">📷</div>
              <p className="font-mono">Capture your moment</p>
            </div>
          </motion.button>
        )}
      </div>

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Error Message */}
      {error && (
        <div className="text-red-500 text-sm mt-2 font-mono">
          {error}
          <button
            onClick={startCamera}
            className="ml-2 underline hover:text-red-700"
            aria-label="Retry camera access"
          >
            Retry
          </button>
        </div>
      )}
    </motion.div>
  );


  <CheckInForm
    caption={caption}
    moodTag={moodTag}
    setMoodTag={setMoodTag}
    handleCaption={handleCaption}
    submitEntry={submitEntry}
    photoData={photoData}
    error={error}
  />

  const JournalTimeline = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
      <h3 className="text-2xl font-serif text-gray-800 mb-6 text-center">Your Journey</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {journalEntries.slice(0, 20).map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
              animate={{ opacity: 1, scale: 1, rotate: entry.rotation }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.05, rotate: 0, transition: { duration: 0.2 } }}
              className="bg-white rounded-lg shadow-lg overflow-hidden transform"
              style={{ filter: 'sepia(10%) saturate(110%)' }}
            >
              <div className="relative">
                <img src={entry.photo} alt="Journal entry" className="w-full h-48 object-cover" />

                <div className="absolute -top-2 left-4 w-8 h-6 bg-yellow-200 opacity-70 transform rotate-12 rounded-sm"></div>
                <div className="absolute -top-2 right-4 w-8 h-6 bg-yellow-200 opacity-70 transform -rotate-12 rounded-sm"></div>
              </div>

              <div className="p-4">
                <p className="text-gray-800 font-mono text-sm mb-2" style={{ fontFamily: 'Caveat, cursive' }}>
                  {entry.caption}
                </p>
                <p className="text-gray-500 text-xs font-mono">
                  {new Date(entry.timestamp).toLocaleDateString()} • {entry.mood}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );

  const MoodboardFeed = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
      <h3 className="text-2xl font-serif text-gray-800 mb-6 text-center">Community Moments</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sharedPosts.map((post) => (
          <motion.div
            key={post.id}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between mb-4">
              <span
                className={`px-3 py-1 rounded-full text-sm font-mono ${post.mood === 'Grateful'
                  ? 'bg-green-100 text-green-800'
                  : post.mood === 'Raw'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-blue-100 text-blue-800'
                  }`}
              >
                {post.mood}
              </span>

              <motion.button
                onClick={() => sharePost(post)}
                className="text-gray-500 hover:text-gray-700"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label={`Share ${post.caption}`}
              >
                📤
              </motion.button>
            </div>

            <p className="text-gray-800 font-mono mb-4" style={{ fontFamily: 'Caveat, cursive' }}>
              "{post.caption}"
            </p>

            <div className="flex items-center justify-between">
              <motion.button
                className="flex items-center space-x-2 text-pink-600 hover:text-pink-800"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="React to post"
              >
                <span>🫂</span>
                <span className="text-sm font-mono">I felt this too</span>
              </motion.button>

              <span className="text-sm text-gray-500 font-mono">{post.reactions} reactions</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  const Navigation = () => (
    <motion.nav initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full flex flex-col md:flex-row items-center gap-4 mb-8">
      {[
        { key: 'home', label: 'Check In', icon: <House /> },
        { key: 'journal', label: 'Journal', icon: <Book /> },
        { key: 'community', label: 'Community', icon: <Star /> },
        { key: 'whisper', label: 'Whisper', icon: <MessageCircleHeart /> },
      ].map((item) => (
        <motion.button
          key={item.key}
          onClick={() => setCurrentView(item.key)}
          className={`w-full flex items-center px-6 py-3 rounded-full font-mono text-sm transition-colors ${currentView === item.key ? 'bg-pink-200 text-gray-800' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={`Navigate to ${item.label}`}
        >
          <span className="mr-2">{item.icon}</span>
          <span>{item.label}</span>
        </motion.button>
      ))}
    </motion.nav>
  );

  return (
    <AppLayout>
      <Navigation />

      {currentView === 'home' && (
        <div>
          <DailyPrompt />
          <PhotoCapture />
          <CheckInForm />
        </div>
      )}

      {currentView === 'journal' && <JournalTimeline />}

      {currentView === 'community' && <MoodboardFeed />}

      {currentView === 'whisper' && <WhisperPage />}

      {catMode && (
        <motion.div
          className="fixed bottom-4 right-4 text-4xl z-50"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          drag
          dragElastic={0.2}
        >
          🐱
        </motion.div>
      )}
    </AppLayout>
  );
};

export default SeenlyApp;