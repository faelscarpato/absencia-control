'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface RealtimeNotificationProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

export default function RealtimeNotification({ 
  message, 
  isVisible, 
  onClose 
}: RealtimeNotificationProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 right-4 z-50 bg-blue-600 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg shadow-lg max-w-[90%] sm:max-w-md text-sm"
        >
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            <p>{message}</p>
            <button 
              onClick={onClose}
              className="p-1 hover:bg-blue-700 rounded-full flex-shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
