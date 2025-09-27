/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { ProfileIcon } from './icons';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 bg-background-light/80 backdrop-blur-sm z-30 border-b border-subtle-light">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <h1 className="text-xl font-bold tracking-tight text-text-light">
            Sanal Deneme Odası
          </h1>
          <button className="flex items-center justify-center w-10 h-10 rounded-full text-text-light hover:bg-primary/10 active:scale-95 transition-transform">
            <ProfileIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
