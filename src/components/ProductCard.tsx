import React from 'react';
import { motion } from 'motion/react';
import { Product } from '../constants';
import { ShoppingCart, Star } from 'lucide-react';
import { cn } from '../lib/utils';
import confetti from 'canvas-confetti';

interface ProductCardProps {
  key?: string | number;
  product: Product;
  onAddToCart: (p: Product) => void;
  index: number;
}

export function ProductCard({ product, onAddToCart, index }: ProductCardProps) {
  const handlePurchase = () => {
    onAddToCart(product);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.8 },
      colors: ['#E60012', '#00A1E9', '#FFFFFF']
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative flex flex-col bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-black/[0.03]"
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        
        <div className="absolute top-4 left-4">
          <span className="glass-morphism px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-switch-dark">
            {product.category}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePurchase();
          }}
          className="absolute bottom-4 right-4 w-12 h-12 bg-switch-dark text-white rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all hover:bg-switch-red"
        >
          <ShoppingCart size={20} />
        </button>
      </div>

      <div className="p-6 flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-lg leading-tight text-switch-dark group-hover:text-switch-blue transition-colors truncate">
            {product.name}
          </h3>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star size={14} className="fill-yellow-500 text-yellow-500" />
            <span className="text-xs font-bold text-switch-dark/40">{product.rating}</span>
          </div>
          <span className="text-xl font-black italic text-switch-dark tracking-tighter">
            ${product.price}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
