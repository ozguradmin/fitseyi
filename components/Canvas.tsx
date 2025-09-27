/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { ResetIcon, ChevronLeftIcon, ChevronRightIcon } from './icons';
import Spinner from './Spinner';
import { AnimatePresence, motion } from 'framer-motion';

interface CanvasProps {
  displayImageUrl: string | null;
  onStartOver: () => void;
  isLoading: boolean;
  loadingMessage: string;
  onSelectPose: (index: number) => void;
  poseLabels: string[];
  currentPoseIndex: number;
  availablePoseKeys: number[];
  sheetState: 'partial' | 'full';
}

const Canvas: React.FC<CanvasProps> = ({ 
  displayImageUrl, 
  onStartOver, 
  isLoading, 
  loadingMessage, 
  onSelectPose, 
  poseLabels, 
  currentPoseIndex, 
  sheetState
}) => {
  
  const handlePreviousPose = () => {
    if (isLoading) return;
    const newIndex = (currentPoseIndex - 1 + poseLabels.length) % poseLabels.length;
    onSelectPose(newIndex);
  };

  const handleNextPose = () => {
    if (isLoading) return;
    const newIndex = (currentPoseIndex + 1) % poseLabels.length;
    onSelectPose(newIndex);
  };
  
  return (
    <div className="w-full h-full flex items-center justify-center p-4 relative group">
      <button 
          onClick={onStartOver}
          className="absolute top-4 left-4 z-20 flex items-center justify-center bg-background-light/80 backdrop-blur-sm rounded-full p-2.5 text-text-light active:scale-95 transition-transform"
          aria-label="Baştan Başla"
      >
          <ResetIcon className="w-6 h-6" />
      </button>

      <div className="relative w-full h-full flex items-center justify-center">
        {displayImageUrl ? (
          <motion.img
            key={displayImageUrl}
            src={displayImageUrl}
            alt="Sanal deneme modeli"
            className="max-w-full max-h-full object-contain rounded-xl"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        ) : (
            <div className="w-full h-full bg-gray-100 rounded-lg flex flex-col items-center justify-center">
              <Spinner />
              <p className="text-md text-gray-600 mt-4">Model Yükleniyor...</p>
            </div>
        )}
        
        <AnimatePresence>
          {isLoading && (
              <motion.div
                  className="absolute inset-0 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center z-20 rounded-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
              >
                  <Spinner />
                  {loadingMessage && (
                      <p className="text-lg text-gray-700 mt-4 text-center px-4">{loadingMessage}</p>
                  )}
              </motion.div>
          )}
        </AnimatePresence>
      </div>

      {displayImageUrl && !isLoading && (
        <motion.div 
          className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10 w-full flex justify-center"
          animate={{ y: sheetState === 'partial' ? -260 : -20 }}
          transition={{ type: 'spring', damping: 20, stiffness: 150 }}
        >
          <div className="flex items-center justify-center gap-2 bg-background-light/80 backdrop-blur-sm p-2 rounded-full shadow-lg">
             {poseLabels.map((label, index) => (
                <button
                    key={label}
                    onClick={() => onSelectPose(index)}
                    disabled={isLoading}
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                      currentPoseIndex === index 
                        ? 'bg-primary text-white' 
                        : 'text-text-light hover:bg-primary/20 active:scale-95'
                    }`}
                >
                    {label}
                </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Canvas;
