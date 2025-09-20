import React, { createContext, useContext, useEffect, useState } from "react";
import { getAuth, getFirestore } from "@/lib/firebase";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";

type User = { id: string; name: string; role?: string } | null;

type AuthContext = {
  user: User;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role?: string,
    remember?: boolean,
  ) => Promise<void>;
  logout: () => Promise<void>;
};

const ctx = createContext<AuthContext | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();
    let unsubDoc: (() => void) | null = null;
    
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        if (unsubDoc) unsubDoc();
        setUser(null);
        setToken(null);
        setLoading(false);
        return;
      }
      
      const idToken = await fbUser.getIdToken();
      setToken(idToken);
      
      // Live-sync role and profile
      if (unsubDoc) unsubDoc();
      unsubDoc = (await import("firebase/firestore")).onSnapshot(
        doc(db, "users", fbUser.uid),
        (snap) => {
          const data = snap.exists() ? (snap.data() as any) : {};
          setUser({
            id: fbUser.uid,
            name: fbUser.displayName || fbUser.email || "",
            role: data.role as string | undefined,
          });
          setLoading(false);
        },
        () => setLoading(false),
      );
    });
    
    return () => {
      unsub();
      if (unsubDoc) unsubDoc();
    };
  }, []);

  async function login(email: string, password: string, remember = true) {
    const auth = getAuth();
    await setPersistence(
      auth,
      remember ? browserLocalPersistence : browserSessionPersistence,
    );
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function register(
    name: string,
    email: string,
    password: string,
    role?: string,
    remember = true,
  ) {
    const auth = getAuth();
    const db = getFirestore();
    await setPersistence(
      auth,
      remember ? browserLocalPersistence : browserSessionPersistence,
    );
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    try {
      if (name) await updateProfile(cred.user, { displayName: name });
    } catch (e) {
      console.warn("updateProfile failed", e);
    }
    try {
      await setDoc(
        doc(db, "users", cred.user.uid),
        {
          uid: cred.user.uid,
          name: name || cred.user.displayName || "",
          email: cred.user.email,
          role: role || "student",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
    } catch (e) {
      console.warn("setDoc profile failed (account still created)", e);
    }
  }

  async function logout() {
    const auth = getAuth();
    await signOut(auth);
    setToken(null);
    setUser(null);
  }

  return (
    <ctx.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </ctx.Provider>
  );
}

export function useAuth() {
  const v = useContext(ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}