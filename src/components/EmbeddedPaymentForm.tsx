import React from 'react';
import { motion } from 'motion/react';
import { CreditCard, Lock, ShieldCheck, CheckCircle2, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface PaymentFormProps {
  total: number;
  onSuccess: (paymentDetails: any) => void;
  onCancel: () => void;
}

export function EmbeddedPaymentForm({ total, onSuccess, onCancel }: PaymentFormProps) {
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [cardNumber, setCardNumber] = React.useState('');
  
  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate encryption and processing steps
    let interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          onSuccess({ method: 'Credit Card', last4: cardNumber.slice(-4) });
          return 100;
        }
        return prev + 5;
      });
    }, 150);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  return (
    <div className="flex flex-col h-full font-mono">
      <div className="p-6 bg-switch-dark text-white rounded-t-2xl flex justify-between items-center border-b border-white/10">
        <div className="flex flex-col">
          <span className="text-[8px] font-black uppercase tracking-[0.4em] opacity-50">Secure Protocol</span>
          <h3 className="text-lg font-display uppercase italic tracking-widest flex items-center gap-2">
            <Lock size={16} className="text-switch-blue" />
            Payment Gateway
          </h3>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-black text-switch-blue block tracking-widest">ENCRYPTED</span>
          <ShieldCheck size={20} className="ml-auto text-green-500" />
        </div>
      </div>

      <div className="flex-1 p-8 bg-white overflow-y-auto">
        {isProcessing ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in duration-500">
            <div className="relative w-24 h-24">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-gray-100"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={251.2}
                  strokeDashoffset={251.2 - (251.2 * progress) / 100}
                  className="text-switch-blue transition-all duration-300"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-black">{progress}%</span>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-display uppercase tracking-widest italic">Securing Transmission</h4>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Performing P2P encryption & handshake...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handlePayment} className="space-y-6">
            <div className="p-4 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex justify-between items-center mb-8">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Statement Amount</span>
                <span className="text-2xl font-black italic text-switch-dark">${total.toFixed(2)}</span>
              </div>
              <div className="w-12 h-12 bg-white rounded-lg border-2 border-gray-100 flex items-center justify-center">
                <CreditCard size={24} className="text-gray-300" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="group">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">Cardholder Entity</label>
                <input 
                  required
                  type="text" 
                  placeholder="EX: SYSTEM ADM"
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-switch-blue outline-none p-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-all placeholder:opacity-30"
                />
              </div>

              <div className="group">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">Standard Card Number</label>
                <div className="relative">
                  <input 
                    required
                    type="text" 
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    maxLength={19}
                    placeholder="0000 0000 0000 0000"
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-switch-blue outline-none p-4 rounded-xl font-bold tracking-widest text-xs transition-all placeholder:opacity-30"
                  />
                  <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="group">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">Expiry</label>
                  <input 
                    required
                    type="text" 
                    placeholder="MM/YY"
                    maxLength={5}
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-switch-blue outline-none p-4 rounded-xl font-bold tracking-widest text-xs transition-all placeholder:opacity-30"
                  />
                </div>
                <div className="group">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">CVC Code</label>
                  <input 
                    required
                    type="password" 
                    placeholder="***"
                    maxLength={3}
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-switch-blue outline-none p-4 rounded-xl font-bold tracking-widest text-xs transition-all placeholder:opacity-30"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex flex-col gap-3">
              <button 
                type="submit"
                className="w-full bg-switch-dark text-white font-black py-4 rounded-xl shadow-lg hover:bg-switch-blue transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-3 active:scale-95 text-xs"
              >
                Authenticate Payment
                <ChevronRight size={16} />
              </button>
              <button 
                type="button"
                onClick={onCancel}
                className="w-full text-gray-400 hover:text-switch-red font-black py-2 text-[10px] uppercase tracking-widest transition-colors"
              >
                Return to Transmissions
              </button>
            </div>
            
            <div className="flex items-center justify-center gap-2 opacity-30 mt-4">
              <Lock size={10} />
              <span className="text-[8px] font-black uppercase tracking-widest">PCI-DSS COMPLIANT HUB</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
