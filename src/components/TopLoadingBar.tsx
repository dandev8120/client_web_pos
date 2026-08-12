import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

export const TopLoadingBar: React.FC = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Start progress bar when location changes
    setLoading(true);
    setProgress(20);

    const timer1 = setTimeout(() => {
      setProgress(65);
    }, 120);

    const timer2 = setTimeout(() => {
      setProgress(90);
    }, 280);

    const timer3 = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 250);
    }, 480);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [location.pathname, location.search]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none h-[4px] bg-slate-200/20"
        >
          {/* Animated Multi-Color Gradient Bar */}
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-500 via-blue-600 via-indigo-500 via-purple-500 via-pink-500 to-amber-400 bg-[length:200%_100%] animate-gradient-x shadow-[0_0_12px_rgba(168,85,247,0.9)] rounded-r-full relative overflow-hidden"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: 'easeOut', duration: 0.25 }}
          >
            {/* Shimmer light effect overlay */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent w-full h-full"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TopLoadingBar;

