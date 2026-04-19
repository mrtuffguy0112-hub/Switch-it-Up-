import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { X, Package, Clock, ShoppingBag } from 'lucide-react';
import { cn } from '../lib/utils';

interface Order {
  id: string;
  total: number;
  status: string;
  createdAt: any;
  items: any[];
}

interface UserOrdersProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserOrders({ isOpen, onClose }: UserOrdersProps) {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);
  const user = auth.currentUser;

  React.useEffect(() => {
    if (!isOpen || !user) return;
    
    setLoading(true);
    const q = query(
      collection(db, 'orders'), 
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching user orders:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isOpen, user]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[150]"
          />
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white z-[151] shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b-2 border-switch-blue flex justify-between items-center bg-gray-50">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-switch-blue">Member Access</span>
                <h2 className="text-2xl font-display uppercase italic tracking-tighter flex items-center gap-2">
                  <ShoppingBag size={24} />
                  Order History
                </h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loading ? (
                <div className="h-full flex items-center justify-center opacity-20">
                  <div className="w-12 h-12 border-4 border-switch-blue border-t-transparent rounded-full animate-spin" />
                </div>
              ) : orders.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center gap-4 text-gray-400">
                  <Package size={64} strokeWidth={1} />
                  <div>
                    <p className="font-display uppercase tracking-widest text-lg">No Transmissions Found</p>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-50">You haven't placed any orders yet.</p>
                  </div>
                  <button 
                    onClick={onClose}
                    className="px-8 py-3 bg-switch-dark text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-switch-blue transition-all"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                orders.map((order) => (
                  <motion.div 
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 rounded-2xl p-6 border-2 border-transparent hover:border-switch-blue transition-all group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Order ID</span>
                        <span className="font-mono text-xs font-bold">#{order.id.slice(0, 12)}</span>
                      </div>
                      <div className="text-right">
                        <span className={cn(
                          "px-3 py-1 rounded text-[8px] font-black uppercase tracking-widest text-white shadow-sm",
                          order.status === 'delivered' ? "bg-green-500" : 
                          order.status === 'processing' ? "bg-switch-blue" :
                          order.status === 'shipped' ? "bg-purple-500" :
                          "bg-switch-dark"
                        )}>
                          {order.status}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tighter">
                          <span className="opacity-60">{item.name}</span>
                          <span>${item.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex justify-between items-end">
                      <div className="flex flex-col">
                         <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Logged On</span>
                         <span className="text-[10px] font-bold">{order.createdAt?.toDate().toLocaleDateString() || 'Pending...'}</span>
                      </div>
                      <div className="text-right">
                         <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block">Total Paid</span>
                         <span className="text-xl font-display text-switch-blue italic leading-none">${order.total?.toFixed(2)}</span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            <div className="p-6 bg-gray-50 border-t flex items-center justify-between">
              <div className="flex items-center gap-2 opacity-30">
                <Clock size={14} />
                <span className="text-[8px] font-black uppercase tracking-widest">Auto-Sync Active</span>
              </div>
              <button className="text-[10px] font-black uppercase tracking-widest text-switch-blue hover:text-switch-red transition-colors">
                Support Ticket
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
