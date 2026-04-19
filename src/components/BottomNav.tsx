import React from 'react';
import { motion } from 'motion/react';
import { Newspaper, ShoppingBag, Image as ImageIcon, Gamepad2, Settings, Power } from 'lucide-react';
import { cn } from '../lib/utils';

const NAV_ITEMS = [
  { icon: Newspaper, label: 'News', color: 'bg-red-500' },
  { icon: ShoppingBag, label: 'eShop', color: 'bg-orange-500' },
  { icon: ImageIcon, label: 'Album', color: 'bg-blue-500' },
  { icon: Gamepad2, label: 'Controllers', color: 'bg-gray-500' },
  { icon: Settings, label: 'Settings', color: 'bg-gray-500' },
  { icon: Power, label: 'Sleep Mode', color: 'bg-gray-500' },
];

export function BottomNav() {
  return (
    <footer className="mt-auto px-10 py-8">
      <div className="h-[1px] bg-gray-300 w-full mb-8" />
      <div className="flex justify-center items-center gap-6">
        {NAV_ITEMS.map((item, index) => (
          <motion.button
            key={item.label}
            whileHover={{ scale: 1.15, y: -5 }}
            whileTap={{ scale: 0.95 }}
            className="group flex flex-col items-center gap-2 outline-none"
          >
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center transition-shadow",
              "bg-white border-2 border-gray-200 group-hover:border-switch-blue group-focus:border-switch-blue shadow-sm group-hover:shadow-md"
            )}>
              <item.icon size={24} className="text-gray-600 group-hover:text-switch-blue" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">
              {item.label}
            </span>
          </motion.button>
        ))}
      </div>
    </footer>
  );
}
