import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  onAuthStateChanged, 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  serverTimestamp,
  where,
  orderBy
} from 'firebase/firestore';

// ... (rest of imports remain same)
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

export const signUpWithEmail = async (email: string, pass: string, name: string) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(res.user, { displayName: name });
    
    await setDoc(doc(db, 'users', res.user.uid), {
      displayName: name,
      email: email,
      updatedAt: serverTimestamp(),
    });
    return res.user;
  } catch (error) {
    console.error("Sign up error:", error);
    throw error;
  }
};

export const loginWithEmail = async (email: string, pass: string) => {
  try {
    const res = await signInWithEmailAndPassword(auth, email, pass);
    return res.user;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const checkIfAdmin = async (uid: string) => {
  try {
    const adminDoc = await getDoc(doc(db, 'admins', uid));
    return adminDoc.exists();
  } catch (e) {
    return false;
  }
};

export const placeOrder = async (userId: string, items: any[], total: number, paymentDetails?: any) => {
  try {
    await addDoc(collection(db, 'orders'), {
      userId,
      items,
      total,
      status: 'pending',
      createdAt: serverTimestamp(),
      paymentMethod: paymentDetails?.method || 'Direct',
      paymentInfo: paymentDetails?.last4 ? { last4: paymentDetails.last4 } : null
    });
  } catch (e) {
    handleFirestoreError(e, 'create', 'orders');
  }
};

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Create/update user profile
    await setDoc(doc(db, 'users', user.uid), {
      displayName: user.displayName,
      photoURL: user.photoURL,
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    return user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

export const logout = () => auth.signOut();

export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId: string;
    email: string;
    emailVerified: boolean;
    isAnonymous: boolean;
    providerInfo: { providerId: string; displayName: string; email: string; }[];
  }
}

export const handleFirestoreError = (error: any, operationType: FirestoreErrorInfo['operationType'], path: string | null = null) => {
  if (error?.code === 'permission-denied' || error?.message?.includes('Missing or insufficient permissions')) {
    const user = auth.currentUser;
    const errorInfo: FirestoreErrorInfo = {
      error: error.message || 'Permission denied',
      operationType,
      path,
      authInfo: {
        userId: user?.uid || 'anonymous',
        email: user?.email || '',
        emailVerified: user?.emailVerified || false,
        isAnonymous: !user,
        providerInfo: user?.providerData.map(p => ({
          providerId: p.providerId,
          displayName: p.displayName || '',
          email: p.email || ''
        })) || []
      }
    };
    throw new Error(JSON.stringify(errorInfo));
  }
  throw error;
};
