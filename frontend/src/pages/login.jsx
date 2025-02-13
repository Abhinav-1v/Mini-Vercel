import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGithubLogin = () => {
    try {
      setIsLoading(true);
      setError('');
      window.location.href = "https://api.naresh.today/auth/login";
    } catch (err) {
      setError('Failed to initiate login. Please try again.');
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const buttonVariants = {
    rest: { scale: 1 },
    hover: { 
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    },
    tap: { scale: 0.98 }
  };

  const errorVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    },
    exit: { 
      opacity: 0,
      x: 20,
      transition: { duration: 0.2 }
    }
  };

  return (
    <div className="h-[calc(100vh-73px)] flex items-center justify-center bg-gradient-to-b from-gray-900 to-black text-white overflow-hidden">
      <motion.div 
        className="w-full max-w-md px-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          className="text-center"
          variants={itemVariants}
        >
          <motion.h1 
            className="text-4xl font-bold tracking-tight"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Mini-Vercel
          </motion.h1>
          <motion.p 
            className="mt-2 text-gray-400"
            variants={itemVariants}
          >
            Sign in to deploy your projects
          </motion.p>
        </motion.div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              className="mt-4 bg-red-900/50 border border-red-900 rounded-lg p-3 text-sm text-red-200"
              variants={errorVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          className="mt-6"
          variants={itemVariants}
        >
          <motion.button
            onClick={handleGithubLogin}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-3 rounded-lg bg-gray-800 px-4 py-3 text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
            variants={buttonVariants}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
          >
            {isLoading ? (
              <motion.svg 
                className="animate-spin h-5 w-5" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24"
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </motion.svg>
            ) : (
              <motion.svg 
                className="h-5 w-5" 
                viewBox="0 0 24 24" 
                fill="currentColor"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 0C5.373 0 0 5.373 0 12c0 5.303 3.438 9.8 8.207 11.385.6.111.793-.261.793-.58v-2.055C6.13 21.254 5.365 19.1 5.365 19.1c-.547-1.393-1.333-1.764-1.333-1.764-1.089-.744.083-.729.083-.729 1.205.084 1.84 1.24 1.84 1.24 1.07 1.835 2.805 1.305 3.49.997.108-.776.42-1.305.764-1.605-3.19-.364-6.545-1.595-6.545-7.102 0-1.57.561-2.856 1.48-3.86-.148-.363-.64-1.828.14-3.81 0 0 1.2-.385 3.93 1.475A13.75 13.75 0 0 1 12 5.8c1.22.005 2.445.165 3.59.482 2.73-1.86 3.93-1.475 3.93-1.475.78 1.982.288 3.447.14 3.81.92 1.004 1.48 2.29 1.48 3.86 0 5.52-3.36 6.735-6.56 7.095.43.38.81 1.13.81 2.28v3.38c0 .32.19.7.8.58C20.56 21.79 24 17.29 24 12c0-6.627-5.373-12-12-12z"
                />
              </motion.svg>
            )}
            {isLoading ? 'Connecting...' : 'Continue with GitHub'}
          </motion.button>
        </motion.div>

        <motion.p 
          className="mt-6 text-center text-sm text-gray-500"
          variants={itemVariants}
        >
          By continuing, you agree to our Terms of Service and Privacy Policy
        </motion.p>
      </motion.div>
    </div>
  );
};

export default LoginPage;