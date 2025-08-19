"use client";

import CheckInForm from "@/components/CheckInForm";
import DailyPrompt from "@/components/DailyPrompt";
import JournalTimeline from "@/components/JournalTimeline";
import MoodBoard from "@/components/MoodBoard";
import Navigation from "@/components/Navigation";
import PhotoCapture from "@/components/PhotoCapture";
import WhisperPage from "@/components/Whisper";
import { api } from '@/utils/api';
import { motion } from 'framer-motion';
import { Loader, LogOut, Menu, X } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { signOut, supabase } from '../../../supabase/Supabase';
import type { RootState } from '@/store/store';
import type { initialPostReference } from '@/types/types';
import { toast } from 'react-toastify';
import PremiumWrappedStory from "@/components/Wrapped";

type View = 'home' | 'journal' | 'community' | 'whisper' | 'insights';

const SeenlyApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [caption, setCaption] = useState<string>('');
  const [moodTag, setMoodTag] = useState<string>('');
  const [moodScore, setMoodScore] = useState<number>(5);
  const [journalEntries, setJournalEntries] = useState<any[]>([]);
  const [sharedPosts, setSharedPosts] = useState<any[]>([
    { id: 1, caption: "Found peace in my morning coffee", mood: "Grateful", reactions: 12 },
    { id: 2, caption: "Struggling but still here", mood: "Raw", reactions: 8 },
    { id: 3, caption: "Small wins today", mood: "Hopeful", reactions: 15 },
  ]);
  const [cameraOpen, setCameraOpen] = useState<boolean>(false);
  const [cameraLoading, setCameraLoading] = useState<boolean>(false);
  const [catMode, setCatMode] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [logoutOpen, setLogoutOpen] = useState<boolean>(false);
  const [navOpen, setNavOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedPostForMessage, setSelectedPostForMessage] = useState<initialPostReference | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const router = useRouter();
  const userProfile = useSelector((state: RootState) => state.userProfile);

  // Konami code for cat mode
  const konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
  const [konamiIndex, setKonamiIndex] = useState<number>(0);

  const handleGoogleLogout = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await signOut();
      if (response) {
        router.push('/login');
      }
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Failed to logout');
    } finally {
      setLoading(false);
    }
  };

  const compressImage = async (dataUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const maxDimension = 1280; // cap largest side
        const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
        const targetWidth = Math.round(img.width * scale);
        const targetHeight = Math.round(img.height * scale);

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas not supported'));
          return;
        }
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        try {
          // Prefer WebP when available, fallback to JPEG
          const tryWebP = canvas.toDataURL('image/webp', 0.82);
          if (tryWebP.startsWith('data:image/webp')) {
            resolve(tryWebP);
            return;
          }
          const jpeg = canvas.toDataURL('image/jpeg', 0.82);
          resolve(jpeg);
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = reject;
      img.src = dataUrl;
    });
  };

  const submitEntry = useCallback(async () => {
    setLoading(true)
    if (!photoData || !caption || !moodTag) {
      const msg = 'Please capture a photo, add a caption, and select a mood.';
      setError(msg);
      toast.error(msg);
      return;
    }

    let imageUrl: string | null = null;
    if (photoData) {
      try {
        // Get current user session
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          const msg = 'Please login to upload images';
          setError(msg);
          toast.error(msg);
          setLoading(false);
          return;
        }

        // Compress image and convert base64 to blob
        const compressedDataUrl = await compressImage(photoData);
        const [prefix, base64Data] = (compressedDataUrl || photoData).split(',');
        const mimeMatch = prefix?.match(/^data:(.*);base64$/);
        const mimeType = mimeMatch?.[1] || 'image/jpeg';
        const byteCharacters = atob(base64Data);
        const byteArrays: number[] = [];

        for (let i = 0; i < byteCharacters.length; i++) {
          byteArrays.push(byteCharacters.charCodeAt(i));
        }
        const blob = new Blob([new Uint8Array(byteArrays)], { type: mimeType });

        // Create unique filename with user ID and extension based on mime
        const ext = mimeType === 'image/webp' ? 'webp' : 'jpg';
        const fileName = `${user.id}/${moodTag}_${Date.now()}.${ext}`;

        // Upload blob to Supabase with user metadata
        const { data, error: uploadError } = await supabase.storage
          .from('ibasho')
          .upload(fileName, blob, {
            contentType: mimeType,
            cacheControl: '3600',
            upsert: false,
            metadata: {
              userId: user.id,
              moodTag: moodTag
            }
          });

        if (uploadError) {
          console.error("Image upload error:", uploadError);
          const msg = `Failed to upload image: ${uploadError.message}`;
          setError(msg);
          toast.error(msg);
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
        toast.error('Failed to process image for upload');
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
        mood_score: moodScore,
        rotation: newEntry.rotation,
        images: newEntry.photo,
      })
      console.log('Journal entry created:', response);
      toast.success('Saved to your journal');
    } catch (err) {
      console.log('Error creating journal entry:', err);
      toast.error('Failed to save journal entry');
    }

    setJournalEntries(prev => [...prev, newEntry]);
    setPhotoData(null);
    setCaption('');
    setMoodTag('');
    setCurrentView('journal');
    setError('');
    setLoading(false)
  }, [photoData, caption, moodTag, moodScore]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
      const v = videoRef.current as HTMLVideoElement | null;
      if (v?.srcObject) {
        const stream = v.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      setError('Camera requires HTTPS. Please deploy to a secure server.');
    }
  }, []);

  const startCamera = async () => {
    setCameraLoading(true);
    setError('');

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 640, max: 1280 },
          height: { ideal: 480, max: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      const v = videoRef.current as HTMLVideoElement | null;

      if (v) {
        v.srcObject = stream;

        const playPromise = v.play();

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setCameraOpen(true);
              setCameraLoading(false);
            })
            .catch(error => {
              console.error('Video play failed:', error);
              handlePlayError(error, stream);
            });
        } else {
          setTimeout(() => {
            if (!v.paused) {
              setCameraOpen(true);
              setCameraLoading(false);
            }
          }, 100);
        }
      }
    } catch (err: any) {
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
              const v = videoRef.current as HTMLVideoElement | null;
              if (v) {
                v.srcObject = fallbackStream;
                v.play().then(() => {
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

  const handlePlayError = (error: any, stream: MediaStream) => {
    setCameraLoading(false);
    setError('Failed to start video playback');
    stream.getTracks().forEach(track => track.stop());
    const v = videoRef.current as HTMLVideoElement | null;
    if (v) {
      v.srcObject = null;
    }
  };

  const capturePhoto = () => {
    const v = videoRef.current as HTMLVideoElement | null;
    const c = canvasRef.current as HTMLCanvasElement | null;
    if (v && c) {
      const canvas = c;
      const video = v;
      const context = canvas.getContext('2d');
      if (!context) {
        setError('Canvas not supported.');
        return;
      }

      if (video.videoWidth === 0 || video.videoHeight === 0) {
        setError('Camera not ready. Please wait a moment and try again.');
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      try {
        context.scale(-1, 1);
        context.drawImage(video, -video.videoWidth, 0, video.videoWidth, video.videoHeight);
        const dataURL = canvas.toDataURL('image/jpeg', 0.9);

        if (dataURL && dataURL.length > 1000) {
          setPhotoData(dataURL);
          setCameraOpen(false);
          const stream = video.srcObject as MediaStream | null;
          if (stream) {
            stream.getTracks().forEach(track => track.stop());
            (video as any).srcObject = null;
          }
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
    const v = videoRef.current as HTMLVideoElement | null;
    if (v?.srcObject) {
      const stream = v.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      v.srcObject = null;
    }
    setCameraOpen(false);
    setCameraLoading(false);
    setError('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const dataURL = event.target?.result as string;
        if (dataURL && dataURL.length > 1000) {
          const compressed = await compressImage(dataURL);
          setPhotoData(compressed);
          setCameraOpen(false);
          setError('');
        } else {
          setError('Failed to load image. Please try another file.');
        }
      } catch (err) {
        setError('Failed to compress image. Please try another file.');
      }
    };
    reader.onerror = () => {
      setError('Error reading file.');
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const video = videoRef.current as HTMLVideoElement | null;
    if (!video) return;

    const handleCanPlay = () => {
      if (cameraLoading) {
        setCameraOpen(true);
        setCameraLoading(false);
      }
    };

    const handleError = (e: Event) => {
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

  const sharePost = (post: any) => {
    const shareText = `"${post.caption}" - This helped me feel less alone today. Check out Ibasho 💫`;
    if ((navigator as any).share) {
      (navigator as any).share({
        title: 'Ibasho Moment',
        text: shareText,
        url: window.location.href,
      }).catch((err: any) => console.error('Share failed:', err));
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Share text copied to clipboard!');
    }
  };

  if(loading) {
    return (
      <div className='w-full h-screen flex items-center justify-center bg-black/20'>
        <Loader className="animate-spin text-4xl text-gray-500 mx-auto mt-20" />
      </div>
    )
  }

  return (
    <div>
      <header className="w-full h-[10vh] flex justify-between bg-gradient-to-r from-pink-100/80 to-blue-100/80 backdrop-blur-sm">
        <div className="w-full container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 rounded-lg border border-gray-300/80 bg-white/70"
              onClick={() => setNavOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="w-5 h-5 text-gray-700" />
            </button>
            <motion.h1
              className="text-3xl font-light text-gray-800 font-serif"
              whileHover={{ scale: 1.05 }}
              aria-label="Ibasho Logo"
            >
              ibasho <span className='text-sm font-light'>(居場所)</span>
            </motion.h1>
          </div>

          <div className='flex gap-4 items-center justify-center'>
            <div className='hidden md:flex text-gray-500 rounded-full border border-gray-500 px-4 py-2 font-mono text-lg font-light'>
              hi, {userProfile && <p>{userProfile?.username}</p>}
            </div>
            <motion.button
              className='text-gray-500 rounded-full border border-gray-500 px-3 py-3 font-mono text-lg font-bold'
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Log out"
              onClick={() => setLogoutOpen(true)}
            >
              <LogOut size={16} />
            </motion.button>
          </div>
        </div>
      </header>
      <Modal
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        title="Log out"
        description={
          <span>
            Are you sure you want to log out of <span className='font-semibold'>Ibasho</span>?
          </span>
        }
        confirmText="Log out"
        cancelText="Cancel"
        onConfirm={() => {
          setLogoutOpen(false);
          handleGoogleLogout();
        }}
      />
      <div className="container mx-auto px-4 py-8 md:flex gap-8">
        {/* Desktop sidebar */}
        <div className="hidden md:block md:w-[25%]">
          <Navigation currentView={currentView} setCurrentView={(v) => setCurrentView(v)} />
        </div>

        {/* Mobile Drawer */}
        <motion.div
          className={`fixed inset-0 z-40 md:hidden ${navOpen ? '' : 'pointer-events-none'}`}
          initial={false}
          animate={{ opacity: navOpen ? 1 : 0 }}
        >
          <div className="absolute inset-0 bg-black/30" onClick={() => setNavOpen(false)} />
          <motion.div
            initial={false}
            animate={{ x: navOpen ? 0 : -320 }}
            transition={{ type: 'tween', duration: 0.25 }}
            className="relative z-50 h-full w-[86%] max-w-xs bg-white border-r border-gray-200 p-4"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-700 font-semibold">Menu</span>
              <button className="p-2" onClick={() => setNavOpen(false)} aria-label="Close navigation">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <Navigation
              currentView={currentView}
              setCurrentView={(v) => setCurrentView(v)}
              onAfterNavigate={() => setNavOpen(false)}
              className="w-full flex flex-col items-stretch gap-3"
            />
          </motion.div>
        </motion.div>

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
              videoRef={videoRef as React.RefObject<HTMLVideoElement>}
              canvasRef={canvasRef as React.RefObject<HTMLCanvasElement>}
              error={error}
            />
            <CheckInForm
              caption={caption}
              setCaption={setCaption}
              moodTag={moodTag}
              setMoodTag={setMoodTag}
              submitEntry={submitEntry}
              photoData={photoData}
              error={error}
              moodScore={moodScore}
              setMoodScore={setMoodScore}
            />
          </div>
        )}

        {currentView === 'journal' && <JournalTimeline journalEntries={journalEntries} onBack={() => setCurrentView('home')} />}
        {currentView === 'insights' && <PremiumWrappedStory />}

        {currentView === 'community' && (
          <MoodBoard
            onSendMessage={(post) => {
              setSelectedPostForMessage({
                id: String(post.id),
                caption: post.caption,
                photo: post.photo,
                mood: post.mood || '',
                user_id: post.user_id,
                username: post.username,
              });
              setCurrentView('whisper');
            }}
          />
        )}

        {currentView === 'whisper' && (
          <WhisperPage
            initialPostReference={selectedPostForMessage || undefined}
            onBackToCommunity={() => {
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


