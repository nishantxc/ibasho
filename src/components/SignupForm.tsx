import React, { useState, FormEvent, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { signUpWithEmail, signInWithGoogle } from '../../supabase/Supabase';
import { useRouter } from 'next/navigation';

interface SignupFormProps {
  onSignupSuccess?: () => void;
}

interface SignupData {
  email: string;
  password: string;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSignupSuccess }) => {
  const [signupData, setSignupData] = useState<SignupData>({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showValidation, setShowValidation] = useState<boolean>(false);
  const [kittenClicked, setKittenClicked] = useState<boolean>(false);

  const router = useRouter();

  const handleKittenClick = (): void => {
    setKittenClicked(true);
    setTimeout(() => setKittenClicked(false), 2000);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setShowValidation(true);
    setAuthError(null);
    try {
      const result = await signUpWithEmail(signupData.email, signupData.password);
      if (result.error) {
        setAuthError(result.error.message);
        setShowValidation(false);
        setIsLoading(false);
        return;
      }
      if (onSignupSuccess) { 
        router.push('/onboarding'); 
        onSignupSuccess(); 
      }
    } catch (error: any) {
      setAuthError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async (): Promise<void> => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setAuthError(error.message);
        setIsLoading(false);
      }
    } catch (error: any) {
      setAuthError(error.message);
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setSignupData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-blue-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23FAF7F0\' fill-opacity=\'0.3\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'1\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-md w-full"
      >
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-pink-100">
          {/* Header */}
          <motion.div
            className="text-center mb-8 pt-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-3xl font-serif text-gray-800 mb-2">Welcome to your safe space</h2>
            <p className="text-gray-600 font-mono text-sm">Every feeling matters. Every moment counts.</p>
          </motion.div>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {/* Email field */}
            <div className="relative">
              <input
                type="email"
                name="email"
                value={signupData.email}
                onChange={handleInputChange}
                className="text-gray-600 w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent transition-all duration-300 font-mono"
                placeholder="your.email@example.com"
                required
              />
              <motion.div
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: signupData.email ? 1 : 0 }}
              >
                <span className="text-green-500">✓</span>
              </motion.div>
            </div>
            
            {/* Password field */}
            <div className="relative">
              <input
                type="password"
                name="password"
                value={signupData.password}
                onChange={handleInputChange}
                className="text-gray-600 w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent transition-all duration-300 font-mono"
                placeholder="Your secure password"
                required
              />
              <motion.div
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: signupData.password ? 1 : 0 }}
              >
                <span className="text-green-500">✓</span>
              </motion.div>
            </div>

            {/* Error message */}
            <AnimatePresence>
              {authError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center text-sm font-mono text-rose-600 bg-rose-50 p-3 rounded-lg"
                >
                  {authError}
                </motion.div>
              )}
            </AnimatePresence>

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
              className="w-full py-4 bg-gradient-to-r from-blue-200 to-indigo-200 text-gray-800 rounded-xl font-medium hover:from-blue-300 hover:to-indigo-300 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: isLoading ? 1 : 1.02, y: isLoading ? 0 : -2 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <motion.div
                    className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full mr-2"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                  Creating your space...
                </div>
              ) : (
                'Begin your journey'
              )}
            </motion.button>

            {/* Login link */}
            <motion.button
              type="button"
              onClick={() => router.push('/login')}
              disabled={isLoading}
              className="w-full py-2 bg-white text-gray-800 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              whileHover={{ scale: isLoading ? 1 : 1.02, y: isLoading ? 0 : -2 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
            >
              <span className="text-gray-500">Already have an account? <span className='text-blue-500'>Sign in</span></span>
            </motion.button>
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

export default SignupForm;