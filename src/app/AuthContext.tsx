import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from './types';
import { auth, db, googleProvider, FIREBASE_ENABLED } from './firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signInWithRedirect, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { Capacitor } from '@capacitor/core';

interface AuthContextType {
  user: User | null;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!FIREBASE_ENABLED) return;
    let docUnsub: any = null;
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setUser(null);
        if (docUnsub) { try { docUnsub(); } catch {} }
        return;
      }
      const userRef = doc(db, 'users', fbUser.uid);
      const snap = await getDoc(userRef);
      let role: UserRole = 'STUDENT';
      let name = fbUser.displayName || fbUser.email || 'User';
      let avatar = fbUser.photoURL || undefined;
      if (snap.exists()) {
        const d = snap.data() as any;
        role = (d.role as UserRole) || 'STUDENT';
        name = d.name || name;
        avatar = d.avatarUrl || avatar;
      } else {
        await setDoc(userRef, { email: fbUser.email, name, role });
      }
      setUser({ id: fbUser.uid, email: fbUser.email || '', name, role, password: '', avatar });
      if (docUnsub) { try { docUnsub(); } catch {} }
      docUnsub = onSnapshot(userRef, (docSnap) => {
        const d = docSnap.data() as any;
        if (!d) return;
        setUser((prev) => prev ? {
          ...prev,
          name: d.name || prev.name,
          role: (d.role as UserRole) || prev.role,
          avatar: d.avatarUrl || prev.avatar,
        } : prev);
      });
    });
    return () => {
      if (docUnsub) { try { docUnsub(); } catch {} }
      unsub && unsub();
    };
  }, []);

  const loginWithEmail = async (email: string, password: string) => {
    if (!FIREBASE_ENABLED) throw new Error('Firebase is not configured. Add env vars.');
    await signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async () => {
    if (!FIREBASE_ENABLED) throw new Error('Firebase is not configured. Add env vars.');
    if (Capacitor.isNativePlatform()) {
      await signInWithRedirect(auth, googleProvider);
    } else {
      await signInWithPopup(auth, googleProvider);
    }
  };

  const logout = () => {
    if (FIREBASE_ENABLED) {
      signOut(auth).catch(() => {});
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginWithEmail, loginWithGoogle, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
