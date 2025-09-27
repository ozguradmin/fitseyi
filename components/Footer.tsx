/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { HomeIcon, WardrobeIcon, ProfileIcon } from './icons';

const Footer: React.FC = () => {
  return (
    <footer className="sticky bottom-0 bg-background-light/80 backdrop-blur-sm z-30 border-t border-subtle-light">
      <nav className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-around items-center h-20">
          {/* Home Tab (Active) */}
          <a href="#" className="flex flex-col items-center justify-center gap-1 text-primary">
            <div className="p-2 rounded-full bg-primary/20">
              <HomeIcon className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold">Ana Sayfa</span>
          </a>

          {/* Wardrobe Tab (Inactive) */}
          <a href="#" className="flex flex-col items-center justify-center gap-1 text-text-light/70 hover:text-primary transition-colors">
            <div className="p-2">
              <WardrobeIcon className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium">Gardırop</span>
          </a>

          {/* Profile Tab (Inactive) */}
          <a href="#" className="flex flex-col items-center justify-center gap-1 text-text-light/70 hover:text-primary transition-colors">
            <div className="p-2">
              <ProfileIcon className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium">Profil</span>
          </a>
        </div>
      </nav>
    </footer>
  );
};

export default Footer;
