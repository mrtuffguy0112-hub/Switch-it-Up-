import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, LogIn, UserPlus, Mail, Lock, User, AtSign, LayoutDashboard } from 'lucide-react';
import { loginWithEmail, signUpWithEmail, signInWithGoogle } from '../lib/firebase';
import { cn } from '../lib/utils';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = React.useState<'login' | 'register'>('login');
  const [authMethod, setAuthMethod] = React.useState<'email' | 'username'>('email');
  const [identifier, setIdentifier] = React.useState(''); // Can be email or username
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const emailToUse = authMethod === 'email' 
      ? identifier 
      : `${identifier.toLowerCase()}@switchitup.local`;

    try {
      if (mode === 'login') {
        await loginWithEmail(emailToUse, password);
      } else {
        await signUpWithEmail(emailToUse, password, name || identifier);
      }
      onClose();
    } catch (err: any) {
      if (err.message?.includes('auth/invalid-email')) {
        setError('Please enter a valid format');
      } else if (err.message?.includes('auth/operation-not-allowed')) {
        setError('Email/Password login is not enabled in Firebase Console. Please enable it under Authentication > Sign-in method.');
      } else if (err.message?.includes('auth/weak-password')) {
        setError('Password is too weak. Must be at least 6 characters.');
      } else {
        setError(err.message || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Google sign in failed');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-[32px] overflow-hidden shadow-2xl z-[201] p-8"
          >
            <button 
              onClick={onClose}
              className="absolute right-6 top-6 p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-900 transition-colors"
            >
              <X size={24} />
            </button>

            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-switch-red" />
                  <div className="w-8 h-8 rounded-lg bg-switch-blue" />
                </div>
                <h2 className="text-4xl font-display uppercase tracking-widest text-switch-dark">
                  {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-sm text-gray-400 font-medium">
                  {mode === 'login' 
                    ? 'Enter your credentials to access your gear.' 
                    : 'Join the professional handheld marketplace.'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex bg-gray-100 p-1 rounded-xl mb-2">
                  <button 
                    type="button"
                    onClick={() => setAuthMethod('email')}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                      authMethod === 'email' ? "bg-white text-switch-dark shadow-sm" : "text-gray-400"
                    )}
                  >
                    Email
                  </button>
                  <button 
                    type="button"
                    onClick={() => setAuthMethod('username')}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                      authMethod === 'username' ? "bg-white text-switch-dark shadow-sm" : "text-gray-400"
                    )}
                  >
                    Username
                  </button>
                </div>

                {mode === 'register' && (
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Display Name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-gray-50 border-2 border-transparent focus:border-switch-blue rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-bold text-sm"
                    />
                  </div>
                )}
                
                <div className="relative">
                  {authMethod === 'email' ? (
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  ) : (
                    <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  )}
                  <input
                    type={authMethod === 'email' ? 'email' : 'text'}
                    placeholder={authMethod === 'email' ? 'Email Address' : 'Unique Username'}
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-switch-blue rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-bold text-sm"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="password"
                    placeholder="Password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-switch-blue rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-bold text-sm"
                  />
                </div>

                {error && (
                  <p className="text-switch-red text-[10px] font-black uppercase tracking-widest text-center">
                    {error}
                  </p>
                )}

                <button 
                  disabled={loading}
                  className="bg-switch-dark text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-switch-blue transition-all active:scale-95 shadow-xl shadow-black/10 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : mode === 'login' ? 'Login' : 'Sign Up'}
                </button>
              </form>

              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Or Continue With</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>

                <button 
                  onClick={handleGoogleSignIn}
                  className="flex items-center justify-center gap-3 bg-white border-2 border-gray-100 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:border-switch-red transition-all active:scale-95"
                >
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                  Google Console
                </button>

                <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  {mode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
                  <button 
                    onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                    className="text-switch-blue hover:text-switch-red transition-colors"
                  >
                    {mode === 'login' ? 'Join Now' : 'Login Here'}
                  </button>
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
