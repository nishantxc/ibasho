import React, { RefObject } from 'react';
import { motion } from 'framer-motion';
import { Camera, Upload, X } from 'lucide-react';

interface PhotoCaptureProps {
  photoData: string | null;
  setPhotoData: (data: string | null) => void;
  cameraOpen: boolean;
  setCameraOpen: (open: boolean) => void;
  cameraLoading: boolean;
  startCamera: () => void;
  capturePhoto: () => void;
  cancelCamera: () => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  videoRef: RefObject<HTMLVideoElement>;
  canvasRef: RefObject<HTMLCanvasElement>;
  error: string;
}

const PhotoCapture: React.FC<PhotoCaptureProps> = ({ 
  photoData, 
  setPhotoData, 
  cameraOpen, 
  setCameraOpen, 
  cameraLoading, 
  startCamera, 
  capturePhoto, 
  cancelCamera, 
  handleFileUpload, 
  videoRef, 
  canvasRef, 
  error 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg p-6 mb-6"
    >
      <h2 className="text-lg font-serif text-gray-800 mb-4">Capture Your Moment</h2>
      
      {!photoData && !cameraOpen && (
        <div className="space-y-4">
          <motion.button
            onClick={startCamera}
            disabled={cameraLoading}
            className="w-full py-3 bg-pink-300 hover:bg-pink-400 text-gray-800 rounded-full font-medium transition-colors flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Camera size={20} />
            {cameraLoading ? 'Starting Camera...' : 'Take Photo'}
          </motion.button>
          
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Upload size={20} />
              Upload Photo
            </label>
          </div>
        </div>
      )}

      {cameraOpen && (
        <div className="space-y-4">
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-64 object-cover rounded-lg"
              style={{ transform: 'scaleX(-1)' }}
            />
            <canvas ref={canvasRef} className="hidden" />
            
            <motion.button
              onClick={cancelCamera}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X size={16} />
            </motion.button>
          </div>
          
          <motion.button
            onClick={capturePhoto}
            className="w-full py-3 bg-pink-300 hover:bg-pink-400 text-gray-800 rounded-full font-medium"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Capture
          </motion.button>
        </div>
      )}

      {photoData && (
        <div className="space-y-4">
          <div className="relative">
            <img
              src={photoData}
              alt="Captured moment"
              className="w-full h-64 object-cover rounded-lg"
            />
            <motion.button
              onClick={() => setPhotoData(null)}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X size={16} />
            </motion.button>
          </div>
          <p className="text-sm text-gray-600 font-mono">Photo captured! Now add your thoughts below.</p>
        </div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-500 text-sm p-3 bg-red-50 rounded-lg font-mono"
        >
          {error}
        </motion.div>
      )}
    </motion.div>
  );
};

export default PhotoCapture;