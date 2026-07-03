"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { FirebaseError } from "firebase/app";
import { createSecondaryAuth, firestore } from "@/lib/firebase";

export default function Page() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const reset = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setConfirm("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    // Use a secondary auth instance so creating the account does not sign
    // out the current admin.
    const { auth: secondaryAuth, cleanup } = createSecondaryAuth();
    try {
      const cred = await createUserWithEmailAndPassword(
        secondaryAuth,
        email.trim(),
        password
      );

      await setDoc(doc(firestore, "users", cred.user.uid), {
        uid: cred.user.uid,
        email: email.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        role: "admin",
        created_at: serverTimestamp(),
      });

      await signOut(secondaryAuth);
      setSuccess(`Admin "${email.trim()}" created successfully.`);
      reset();
    } catch (err) {
      if (err instanceof FirebaseError) {
        if (err.code === "auth/email-already-in-use") {
          setError("An account with this email already exists.");
        } else if (err.code === "auth/invalid-email") {
          setError("Please enter a valid email address.");
        } else if (err.code === "auth/weak-password") {
          setError("Password is too weak. Use at least 6 characters.");
        } else {
          setError(err.message);
        }
      } else {
        setError("Could not create admin. Please try again.");
      }
    } finally {
      await cleanup();
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <section className="flex items-center justify-between bg-slate-800 px-8 py-6">
        <h1 className="text-sm font-semibold uppercase tracking-widest text-white">
          Add New Admin
        </h1>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-400 text-xs font-bold text-white">
          <span>DF</span>
        </div>
      </section>

      <section className="px-8 py-8">
        <div className="max-w-xl rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <h2 className="mb-1 text-base font-bold text-slate-800">
            Create Admin Account
          </h2>
          <p className="mb-6 text-xs text-slate-400">
            The new user will be able to sign in to this admin panel.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                placeholder="admin@depfin.com"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
                {error}
              </p>
            )}
            {success && (
              <p className="rounded-md bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-600">
                {success}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Creating…" : "Create Admin"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
