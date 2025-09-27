/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StartScreen from './components/StartScreen';
import Canvas from './components/Canvas';
import WardrobePanel from './components/WardrobePanel';
import OutfitStack from './components/OutfitStack';
import { generateVirtualTryOnImage, generatePoseVariation } from './services/geminiService';
import { OutfitLayer, WardrobeItem } from './types';
import { GrabberIcon } from './components/icons';
import { defaultWardrobe } from './wardrobe';
import { getFriendlyErrorMessage } from './lib/utils';
import Header from './components/Header';
import Footer from './components/Footer';

const POSE_PROMPTS = [
  "Full frontal view, hands on hips",
  "Slightly turned, 3/4 view",
  "Side profile view",
  "Jumping in the air, mid-action shot",
  "Walking towards camera",
  "Leaning against a wall",
];

const POSE_LABELS = [
  "Önden",
  "Yandan",
  "Profil",
  "Hareketli",
  "Yürüyüş",
  "Yaslanmış",
];


const App: React.FC = () => {
  const [modelImageUrl, setModelImageUrl] = useState<string | null>(null);
  const [outfitHistory, setOutfitHistory] = useState<OutfitLayer[]>([]);
  const [currentOutfitIndex, setCurrentOutfitIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>(defaultWardrobe);
  
  const [sheetState, setSheetState] = useState<'partial' | 'full'>('partial');
  const [activeTab, setActiveTab] = useState<'outfit' | 'wardrobe'>('outfit');

  const activeOutfitLayers = useMemo(() => 
    outfitHistory.slice(0, currentOutfitIndex + 1), 
    [outfitHistory, currentOutfitIndex]
  );
  
  const activeGarmentIds = useMemo(() => 
    activeOutfitLayers.map(layer => layer.garment?.id).filter(Boolean) as string[], 
    [activeOutfitLayers]
  );
  
  const displayImageUrl = useMemo(() => {
    if (outfitHistory.length === 0) return modelImageUrl;
    const currentLayer = outfitHistory[currentOutfitIndex];
    if (!currentLayer) return modelImageUrl;

    const poseInstruction = POSE_PROMPTS[currentPoseIndex];
    return currentLayer.poseImages[poseInstruction] ?? Object.values(currentLayer.poseImages)[0];
  }, [outfitHistory, currentOutfitIndex, currentPoseIndex, modelImageUrl]);

  const availablePoseKeys = useMemo(() => {
    if (outfitHistory.length === 0) return [];
    const currentLayer = outfitHistory[currentOutfitIndex];
    return currentLayer ? Object.keys(currentLayer.poseImages) : [];
  }, [outfitHistory, currentOutfitIndex]);

  const handleModelFinalized = (url: string) => {
    setModelImageUrl(url);
    setOutfitHistory([{
      garment: null,
      poseImages: { [POSE_PROMPTS[0]]: url }
    }]);
    setCurrentOutfitIndex(0);
    setActiveTab('wardrobe');
  };

  const handleStartOver = () => {
    setModelImageUrl(null);
    setOutfitHistory([]);
    setCurrentOutfitIndex(0);
    setIsLoading(false);
    setLoadingMessage('');
    setError(null);
    setCurrentPoseIndex(0);
    setWardrobe(defaultWardrobe);
    setSheetState('partial');
  };

  const handleGarmentSelect = useCallback(async (garmentFile: File, garmentInfo: WardrobeItem) => {
    if (!displayImageUrl || isLoading) return;

    const nextLayer = outfitHistory[currentOutfitIndex + 1];
    if (nextLayer && nextLayer.garment?.id === garmentInfo.id) {
        setCurrentOutfitIndex(prev => prev + 1);
        setCurrentPoseIndex(0);
        setActiveTab('outfit');
        return;
    }

    setError(null);
    setIsLoading(true);
    setLoadingMessage(`${garmentInfo.name} ekleniyor...`);
    setSheetState('partial');

    try {
      const newImageUrl = await generateVirtualTryOnImage(displayImageUrl, garmentFile);
      const currentPoseInstruction = POSE_PROMPTS[currentPoseIndex];
      
      const newLayer: OutfitLayer = { 
        garment: garmentInfo, 
        poseImages: { [currentPoseInstruction]: newImageUrl } 
      };

      setOutfitHistory(prevHistory => {
        const newHistory = prevHistory.slice(0, currentOutfitIndex + 1);
        return [...newHistory, newLayer];
      });
      setCurrentOutfitIndex(prev => prev + 1);
      
      setWardrobe(prev => {
        if (prev.find(item => item.id === garmentInfo.id)) return prev;
        return [...prev, garmentInfo];
      });
      setActiveTab('outfit');
    } catch (err) {
      setError(getFriendlyErrorMessage(err, 'Kıyafet uygulanamadı'));
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [displayImageUrl, isLoading, currentPoseIndex, outfitHistory, currentOutfitIndex]);

  const handleRemoveLastGarment = () => {
    if (currentOutfitIndex > 0) {
      setCurrentOutfitIndex(prevIndex => prevIndex - 1);
      setCurrentPoseIndex(0);
    }
  };
  
  const handlePoseSelect = useCallback(async (newIndex: number) => {
    if (isLoading || outfitHistory.length === 0 || newIndex === currentPoseIndex) return;
    
    const poseInstruction = POSE_PROMPTS[newIndex];
    const currentLayer = outfitHistory[currentOutfitIndex];

    if (currentLayer.poseImages[poseInstruction]) {
      setCurrentPoseIndex(newIndex);
      return;
    }

    const baseImageForPoseChange = Object.values(currentLayer.poseImages)[0];
    if (!baseImageForPoseChange) return;

    setError(null);
    setIsLoading(true);
    setLoadingMessage(`Poz değiştiriliyor...`);
    
    const prevPoseIndex = currentPoseIndex;
    setCurrentPoseIndex(newIndex);

    try {
      const newImageUrl = await generatePoseVariation(baseImageForPoseChange, poseInstruction);
      setOutfitHistory(prevHistory => {
        const newHistory = [...prevHistory];
        const updatedLayer = newHistory[currentOutfitIndex];
        updatedLayer.poseImages[poseInstruction] = newImageUrl;
        return newHistory;
      });
    } catch (err) {
      setError(getFriendlyErrorMessage(err, 'Poz değiştirilemedi'));
      setCurrentPoseIndex(prevPoseIndex);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [currentPoseIndex, outfitHistory, isLoading, currentOutfitIndex]);
  
  const sheetVariants = {
    hidden: { y: "100%" },
    partial: { y: "calc(100% - 250px)" },
    full: { y: "0%" }
  };

  return (
    <div className="bg-background-light min-h-screen flex flex-col h-screen">
        <Header />
        <main className="flex-grow relative overflow-hidden">
            <AnimatePresence mode="wait">
                {!modelImageUrl ? (
                <motion.div
                    key="start-screen"
                    className="w-full h-full flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                >
                    <StartScreen onModelFinalized={handleModelFinalized} />
                </motion.div>
                ) : (
                <motion.div
                    key="main-app"
                    className="w-full h-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <div className="absolute top-0 left-0 h-full w-full">
                    <Canvas 
                        displayImageUrl={displayImageUrl}
                        onStartOver={handleStartOver}
                        isLoading={isLoading}
                        loadingMessage={loadingMessage}
                        onSelectPose={handlePoseSelect}
                        poseLabels={POSE_LABELS}
                        currentPoseIndex={currentPoseIndex}
                        availablePoseKeys={availablePoseKeys.map(key => POSE_PROMPTS.indexOf(key))}
                        sheetState={sheetState}
                    />
                    </div>

                    <div className="absolute bottom-0 left-0 w-full h-full pointer-events-none">
                    <motion.div
                        drag="y"
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={0.2}
                        onDragEnd={(event, info) => {
                        if (info.offset.y > 100) {
                            setSheetState('partial');
                        } else if (info.offset.y < -100) {
                            setSheetState('full');
                        }
                        }}
                        variants={sheetVariants}
                        initial="hidden"
                        animate={sheetState}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="absolute bottom-0 left-0 w-full h-full bg-background-light rounded-t-xl shadow-2xl flex flex-col pointer-events-auto"
                    >
                        <div 
                            className="flex-shrink-0 py-3 flex justify-center cursor-grab active:cursor-grabbing"
                            onPointerDown={() => {
                            setSheetState(sheetState === 'full' ? 'partial' : 'full');
                            }}
                        >
                            <GrabberIcon />
                        </div>
                        <div className="flex-shrink-0 border-b border-subtle-light px-4">
                            <div className="flex -mb-px">
                                <button 
                                    onClick={() => setActiveTab('outfit')}
                                    className={`px-4 py-3 border-b-2 text-sm font-bold transition-colors ${activeTab === 'outfit' ? 'border-primary text-text-light' : 'border-transparent text-text-light/50 hover:text-text-light hover:border-subtle-light'}`}
                                >
                                    Kombin
                                </button>
                                <button
                                    onClick={() => setActiveTab('wardrobe')} 
                                    className={`px-4 py-3 border-b-2 text-sm font-bold transition-colors ${activeTab === 'wardrobe' ? 'border-primary text-text-light' : 'border-transparent text-text-light/50 hover:text-text-light hover:border-subtle-light'}`}
                                >
                                    Gardırop
                                </button>
                            </div>
                        </div>
                        <div className="flex-grow overflow-y-auto px-4 pb-24">
                            {error && (
                            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-4 rounded-md" role="alert">
                                <p className="font-bold">Hata</p>
                                <p>{error}</p>
                            </div>
                            )}
                            <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="py-4"
                            >
                            {activeTab === 'outfit' ? (
                                <OutfitStack 
                                outfitHistory={activeOutfitLayers}
                                onRemoveLastGarment={handleRemoveLastGarment}
                                />
                            ) : (
                                <WardrobePanel
                                onGarmentSelect={handleGarmentSelect}
                                activeGarmentIds={activeGarmentIds}
                                isLoading={isLoading}
                                wardrobe={wardrobe}
                                />
                            )}
                            </motion.div>
                            </AnimatePresence>
                        </div>
                    </motion.div>
                    </div>
                </motion.div>
                )}
            </AnimatePresence>
        </main>
        <Footer />
    </div>
  );
};

export default App;
