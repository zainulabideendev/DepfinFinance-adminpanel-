"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { FirebaseError } from "firebase/app";
import { auth, firestore } from "@/lib/firebase";

type AuthContextValue = {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

class AdminCheckError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminCheckError";
  }
}

function isPermissionDenied(err: unknown): boolean {
  return err instanceof FirebaseError && err.code === "permission-denied";
}

function isAdminRole(value: unknown): boolean {
  return String(value ?? "").trim().toLowerCase() === "admin";
}

// An account may sign in only if its "users" document has role === "admin".
// Regular customers (role !== "admin", or no role) are rejected.
async function checkIsAdmin(user: User): Promise<boolean> {
  let permissionDenied = false;
  let foundDoc = false;

  // Primary: users doc id should match the Firebase Auth uid.
  try {
    const byId = await getDoc(doc(firestore, "users", user.uid));
    if (byId.exists()) {
      foundDoc = true;
      if (isAdminRole(byId.data()?.role)) return true;
    }
  } catch (err) {
    if (isPermissionDenied(err)) permissionDenied = true;
  }

  // Fallback: search by uid field.
  try {
    const byUid = await getDocs(
      query(collection(firestore, "users"), where("uid", "==", user.uid))
    );
    if (!byUid.empty) {
      foundDoc = true;
      if (byUid.docs.some((d) => isAdminRole(d.data()?.role))) return true;
    }
  } catch (err) {
    if (isPermissionDenied(err)) permissionDenied = true;
  }

  // Fallback: search by email.
  if (user.email) {
    try {
      const byEmail = await getDocs(
        query(collection(firestore, "users"), where("email", "==", user.email))
      );
      if (!byEmail.empty) {
        foundDoc = true;
        if (byEmail.docs.some((d) => isAdminRole(d.data()?.role))) return true;
      }
    } catch (err) {
      if (isPermissionDenied(err)) permissionDenied = true;
    }
  }

  if (permissionDenied && !foundDoc) {
    throw new AdminCheckError(
      "Cannot read the users collection. Update Firestore rules so signed-in users can read their own users document."
    );
  }

  return false;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        try {
          const admin = await checkIsAdmin(u);
          if (admin) {
            setUser(u);
            setIsAdmin(true);
          } else {
            await signOut(auth);
            setUser(null);
            setIsAdmin(false);
          }
        } catch {
          await signOut(auth);
          setUser(null);
          setIsAdmin(false);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);

    try {
      const admin = await checkIsAdmin(cred.user);
      if (!admin) {
        await signOut(auth);
        throw new AdminCheckError(
          `Signed in as ${cred.user.email}, but this account does not have the "admin" role. ` +
            `Set role: "admin" on the users document (uid "${cred.user.uid}").`
        );
      }
    } catch (err) {
      await signOut(auth);
      throw err;
    }

    setUser(cred.user);
    setIsAdmin(true);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
