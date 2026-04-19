import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Battery, Wifi, User, ShoppingBag, LogOut, LogIn, ShieldCheck } from 'lucide-react';
import { auth, logout, checkIfAdmin } from '../lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { cn } from '../lib/utils';

interface HeaderProps {
  cartCount: number;
  onCartClick: () => void;
  onLoginClick: () => void;
  onAdminClick: () => void;
  onOrdersClick: () => void;
}

export function Header({ cartCount, onCartClick, onLoginClick, onAdminClick, onOrdersClick }: HeaderProps) {
  const [time, setTime] = React.useState(new Date());
  const [user, setUser] = React.useState<FirebaseUser | null>(null);
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const adminStatus = await checkIfAdmin(u.uid);
        setIsAdmin(adminStatus);
      } else {
        setIsAdmin(false);
      }
    });
    return () => {
      clearInterval(timer);
      unsubscribe();
    };
  }, []);

  return (
    <header className="sticky top-0 z-[100] glass-morphism border-b border-switch-dark/5 flex justify-between items-center px-6 md:px-10 py-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => user ? logout() : onLoginClick()}
            className="relative group shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-switch-dark flex items-center justify-center text-white shadow-lg overflow-hidden group-hover:bg-switch-red transition-colors">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
              ) : (
                <User size={20} />
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 {user ? <LogOut size={16} /> : <LogIn size={16} />}
              </div>
            </div>
          </button>

          {!user && (
            <button 
              onClick={onLoginClick}
              className="hidden lg:flex flex-col group cursor-pointer text-left"
            >
              <span className="font-black text-sm uppercase tracking-tighter text-switch-dark group-hover:text-switch-blue transition-colors">Switch It Up</span>
              <span className="text-[8px] font-bold uppercase tracking-[0.2em] opacity-30 italic">Guest Mode</span>
            </button>
          )}

          {user && (
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="font-black text-sm uppercase tracking-tighter truncate max-w-[120px]">
                   {user?.displayName || "Member"}
                </span>
                <div className="flex items-center gap-1.5">
                  <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", user ? "bg-green-500" : "bg-switch-red")} />
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                     {user ? "System Active" : "Logged Out"}
                  </span>
                </div>
              </div>
              <button 
                onClick={onOrdersClick}
                className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-switch-blue hover:text-white rounded-lg transition-all"
                title="View Orders"
              >
                <ShoppingBag size={14} />
                <span className="text-[9px] font-black uppercase tracking-widest">My Orders</span>
              </button>
            </div>
          )}
        </div>

        {isAdmin && (
          <button 
            onClick={onAdminClick}
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-switch-dark text-white rounded-lg group hover:bg-switch-red transition-all shadow-lg"
          >
            <ShieldCheck size={14} className="group-hover:animate-bounce" />
            <span className="text-[10px] font-black uppercase tracking-widest">Admin Dashboard</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-6 font-black text-[10px] uppercase tracking-widest opacity-40">
        <button 
          onClick={onCartClick}
          className="relative group pointer-events-auto hover:opacity-100 transition-opacity"
        >
          <ShoppingBag size={20} className="text-switch-dark group-hover:text-switch-blue transition-colors" />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-switch-red text-white w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black border-2 border-white animate-in zoom-in-50 duration-300">
              {cartCount}
            </span>
          )}
        </button>

        <div className="hidden sm:flex items-center gap-1">
          <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div className="flex items-center gap-4">
          <Wifi size={14} strokeWidth={3} />
          <div className="flex items-center gap-2">
            <span>100%</span>
            <div className="w-6 h-3 border-2 border-switch-dark/50 rounded-sm relative flex items-center px-0.5">
              <div className="w-full h-full bg-switch-dark rounded-[1px]" />
              <div className="absolute -right-1.5 top-0.5 w-1 h-1.5 bg-switch-dark/50 rounded-r-sm" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
