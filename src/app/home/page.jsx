"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, House, Loader, LogOut, MessageCircle, MessageCircleHeart, Star } from 'lucide-react';
import WhisperPage from "@/components/Whisper"
import CheckInForm from "@/components/CheckInForm"
import Navigation from "@/components/Navigation"
import DailyPrompt from "@/components/DailyPrompt"
import PhotoCapture from "@/components/PhotoCapture"
import JournalTimeline from "@/components/JournalTimeline"
import MoodBoard from "@/components/MoodBoard"
import AppLayout from "@/components/AppLayout"
import { div } from 'framer-motion/client';
import { api } from '@/utils/api';
import { useRouter } from 'next/navigation';
import { signOut } from '../../../supabase/Supabase';
import { supabase } from '../../../supabase/Supabase';

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
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [catMode, setCatMode] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedPostForMessage, setSelectedPostForMessage] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const router = useRouter();

  // Konami code for cat mode
  const konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
  const [konamiIndex, setKonamiIndex] = useState(0);

    const handleGoogleLogout = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await signOut();
      if (response) {
        router.push('/login');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to logout');
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      const response = await api.users.getUser();
      setUser(response || null);
      console.log('User:', response);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setError('Failed to fetch user');
    }
  };

  // Fix: Memoize the caption handler to prevent re-renders
  const handleCaption = (e) => {
    setCaption(e.target.value);
  };

  // Fix: Memoize the submit handler
  const submitEntry = useCallback(async () => {
    setLoading(true)
    if (!photoData || !caption || !moodTag) {
      setError('Please capture a photo, add a caption, and select a mood.');
      return;
    }


    let imageUrl = null;
    if (photoData) {
      try {
        // Get current user session
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setError('Please login to upload images');
          setLoading(false);
          return;
        }

        // Convert base64 to blob
        const base64Data = photoData.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteArrays = [];
        
        for (let i = 0; i < byteCharacters.length; i++) {
          byteArrays.push(byteCharacters.charCodeAt(i));
        }
        
        const blob = new Blob([new Uint8Array(byteArrays)], { type: 'image/jpeg' });

        // Create unique filename with user ID
        const fileName = `${user.id}/${moodTag}_${Date.now()}.jpg`;
        
        // Upload blob to Supabase with user metadata
        const { data, error: uploadError } = await supabase.storage
          .from('ibasho')
          .upload(fileName, blob, {
            contentType: 'image/jpeg',
            cacheControl: '3600',
            upsert: false,
            metadata: {
              userId: user.id,
              moodTag: moodTag
            }
          });

        if (uploadError) {
          console.error("Image upload error:", uploadError);
          setError(`Failed to upload image: ${uploadError.message}`);
          setLoading(false);
          return;
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('ibasho')
          .getPublicUrl(fileName);

        imageUrl = publicUrlData.publicUrl;
        
      } catch (err) {
        console.error("Image processing error:", err);
        setError("Failed to process image for upload");
        setLoading(false);
        return;
      }
    }

    const newEntry = {
      id: Date.now(),
      photo: imageUrl,
      caption,
      mood: moodTag,
      timestamp: new Date().toISOString(),
      rotation: Math.random() * 12 - 6,
    };

    try {
      const response = await api.journal.createEntry({
        caption: newEntry.caption,
        mood: newEntry.mood,
        mood_score: 8,
        rotation: newEntry.rotation,
        // user_id: user.id,
        images: newEntry.photo,
      })
      console.log('Journal entry created:', response);
      // setJournalEntries(prev => [newEntry.entry, ...prev])
    } catch (err) {
      console.log('Error creating journal entry:', err);
    }

    setJournalEntries(prev => [...prev, newEntry]);
    setPhotoData(null);
    setCaption('');
    setMoodTag('');
    setCurrentView('journal');
    setError('');
    setLoading(false)
  }, [photoData, caption, moodTag]);

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

  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      setError('Camera requires HTTPS. Please deploy to a secure server.');
    }
    fetchUser();

  }, []);

  const startCamera = async () => {
    setCameraLoading(true);
    setError('');

    try {
      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 640, max: 1280 },
          height: { ideal: 480, max: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      console.log('Stream:', stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        const playPromise = videoRef.current.play();
        console.log('Play Promise:', playPromise);

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('Video playback started');
              setCameraOpen(true);
              setCameraLoading(false);
            })
            .catch(error => {
              console.error('Video play failed:', error);
              handlePlayError(error, stream);
            });
        } else {
          // Fallback for browsers without play promises
          setTimeout(() => {
            if (!videoRef.current.paused) {
              setCameraOpen(true);
              setCameraLoading(false);
            }
          }, 100);
        }
      }
    } catch (err) {
      console.error('Camera access error:', err);
      let errorMessage = 'Camera access failed.';

      if (err.name === 'NotAllowedError') {
        errorMessage = 'Camera permission denied. Please allow camera access and refresh.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No camera found on this device.';
      } else if (err.name === 'NotSupportedError') {
        errorMessage = 'Camera not supported in this browser.';
      } else if (err.name === 'OverconstrainedError') {
        errorMessage = 'Camera constraints not supported. Trying simpler setup...';

        // Fallback with minimal constraints
        setTimeout(() => {
          navigator.mediaDevices.getUserMedia({ video: true })
            .then(fallbackStream => {
              if (videoRef.current) {
                videoRef.current.srcObject = fallbackStream;
                videoRef.current.play().then(() => {
                  setCameraOpen(true);
                  setCameraLoading(false);
                });
              }
            })
            .catch(() => {
              setError('Camera initialization failed completely.');
              setCameraLoading(false);
            });
        }, 1000);
        return;
      }

      setError(errorMessage);
      setCameraLoading(false);
      setCameraOpen(false);
    }
  };

  const handlePlayError = (error, stream) => {
    setCameraLoading(false);
    setError('Failed to start video playback');
    stream.getTracks().forEach(track => track.stop());
    // Additional cleanup
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');

      // Ensure video is ready and has dimensions
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        setError('Camera not ready. Please wait a moment and try again.');
        return;
      }

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      try {
        // Mirror the image back for capture (since we mirror display)
        context.scale(-1, 1);
        context.drawImage(video, -video.videoWidth, 0, video.videoWidth, video.videoHeight);

        // Convert to data URL with good quality
        const dataURL = canvas.toDataURL('image/jpeg', 0.9);

        // Validate the captured image
        if (dataURL && dataURL.length > 1000) { // Basic validation
          setPhotoData(dataURL);
          setCameraOpen(false);

          // Stop camera stream
          const stream = video.srcObject;
          if (stream) {
            stream.getTracks().forEach(track => track.stop());
            video.srcObject = null;
          }

          // Clear any existing errors
          setError('');
        } else {
          setError('Failed to capture image. Please try again.');
        }
      } catch (err) {
        console.error('Capture error:', err);
        setError('Error capturing photo. Please try again.');
      }
    }
  };

  const cancelCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraOpen(false);
    setCameraLoading(false);
    setError('');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataURL = event.target.result;
      if (dataURL && dataURL.length > 1000) {
        setPhotoData(dataURL);
        setCameraOpen(false);
        setError('');
      } else {
        setError('Failed to load image. Please try another file.');
      }
    };
    reader.onerror = () => {
      setError('Error reading file.');
    };
    reader.readAsDataURL(file);
  };


  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => {
      console.log('Video can play');
      if (cameraLoading) {
        setCameraOpen(true);
        setCameraLoading(false);
      }
    };

    const handleError = (e) => {
      console.error('Video error event:', e);
      setError('Video stream error occurred.');
      setCameraLoading(false);
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
    };
  }, [cameraLoading]);


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

  // useEffect(() => {
  //   fetchUser();
  // }, [])


  if (loading) {
    return (
      <div className='w-full h-screen flex items-center justify-center'>
        <Loader className="animate-spin text-4xl text-gray-500 mx-auto mt-20" />
      </div>
    )
  }

  return (
    <div>
      <header className="w-full h-[10vh] flex justify-between bg-gradient-to-r from-pink-100/80 to-blue-100/80 backdrop-blur-sm">
        <div className="w-full container mx-auto px-4 flex items-center justify-between">
          <motion.h1
            className="text-3xl font-light text-gray-800 font-serif"
            whileHover={{ scale: 1.05 }}
            aria-label="Ibasho Logo"
          >
            ibasho <span className='text-sm font-light'>(居場所)</span>
          </motion.h1>

          <div className='flex gap-4 items-center justify-center'>

            <motion.button
              // onClick={() => setCurrentView('home')}
              className='text-gray-500 rounded-full border border-gray-500 px-3 py-3 font-mono text-lg font-bold'
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Go to Check-In"
              onClick={() => handleGoogleLogout()}
            >
              <LogOut size={16} />
            </motion.button>
            <div className='text-gray-500 rounded-full border border-gray-500 px-4 py-2 font-mono text-lg font-bold'>
              {user && <p>{user}</p>}
            </div>
          </div>
        </div>
      </header>
      <div className="container mx-auto px-4 py-8 md:flex gap-8">
        <Navigation currentView={currentView} setCurrentView={setCurrentView} />

        {currentView === 'home' && (
          <div className='w-full'>
            <DailyPrompt />
            <PhotoCapture
              photoData={photoData}
              setPhotoData={setPhotoData}
              cameraOpen={cameraOpen}
              setCameraOpen={setCameraOpen}
              cameraLoading={cameraLoading}
              startCamera={startCamera}
              capturePhoto={capturePhoto}
              cancelCamera={cancelCamera}
              handleFileUpload={handleFileUpload}
              videoRef={videoRef}
              canvasRef={canvasRef}
              error={error}
            />
            <CheckInForm
              caption={caption}
              setCaption={setCaption}
              moodTag={moodTag}
              setMoodTag={setMoodTag}
              handleCaption={handleCaption}
              submitEntry={submitEntry}
              photoData={photoData}
              error={error}
            />
          </div>
        )}

        {currentView === 'journal' && <JournalTimeline journalEntries={journalEntries} onBack={() => setCurrentView('home')} />}

        {currentView === 'community' && (
          <MoodBoard
            sharedPosts={sharedPosts}
            onSendMessage={(post) => {
              setSelectedPostForMessage(post);
              setCurrentView('whisper');
            }}
          />
        )}

        {currentView === 'whisper' && (
          <WhisperPage
            initialPostReference={selectedPostForMessage}
            onBackToCommunity={() => {
              setSelectedPostForMessage(null);
              setCurrentView('community');
            }}
          />
        )}

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
      </div>
    </div>
  );
};

export default SeenlyApp;