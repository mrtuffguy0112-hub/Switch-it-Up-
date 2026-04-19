import React from 'react';
import { db, auth } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { Send, User, MessageCircle, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

interface ChatThread {
  userId: string;
  userName: string;
  lastMessage: string;
  lastMessageAt: any;
  status: string;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: any;
  isAdmin: boolean;
}

export function AdminChatManager() {
  const [threads, setThreads] = React.useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [reply, setReply] = React.useState('');
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const q = query(collection(db, 'chatThreads'), orderBy('lastMessageAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setThreads(snapshot.docs.map(doc => ({ ...doc.data() } as ChatThread)));
    });
    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    if (!activeThreadId) return;
    const q = query(
      collection(db, 'chatThreads', activeThreadId, 'messages'),
      orderBy('createdAt', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message)));
    });
    return () => unsubscribe();
  }, [activeThreadId]);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!reply.trim() || !activeThreadId || !user) return;

    try {
      await addDoc(collection(db, 'chatThreads', activeThreadId, 'messages'), {
        senderId: user.uid,
        senderName: 'Admin Team',
        text: reply.trim(),
        createdAt: serverTimestamp(),
        isAdmin: true
      });

      await updateDoc(doc(db, 'chatThreads', activeThreadId), {
        lastMessage: reply.trim(),
        lastMessageAt: serverTimestamp()
      });

      setReply('');
    } catch (err) {
      console.error("Admin send error:", err);
    }
  };

  return (
    <div className="flex h-full border-2 border-switch-dark overflow-hidden rounded-3xl">
      {/* Thread List */}
      <div className="w-80 border-r-2 border-switch-dark bg-gray-50 flex flex-col">
        <div className="p-6 border-b border-switch-dark/10 bg-white">
          <h3 className="text-xs font-black uppercase tracking-widest text-switch-dark">Active Sessions</h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          {threads.length === 0 ? (
            <div className="p-10 text-center text-gray-300 italic text-[10px] font-bold uppercase tracking-widest opacity-50">
              No active transmissions
            </div>
          ) : (
            threads.map((thread) => (
              <button
                key={thread.userId}
                onClick={() => setActiveThreadId(thread.userId)}
                className={cn(
                  "w-full p-6 text-left border-b border-switch-dark/5 transition-all hover:bg-white flex flex-col gap-2",
                  activeThreadId === thread.userId ? "bg-white border-l-4 border-l-switch-blue" : "opacity-70"
                )}
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-tighter text-switch-blue">{thread.userName}</span>
                  <span className="text-[8px] font-bold opacity-30 uppercase tracking-widest">
                    {thread.lastMessageAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs font-medium truncate opacity-60 italic">"{thread.lastMessage}"</p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {activeThreadId ? (
          <>
            <div className="p-6 border-b border-switch-dark/10 flex justify-between items-center">
              <div>
                <span className="text-[8px] font-black uppercase tracking-widest opacity-30">Channel Active</span>
                <h4 className="text-lg font-black uppercase italic tracking-tighter">
                  SESSION: {threads.find(t => t.userId === activeThreadId)?.userName}
                </h4>
              </div>
            </div>
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-8 space-y-6 bg-gray-50/30"
            >
              {messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={cn(
                    "flex flex-col gap-2 max-w-[70%]",
                    msg.isAdmin ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div className={cn(
                    "p-5 rounded-2xl text-sm font-medium leading-relaxed",
                    msg.isAdmin ? "bg-switch-dark text-white" : "bg-white border-2 border-gray-100 text-switch-dark"
                  )}>
                    {msg.text}
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-widest opacity-30">
                    {msg.isAdmin ? 'REPLYING AS MOD' : 'USER TRANSMISSION'}
                  </span>
                </div>
              ))}
            </div>
            <form onSubmit={handleSend} className="p-6 border-t border-switch-dark/10 flex gap-4 bg-white">
              <input
                type="text"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Compose reply..."
                className="flex-1 bg-gray-100 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-switch-blue/20 transition-all border-none"
              />
              <button
                type="submit"
                disabled={!reply.trim()}
                className="bg-switch-dark text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-switch-blue transition-all disabled:opacity-50"
              >
                Send Response
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-300 italic uppercase tracking-[0.4em] text-[10px] font-black gap-4 opacity-30">
            <MessageCircle size={64} className="opacity-10" />
            Select a session to begin protocol
          </div>
        )}
      </div>
    </div>
  );
}
