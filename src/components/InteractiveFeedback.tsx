import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Award, Info, AlertTriangle, X, Sparkles, Star, ThumbsUp } from 'lucide-react';

interface InteractiveFeedbackProps {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error' | 'congrats';
  onClose: () => void;
  duration?: number;
}

export default function InteractiveFeedback({
  isOpen,
  title,
  message,
  type,
  onClose,
  duration = 5000
}: InteractiveFeedbackProps) {

  // Auto close for toast types
  useEffect(() => {
    if (isOpen && type !== 'congrats' && type !== 'error') {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, type, duration, onClose]);

  if (!isOpen) return null;

  // Celebratory full screen overlay mode
  if (type === 'congrats') {
    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md select-none">
          {/* Confetti or Stars effect wrapper */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-amber-400"
                initial={{ 
                  x: Math.random() * window.innerWidth, 
                  y: window.innerHeight + 100,
                  rotate: 0,
                  opacity: 0,
                  scale: 0.5 
                }}
                animate={{ 
                  y: -100, 
                  rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
                  opacity: [0, 1, 1, 0],
                  scale: [0.5, Math.random() * 1.5 + 0.8, 0.5]
                }}
                transition={{ 
                  duration: Math.random() * 4 + 3, 
                  repeat: Infinity,
                  delay: i * 0.4
                }}
              >
                {i % 3 === 0 ? <Star className="w-5 h-5 fill-amber-400" /> : i % 3 === 1 ? <Sparkles className="w-6 h-6" /> : <Award className="w-7 h-7" />}
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 180 }}
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border-4 border-amber-400 relative p-8 text-center space-y-6"
          >
            {/* Absolute close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-700 dark:text-slate-400 rounded-full transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Glowing Golden Medallion */}
            <div className="mx-auto w-24 h-24 rounded-full bg-amber-150 dark:bg-amber-950/50 flex items-center justify-center border-4 border-amber-400 shadow-lg shadow-amber-400/25 relative animate-pulse">
              <Award className="w-12 h-12 text-amber-500" />
              <motion.div
                className="absolute inset-0 rounded-full border border-amber-300"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            </div>

            <div className="space-y-2">
              <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                {title || "Mubarakbad! 🎉"}
              </h3>
              <p className="text-sm font-semibold text-[#1e5631] dark:text-[#a4be7b] font-serif uppercase tracking-widest">
                Noorul Uloom Assessment Excellence
              </p>
            </div>

            {/* Customized message description */}
            <div className="bg-[#1e5631]/5 dark:bg-[#1e5631]/10 rounded-2xl p-5 border border-[#1e5631]/10 dark:border-[#1e5631]/20">
              <p className="text-base text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
                {message || "Masha Allah! Aapne imtihaan bahut hi acchi kamyabi se pass kar liya hai. Mehnat rang layi!"}
              </p>
              <div className="mt-4 flex justify-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-semibold items-center">
                <Sparkles className="w-3.5 h-3.5 animate-bounce" />
                <span>Keep learning, keep shining! (खूब पढ़ें, आगे बढ़ें!)</span>
                <Sparkles className="w-3.5 h-3.5 animate-bounce" />
              </div>
            </div>

            <div className="pt-2 flex justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="px-8 py-3 bg-[#1e5631] hover:bg-[#164024] text-white text-sm font-extrabold tracking-wider uppercase rounded-xl transition cursor-pointer shadow-lg shadow-[#1e5631]/20 flex items-center gap-2"
              >
                <ThumbsUp className="w-4 h-4" /> Shukriya (Thank You)
              </motion.button>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    );
  }

  // Toast mode for standard clicks feedback
  const config = {
    success: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/80',
      border: 'border-emerald-200 dark:border-emerald-850',
      text: 'text-slate-850 dark:text-emerald-100',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
    },
    info: {
      bg: 'bg-slate-50 dark:bg-slate-900/90',
      border: 'border-slate-200 dark:border-slate-800',
      text: 'text-slate-850 dark:text-slate-200',
      icon: <Info className="w-5 h-5 text-slate-600 dark:text-slate-400" />
    },
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-955/70',
      border: 'border-amber-200 dark:border-amber-900/50',
      text: 'text-slate-850 dark:text-amber-100',
      icon: <AlertTriangle className="w-5 h-5 text-amber-500 dark:text-amber-400" />
    },
    error: {
      bg: 'bg-rose-50 dark:bg-rose-955/80',
      border: 'border-rose-200 dark:border-rose-900/40',
      text: 'text-slate-850 dark:text-rose-100',
      icon: <X className="w-5 h-5 text-rose-500 dark:text-rose-400" />
    }
  };

  const style = config[type === 'error' ? 'error' : type === 'warning' ? 'warning' : type === 'info' ? 'info' : 'success'];

  return (
    <AnimatePresence>
      <div className="fixed bottom-24 right-4 md:right-8 z-50 pointer-events-none flex flex-col items-end">
        <motion.div
          initial={{ x: 100, opacity: 0, scale: 0.95 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          exit={{ x: 100, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 20, stiffness: 150 }}
          className={`pointer-events-auto flex items-start gap-3.5 p-4 rounded-2xl ${style.bg} border ${style.border} shadow-2xl max-w-sm w-full`}
        >
          {/* Status Icon */}
          <div className="flex-shrink-0 mt-0.5">
            {style.icon}
          </div>

          {/* Description texts */}
          <div className="flex-1 space-y-1">
            <h4 className="text-xs font-bold font-mono tracking-wider uppercase opacity-85 text-slate-500 dark:text-slate-400">
              {title}
            </h4>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-relaxed">
              {message}
            </p>
          </div>

          <button
            onClick={onClose}
            className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
