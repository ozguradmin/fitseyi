/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { OutfitLayer } from '../types';
import { TrashIcon } from './icons';

interface OutfitStackProps {
  outfitHistory: OutfitLayer[];
  onRemoveLastGarment: () => void;
}

const OutfitStack: React.FC<OutfitStackProps> = ({ outfitHistory, onRemoveLastGarment }) => {
  return (
    <div className="flex flex-col">
      <h2 className="text-lg font-bold text-text-light mb-4">Kombin Katmanları</h2>
      <ul className="divide-y divide-subtle-light">
        {outfitHistory.map((layer, index) => (
          <li
            key={layer.garment?.id || 'base'}
            className="flex items-center justify-between py-4"
          >
            <div className="flex items-center gap-4">
              {layer.garment && (
                  <img src={layer.garment.url} alt={layer.garment.name} className="w-12 h-12 object-cover rounded-lg bg-center" />
              )}
               <span className="font-semibold text-text-light">
                {layer.garment ? layer.garment.name : 'Ana Model'}
              </span>
            </div>

            <div className="flex items-center gap-4">
                <span className="text-sm text-text-light/70">
                    Katman {index + 1}
                </span>
                {index > 0 && index === outfitHistory.length - 1 && (
                  <button
                    onClick={onRemoveLastGarment}
                    className="p-2 rounded-full text-text-light/70 hover:bg-primary/10 hover:text-primary active:scale-90 transition-all"
                    aria-label={`'${layer.garment?.name}' ürününü kaldır`}
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                )}
            </div>
          </li>
        ))}
        {outfitHistory.length === 1 && (
            <p className="text-center text-sm text-gray-500 pt-8">Kombininiz burada görünecek. Başlamak için Gardırop sekmesinden bir ürün seçin.</p>
        )}
      </ul>
    </div>
  );
};

export default OutfitStack;
