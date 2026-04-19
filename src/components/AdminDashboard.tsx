import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { X, Package, Clock, ShieldCheck, User, MessageSquare, Trash2, Edit3, Check, RotateCcw } from 'lucide-react';
import { AdminChatManager } from './AdminChatManager';
import { cn } from '../lib/utils';

interface Order {
  id: string;
  userId: string;
  total: number;
  status: string;
  createdAt: any;
  items: any[];
  paymentMethod?: string;
  paymentInfo?: { last4: string };
}

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminDashboard({ isOpen, onClose }: AdminDashboardProps) {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [activeTab, setActiveTab] = React.useState<'orders' | 'chats'>('orders');
  const [editingOrderId, setEditingOrderId] = React.useState<string | null>(null);
  const [editStatus, setEditStatus] = React.useState('');

  React.useEffect(() => {
    if (!isOpen || activeTab !== 'orders') return;
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
    });
    return () => unsubscribe();
  }, [isOpen, activeTab]);

  const handleUpdateStatus = async (orderId: string) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: editStatus });
      setEditingOrderId(null);
    } catch (err) {
      console.error('Error updating order:', err);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to cancel (delete) this order? This action is irreversible.')) return;
    try {
      await deleteDoc(doc(db, 'orders', orderId));
    } catch (err) {
      console.error('Error canceling order:', err);
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
            className="fixed inset-0 bg-switch-dark/95 backdrop-blur-3xl z-[300]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-5xl bg-white z-[301] shadow-2xl flex flex-col font-mono"
          >
            <div className="p-8 border-b-2 border-switch-dark flex justify-between items-center bg-gray-50">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-switch-blue">
                  <ShieldCheck size={20} />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em]">Internal System</span>
                </div>
                <h2 className="text-4xl font-display uppercase italic tracking-tighter">
                  ADMIN <span className="text-switch-red">COMMAND</span> CENTER
                </h2>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex bg-gray-200 p-1 rounded-xl">
                  <button 
                    onClick={() => setActiveTab('orders')}
                    className={cn(
                      "px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                      activeTab === 'orders' ? "bg-white text-switch-dark shadow-sm" : "text-gray-500"
                    )}
                  >
                    <Package size={14} />
                    Orders
                  </button>
                  <button 
                    onClick={() => setActiveTab('chats')}
                    className={cn(
                      "px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                      activeTab === 'chats' ? "bg-white text-switch-dark shadow-sm" : "text-gray-500"
                    )}
                  >
                    <MessageSquare size={14} />
                    Messages
                  </button>
                </div>
                <button 
                  onClick={onClose}
                  className="p-4 hover:bg-switch-dark hover:text-white rounded-2xl transition-all border-2 border-switch-dark"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              {activeTab === 'orders' ? (
                <>
                  <div className="grid grid-cols-7 gap-4 mb-8 text-[11px] font-black uppercase tracking-widest text-gray-400 border-b pb-4">
                    <div className="col-span-1">Order ID</div>
                    <div className="col-span-1">Customer</div>
                    <div className="col-span-1 text-center">Units</div>
                    <div className="col-span-1 text-right">Total</div>
                    <div className="col-span-1 text-center">Payment</div>
                    <div className="col-span-1 text-center">Status</div>
                    <div className="col-span-1 text-right">Actions</div>
                  </div>

                  <div className="space-y-4">
                    {orders.length === 0 ? (
                      <div className="py-20 flex flex-col items-center justify-center gap-4 text-gray-300 italic opacity-50">
                        <Clock size={48} />
                        <p>No transmissions received yet...</p>
                      </div>
                    ) : (
                      orders.map((order) => (
                        <div 
                          key={order.id}
                          className="grid grid-cols-7 gap-4 p-6 bg-gray-50 rounded-2xl border-2 border-transparent hover:border-switch-blue transition-all group items-center"
                        >
                          <div className="col-span-1 font-bold text-xs truncate">
                            #{order.id.slice(0, 8)}
                          </div>
                          <div className="col-span-1 flex items-center gap-2">
                             <div className="w-6 h-6 rounded bg-switch-dark text-white flex items-center justify-center text-[10px]">
                               <User size={12} />
                             </div>
                             <span className="text-xs truncate">{order.userId.slice(0, 6)}...</span>
                          </div>
                          <div className="col-span-1 text-center font-bold text-xs">
                            {order.items?.length || 0}
                          </div>
                          <div className="col-span-1 text-right font-black text-switch-blue text-xs">
                            ${order.total?.toFixed(2)}
                          </div>
                          <div className="col-span-1 text-center flex flex-col items-center">
                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">
                              {order.paymentMethod || 'DIRECT'}
                            </span>
                            {order.paymentInfo?.last4 && (
                              <span className="text-[7px] font-mono text-gray-300 leading-none">
                                **** {order.paymentInfo.last4}
                              </span>
                            )}
                          </div>
                          <div className="col-span-1 text-center">
                            {editingOrderId === order.id ? (
                              <select 
                                value={editStatus}
                                onChange={(e) => setEditStatus(e.target.value)}
                                className="bg-white border text-[10px] font-bold p-1 rounded"
                              >
                                <option value="pending">PENDING</option>
                                <option value="processing">PROCESSING</option>
                                <option value="shipped">SHIPPED</option>
                                <option value="delivered">DELIVERED</option>
                                <option value="cancelled">CANCELLED</option>
                              </select>
                            ) : (
                              <span className="px-3 py-1 bg-switch-dark text-white text-[8px] font-black uppercase rounded tracking-widest group-hover:bg-switch-red transition-colors">
                                {order.status}
                              </span>
                            )}
                          </div>
                          <div className="col-span-1 text-right flex justify-end gap-2">
                            {editingOrderId === order.id ? (
                              <>
                                <button 
                                  onClick={() => handleUpdateStatus(order.id)}
                                  className="p-2 bg-switch-blue text-white rounded-lg hover:bg-switch-blue/80 transition-all"
                                  title="Save Changes"
                                >
                                  <Check size={14} />
                                </button>
                                <button 
                                  onClick={() => setEditingOrderId(null)}
                                  className="p-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-all"
                                  title="Cancel Edit"
                                >
                                  <RotateCcw size={14} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button 
                                  onClick={() => {
                                    setEditingOrderId(order.id);
                                    setEditStatus(order.status);
                                  }}
                                  className="p-2 text-gray-400 hover:text-switch-blue transition-colors"
                                  title="Edit Status"
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button 
                                  onClick={() => handleCancelOrder(order.id)}
                                  className="p-2 text-gray-400 hover:text-switch-red transition-colors"
                                  title="Cancel Order"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              ) : (
                <AdminChatManager />
              )}
            </div>

            {activeTab === 'orders' && (
              <div className="p-8 border-t bg-gray-50 flex justify-between items-center">
                 <div className="flex gap-4">
                   <div className="flex flex-col">
                     <span className="text-[8px] font-black opacity-30 uppercase tracking-widest">Active Orders</span>
                     <span className="text-xl font-display italic leading-none">{orders.length}</span>
                   </div>
                   <div className="w-px h-8 bg-gray-200" />
                   <div className="flex flex-col">
                     <span className="text-[8px] font-black opacity-30 uppercase tracking-widest">Revenue Today</span>
                     <span className="text-xl font-display italic leading-none text-switch-blue">
                       ${orders.reduce((sum, o) => sum + (o.total || 0), 0).toFixed(2)}
                     </span>
                   </div>
                 </div>
                 <button className="px-8 py-3 bg-switch-dark text-white rounded-xl font-black text-[10px] uppercase tracking-widest">
                   Export Logs
                 </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
