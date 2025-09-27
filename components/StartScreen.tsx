/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloudIcon } from './icons';
import { Compare } from './ui/compare';
import { generateModelImage } from '../services/geminiService';
import Spinner from './Spinner';
import { getFriendlyErrorMessage } from '../lib/utils';

interface StartScreenProps {
  onModelFinalized: (modelUrl: string) => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onModelFinalized }) => {
  const [userImageUrl, setUserImageUrl] = useState<string | null>(null);
  const [generatedModelUrl, setGeneratedModelUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
        setError('Lütfen bir resim dosyası seçin.');
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        setUserImageUrl(dataUrl);
        setIsGenerating(true);
        setGeneratedModelUrl(null);
        setError(null);
        try {
            const result = await generateModelImage(file);
            setGeneratedModelUrl(result);
        } catch (err) {
            setError(getFriendlyErrorMessage(err, 'Model oluşturulamadı'));
            setUserImageUrl(null);
        } finally {
            setIsGenerating(false);
        }
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const reset = () => {
    setUserImageUrl(null);
    setGeneratedModelUrl(null);
    setIsGenerating(false);
    setError(null);
  };

  const screenVariants = {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 },
  };

  return (
    <div className="w-full max-w-md mx-auto h-full flex flex-col justify-center text-center">
    <AnimatePresence mode="wait">
      {!userImageUrl ? (
        <motion.div
          key="uploader"
          variants={screenVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <h1 className="text-4xl font-bold text-text-light leading-tight">
            Kişisel Deneme Odanız
          </h1>
          <p className="mt-2 text-zinc-600">
            Bir fotoğrafınızı yükleyin, yapay zekamız kıyafetleri sanal olarak denemeniz için dijital bir model oluştursun.
          </p>
          <div className="mt-8">
            <label htmlFor="image-upload-start" className="w-full max-w-sm px-8 py-3 text-lg font-bold text-white rounded-full bg-primary cursor-pointer inline-block transition-transform active:scale-95">
              Fotoğraf Yükle
            </label>
            <input id="image-upload-start" type="file" className="hidden" accept="image/png, image/jpeg, image/webp, image/avif, image/heic, image/heif" onChange={handleFileChange} />
            <p className="mt-3 text-sm text-zinc-500">En iyi sonuçlar için net, tam vücut bir fotoğraf kullanın.</p>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="compare"
          className="w-full flex flex-col items-center justify-center"
          variants={screenVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                Yeni Sen
              </h1>
              <p className="mt-2 text-md text-gray-600">
                Dönüşümünü görmek için kaydırıcıyı sürükle.
              </p>
            </div>
            
            <div className="my-6">
                <Compare
                    firstImage={userImageUrl}
                    secondImage={generatedModelUrl ?? userImageUrl}
                    slideMode="drag"
                    className="w-[280px] h-[420px] sm:w-[320px] sm:h-[480px] rounded-xl bg-gray-200 shadow-lg"
                />
            </div>
            
            {isGenerating && (
              <div className="flex items-center gap-3 text-lg text-gray-700 mt-6">
                <Spinner />
                <span>Modelin oluşturuluyor...</span>
              </div>
            )}

            {error && 
              <div className="text-center text-red-600 max-w-md mt-6">
                <p className="font-semibold">Oluşturma Başarısız</p>
                <p className="text-sm mb-4">{error}</p>
                <button onClick={reset} className="text-sm font-semibold text-gray-700 hover:underline">Tekrar Dene</button>
              </div>
            }
            
            <AnimatePresence>
              {generatedModelUrl && !isGenerating && !error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col w-full max-w-xs gap-3 mt-4"
                >
                  <button 
                    onClick={() => onModelFinalized(generatedModelUrl)}
                    className="w-full px-8 py-3 text-base font-semibold text-white bg-primary rounded-full cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    Stil Oluşturmaya Başla &rarr;
                  </button>
                  <button 
                    onClick={reset}
                    className="w-full px-6 py-3 text-base font-semibold text-gray-700 bg-gray-200 rounded-full cursor-pointer hover:bg-gray-300 transition-colors"
                  >
                    Farklı Fotoğraf Kullan
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
    </div>
  );
};

export default StartScreen;
