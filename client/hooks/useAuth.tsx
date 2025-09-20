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

  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setUser(null);
          setToken(null);
        return;
      }
      const idToken = await fbUser.getIdToken();
      setToken(idToken);
      let role: string | undefined = undefined;
      try {
        const snap = await getDoc(doc(db, "users", fbUser.uid));
        role =
          (snap.exists() ? (snap.data() as any).role : undefined) ?? undefined;
      } catch {}
      setUser({
        id: fbUser.uid,
        name: fbUser.displayName || fbUser.email || "",
        role,
      });
    });
    return () => unsub();
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
    <ctx.Provider value={{ user, token, login, register, logout }}>
      {children}
    </ctx.Provider>
  );
}

export function useAuth() {
  const v = useContext(ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
