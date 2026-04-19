import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, setDoc, updateDoc } from 'firebase/firestore';
import { MessageCircle, X, Send, User, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: any;
  isAdmin: boolean;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [messages, setMessages] = React.useState<Message[]>([]);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [user, setUser] = React.useState(auth.currentUser);

  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    if (!user || !isOpen) return;

    const q = query(
      collection(db, 'chatThreads', user.uid, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message)));
    });

    return () => unsubscribe();
  }, [user, isOpen]);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user) return;

    const threadRef = doc(db, 'chatThreads', user.uid);
    const msgData = {
      senderId: user.uid,
      senderName: user.displayName || 'Guest User',
      text: message.trim(),
      createdAt: serverTimestamp(),
      isAdmin: false
    };

    try {
      // Update or create thread metadata
      await setDoc(threadRef, {
        userId: user.uid,
        userName: user.displayName || 'Guest User',
        lastMessage: message.trim(),
        lastMessageAt: serverTimestamp(),
        status: 'active',
        unreadCount: 0 // In a real app, you'd increment this for the admin
      }, { merge: true });

      // Add actual message
      await addDoc(collection(db, 'chatThreads', user.uid, 'messages'), msgData);
      setMessage('');
    } catch (err) {
      console.error("Chat error:", err);
    }
  };

  if (!user) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-switch-blue text-white rounded-full shadow-2xl shadow-switch-blue/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-[200]"
      >
        <MessageCircle size={28} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 100 }}
            className="fixed bottom-24 right-6 w-[400px] h-[600px] bg-white rounded-[32px] shadow-2xl z-[201] flex flex-col overflow-hidden border-2 border-switch-dark/5"
          >
            {/* Header */}
            <div className="p-6 bg-switch-dark text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-switch-blue rounded-full flex items-center justify-center">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase tracking-tighter">Mod Support</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">System Online</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50"
            >
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center gap-4 text-gray-400">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <MessageCircle size={32} />
                  </div>
                  <div className="max-w-[200px]">
                    <p className="text-xs font-black uppercase tracking-widest">Protocol Initialized</p>
                    <p className="text-[10px] font-bold mt-1 opacity-60">Send a message to start a private session with our mod team.</p>
                  </div>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <motion.div
                    initial={{ opacity: 0, x: msg.isAdmin ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={msg.id || i}
                    className={cn(
                      "flex flex-col gap-1 max-w-[80%]",
                      msg.isAdmin ? "mr-auto items-start" : "ml-auto items-end"
                    )}
                  >
                    <div className={cn(
                      "p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-sm",
                      msg.isAdmin 
                        ? "bg-white text-switch-dark border border-gray-100" 
                        : "bg-switch-blue text-white"
                    )}>
                      {msg.text}
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-widest opacity-30 px-1">
                      {msg.isAdmin ? 'MOD TEAM' : 'YOU'}
                    </span>
                  </motion.div>
                ))
              )}
            </div>

            {/* Input */}
            <form 
              onSubmit={handleSend}
              className="p-6 bg-white border-t border-gray-100 flex gap-2"
            >
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Transmission details..."
                className="flex-1 bg-gray-100 rounded-2xl px-5 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-switch-blue/20 transition-all"
              />
              <button
                type="submit"
                className="w-12 h-12 bg-switch-dark text-white rounded-2xl flex items-center justify-center hover:bg-switch-blue transition-all disabled:opacity-50 active:scale-95"
                disabled={!message.trim()}
              >
                <Send size={20} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
