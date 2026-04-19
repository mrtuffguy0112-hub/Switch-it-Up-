import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PRODUCTS, Product } from './constants';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { ProductCard } from './components/ProductCard';
import { ShoppingCart, X, Trash2, ShoppingBag, CheckCircle2 } from 'lucide-react';
import { cn } from './lib/utils';
import confetti from 'canvas-confetti';

import { auth, db, placeOrder } from './lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { collection, query, onSnapshot, doc, addDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { AuthModal } from './components/AuthModal';
import { AdminDashboard } from './components/AdminDashboard';
import { ChatWidget } from './components/ChatWidget';
import { UserOrders } from './components/UserOrders';
import { EmbeddedPaymentForm } from './components/EmbeddedPaymentForm';

export default function App() {
  const [user, setUser] = React.useState<FirebaseUser | null>(null);
  const [cart, setCart] = React.useState<Product[]>([]);
  const [firestoreCartIds, setFirestoreCartIds] = React.useState<Record<number, string>>({}); 
  const [isCartOpen, setIsCartOpen] = React.useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
  const [isAdminOpen, setIsAdminOpen] = React.useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = React.useState(false);
  const [isPaymentStep, setIsPaymentStep] = React.useState(false);
  const [filter, setFilter] = React.useState<string>('Switch OLED');
  const [subFilter, setSubFilter] = React.useState<string>('Home');
  const [isOrderPlaced, setIsOrderPlaced] = React.useState(false);

  React.useEffect(() => {
    setSubFilter('Home');
  }, [filter]);

  // Handle Auth State
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  // Sync Cart with Firestore
  React.useEffect(() => {
    if (!user) {
      setCart([]);
      setFirestoreCartIds({});
      return;
    }

    const q = query(collection(db, 'users', user.uid, 'cart'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: Product[] = [];
      const ids: Record<number, string> = {};
      snapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        items.push({
          id: data.productId,
          name: data.name,
          price: data.price,
          image: data.image,
          category: 'Switch', 
          description: '',
          rating: 5
        } as Product);
        ids[index] = doc.id;
      });
      setCart(items);
      setFirestoreCartIds(ids);
    });

    return () => unsubscribe();
  }, [user]);

  const addToCart = async (product: Product) => {
    if (user) {
      try {
        await addDoc(collection(db, 'users', user.uid, 'cart'), {
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          addedAt: serverTimestamp()
        });
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#E60012', '#00A2E8', '#FFFFFF']
        });
      } catch (e) {
        console.error("Error adding to cart:", e);
      }
    } else {
      setCart(prev => [...prev, product]);
    }
  };

  const removeFromCart = async (index: number) => {
    if (user && firestoreCartIds[index]) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'cart', firestoreCartIds[index]));
      } catch (e) {
        console.error("Error removing from cart:", e);
      }
    } else {
      setCart(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    if (cart.length === 0) return;
    setIsPaymentStep(true);
  };

  const handlePaymentSuccess = async (paymentDetails: any) => {
    try {
      await placeOrder(user!.uid, cart, total, paymentDetails);
      setIsOrderPlaced(true);
      setIsPaymentStep(false);
      
      confetti({
        particleCount: 200,
        spread: 160,
        colors: ['#E60012', '#00A2E8', '#000000']
      });

      // Clear cart
      for (const key of Object.keys(firestoreCartIds)) {
        const idx = Number(key);
        await deleteDoc(doc(db, 'users', user!.uid, 'cart', firestoreCartIds[idx]));
      }
    } catch (e) {
      console.error("Order completion failed:", e);
    }
  };

  const categories = ['Switch OLED', 'Switch', 'Switch Lite'];
  
  const subCategories = React.useMemo(() => {
    const currentCategoryProducts = PRODUCTS.filter(p => p.category === filter);
    const subs = new Set(currentCategoryProducts.map(p => p.subCategory).filter(Boolean));
    const list = Array.from(subs);
    if (list.length === 0) return [];
    return ['Home', ...list];
  }, [filter]);

  const filteredProducts = PRODUCTS.filter(p => {
    const matchesCategory = p.category === filter;
    const matchesSub = subFilter === 'Home' || p.subCategory === subFilter;
    return matchesCategory && matchesSub;
  });
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="min-h-screen flex flex-col bg-switch-bg w-full relative">
      <Header 
        cartCount={cart.length} 
        onCartClick={() => setIsCartOpen(true)} 
        onLoginClick={() => setIsAuthModalOpen(true)}
        onAdminClick={() => setIsAdminOpen(true)}
        onOrdersClick={() => setIsOrdersOpen(true)}
      />

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />

      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />

      <UserOrders
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
      />

      <ChatWidget />

      <main className="flex-1 overflow-x-hidden">
        {/* Editorial Hero Section - Split Layout */}
        <section className="relative overflow-hidden md:h-[80vh] flex items-center bg-white border-b border-switch-dark/5">
          <div className="absolute left-0 top-0 bottom-0 w-1/2 bg-switch-blue/5 hidden lg:block" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center max-w-7xl mx-auto px-6 md:px-10 w-full py-20 lg:py-0">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col gap-6"
            >
              <div className="flex gap-2">
                <span className="bg-switch-red text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded shadow-lg shadow-switch-red/30">LATEST RELEASE</span>
                <span className="border border-switch-dark/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded bg-switch-bg/50">PLATINUM CHOICE</span>
              </div>
              <h1 className="font-display text-8xl md:text-[140px] uppercase leading-[0.8] tracking-tighter text-switch-dark">
                LEVEL <br />
                <span className="text-switch-blue italic ml-[-12px]">UP NOW</span>
              </h1>
              <p className="max-w-md text-sm md:text-lg text-switch-dark/60 font-medium leading-relaxed">
                Discover the next generation of portable gaming. From OLED consoles to record-breaking titles, we bring the best of Nintendo to your doorstep.
              </p>
              <div className="flex gap-4">
                <button className="bg-switch-dark text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-switch-blue transition-all active:scale-95 shadow-2xl shadow-black/20">
                  Shop New Mods
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative aspect-[4/3] flex items-center justify-center p-4"
            >
              <div className="absolute inset-0 bg-switch-blue opacity-5 blur-[120px] rounded-full" />
              <div className="relative w-full h-full overflow-hidden rounded-[40px] shadow-2xl rotate-3 border-4 border-white/50">
                <img 
                  src="https://picsum.photos/seed/nintendo/1200/900" 
                  className="w-full h-full object-cover" 
                  alt="Switch Hero"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-switch-dark/60 to-transparent" />
                <div className="absolute bottom-10 left-10 text-white flex flex-col gap-1">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Featured Experience</span>
                  <span className="text-3xl font-display uppercase tracking-widest">OLED MODEL</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Vibrant Feature Section */}
        <section className="bg-switch-red py-24 relative overflow-hidden">
          <div className="absolute right-[-10%] top-[-20%] w-[60%] aspect-square bg-switch-blue rounded-full opacity-20 blur-[150px]" />
          <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
            <h2 className="font-display text-white text-6xl md:text-8xl uppercase leading-none tracking-tight">
              THE VIBRANT <br />
              <span className="opacity-40">PALETTE</span>
            </h2>
            <div className="flex flex-col gap-6 max-w-sm">
              <p className="text-white font-medium opacity-80 leading-relaxed italic text-lg">
                "Experience gaming in a new light with colors that pop and gameplay that shines on every screen."
              </p>
              <div className="h-1 bg-white/20 w-1/2" />
              <span className="text-white font-black text-xs uppercase tracking-[0.2em] opacity-40">Verified Product Quality</span>
            </div>
          </div>
        </section>

        {/* Product Grid Area */}
        <section className="bg-switch-bg pt-20">
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-switch-blue">Collections</span>
                <h3 className="font-display text-5xl md:text-6xl text-switch-dark uppercase tracking-wide">
                  CHOOSE YOUR <span className="italic">WORLD</span>
                </h3>
              </div>
              
              <div className="flex flex-col items-end gap-4">
                <div className="flex flex-wrap items-center gap-2 p-1.5 glass-morphism rounded-2xl">
                  {categories.map((c) => (
                    <button
                      key={c}
                      onClick={() => setFilter(c)}
                      className={cn(
                        "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        filter === c 
                          ? "bg-switch-dark text-white shadow-xl" 
                          : "text-switch-dark/40 hover:text-switch-dark"
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>

                {subCategories.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-wrap items-center gap-2"
                  >
                    {subCategories.map((sc) => (
                      <button
                        key={sc}
                        onClick={() => setSubFilter(sc)}
                        className={cn(
                          "px-4 py-2 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] transition-all border",
                          subFilter === sc
                            ? "border-switch-blue text-switch-blue bg-switch-blue/5"
                            : "border-switch-dark/5 text-switch-dark/30 hover:text-switch-dark/60"
                        )}
                      >
                        {sc}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product, idx) => (
                  <ProductCard 
                    key={product.id}
                    product={product} 
                    onAddToCart={addToCart} 
                    index={idx}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-20 py-20 bg-switch-dark text-white overflow-hidden relative">
        <div className="absolute left-[-5%] top-1/2 -translate-y-1/2 text-[20vw] font-display uppercase tracking-tighter text-white/5 whitespace-nowrap select-none pointer-events-none">
          SWITCH IT UP SWITCH IT UP
        </div>
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col md:flex-row justify-between items-center gap-10 relative z-10">
           <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-switch-blue" />
                <div className="w-8 h-8 rounded-lg bg-switch-red" />
                <span className="font-display text-4xl uppercase ml-2 tracking-widest">NINTENDO</span>
              </div>
              <p className="max-w-xs text-xs font-medium opacity-40 leading-relaxed uppercase tracking-widest">
                Professional curated marketplace for the modern handheld gamer. Level up your setup with genuine products.
              </p>
           </div>

           <div className="flex gap-10">
              <div className="flex flex-col gap-4">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-30">Shop</span>
                <ul className="text-xs font-bold flex flex-col gap-2">
                  <li className="hover:text-switch-red cursor-pointer">Best Sellers</li>
                  <li className="hover:text-switch-blue cursor-pointer">New Arrivals</li>
                  <li className="hover:text-switch-red cursor-pointer">Pre-Owned</li>
                </ul>
              </div>
              <div className="flex flex-col gap-4">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-30">Support</span>
                <ul className="text-xs font-bold flex flex-col gap-2">
                  <li className="hover:text-switch-red cursor-pointer">Shipping</li>
                  <li className="hover:text-switch-blue cursor-pointer">Refunds</li>
                  <li className="hover:text-switch-red cursor-pointer">Privacy</li>
                </ul>
              </div>
           </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 md:px-10 mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
          <span className="text-[10px] font-black uppercase tracking-widest opacity-20">© 2026 SWITCH IT UP INC.</span>
          <div className="flex items-center gap-6">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-20 hover:opacity-100 cursor-pointer transition-opacity">Instagram</span>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-20 hover:opacity-100 cursor-pointer transition-opacity">Twitter</span>
          </div>
        </div>
      </footer>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-[101] shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b-4 border-switch-blue flex justify-between items-center">
                <h2 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-2">
                  <ShoppingCart size={24} className="text-switch-blue" />
                  Your Bag
                </h2>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-900 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {isOrderPlaced ? (
                  <div className="h-full flex flex-col items-center justify-center text-center gap-6 animate-in fade-in zoom-in-95 duration-500">
                    <div className="w-24 h-24 bg-switch-blue/10 rounded-full flex items-center justify-center text-switch-blue">
                      <CheckCircle2 size={48} />
                    </div>
                    <div className="flex flex-col gap-2">
                       <h3 className="text-2xl font-display uppercase italic tracking-widest text-switch-dark">TRANSMISSION RECEIVED</h3>
                       <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Order logged in the central console.</p>
                    </div>
                    
                    <div className="flex flex-col gap-3 w-full mt-4">
                      <a 
                        href="https://paypal.me/switchitup" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full bg-switch-blue text-white font-black py-4 rounded-xl shadow-lg hover:brightness-110 transition-all uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95"
                      >
                        Complete Payment via PayPal
                      </a>
                      <button 
                        onClick={() => {
                          setIsOrderPlaced(false);
                          setIsCartOpen(false);
                        }}
                        className="w-full bg-gray-100 text-gray-500 font-black py-3 rounded-xl hover:bg-gray-200 transition-all uppercase tracking-widest text-[10px]"
                      >
                        Explore More Mods
                      </button>
                    </div>
                  </div>
                ) : isPaymentStep ? (
                  <div className="h-full -mx-6 -my-6">
                    <EmbeddedPaymentForm 
                      total={total} 
                      onSuccess={handlePaymentSuccess} 
                      onCancel={() => setIsPaymentStep(false)} 
                    />
                  </div>
                ) : cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4">
                    <ShoppingBag size={64} opacity={0.3} />
                    <p className="font-bold uppercase tracking-widest text-sm">Your bag is empty</p>
                    <button 
                      onClick={() => setIsCartOpen(false)}
                      className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full font-black text-xs uppercase"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  cart.map((item, idx) => (
                    <motion.div 
                      key={`${item.id}-${idx}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex gap-4 items-center bg-gray-50 p-3 rounded-xl group border-2 border-transparent hover:border-switch-blue transition-all"
                    >
                      <img src={item.image} className="w-16 h-16 object-cover rounded-lg shadow-sm" alt={item.name} />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-sm truncate uppercase tracking-tighter">{item.name}</h4>
                        <p className="text-switch-blue font-bold text-sm">${item.price}</p>
                      </div>
                      <button 
                        onClick={() => removeFromCart(idx)}
                        className="p-2 text-gray-300 hover:text-switch-red transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>

              {cart.length > 0 && !isOrderPlaced && (
                <div className="p-6 bg-gray-50 border-t border-gray-200 space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-gray-500 uppercase text-xs tracking-widest">Subtotal</span>
                    <span className="font-black text-xl italic">${total.toFixed(2)}</span>
                  </div>
                  <button 
                    onClick={handleCheckout}
                    className="w-full bg-switch-blue hover:bg-switch-blue/90 text-white font-black py-4 rounded-xl shadow-lg shadow-switch-blue/20 transition-all uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
