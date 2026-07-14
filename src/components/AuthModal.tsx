import React, { useState } from "react";
import { Mail, Lock, X, AlertCircle, Sparkles, Check, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider 
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db as firestoreDb, OperationType, handleFirestoreError } from "../firebase";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: { email: string; isAdmin: boolean }) => void;
}

export function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      if (!user || !user.email) {
        throw new Error("Could not retrieve user email from Google Account.");
      }

      // Check / Create profile in Firestore
      const userRef = doc(firestoreDb, "users", user.uid);
      let isAdmin = user.email.trim().toLowerCase() === "indiafff568@gmail.com";
      
      try {
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          isAdmin = userDoc.data().isAdmin || isAdmin;
        } else {
          // Create new record
          await setDoc(userRef, {
            email: user.email.toLowerCase(),
            isAdmin: isAdmin
          });
        }
      } catch (err) {
        // If firestore read/write fails, fallback to standard email matching
        console.warn("Firestore user sync failed: ", err);
      }

      setSuccess("Successfully authenticated via Google!");
      setTimeout(() => {
        onAuthSuccess({ email: user.email!, isAdmin });
        onClose();
        resetForm();
        setLoading(false);
      }, 1200);
    } catch (err: any) {
      setLoading(false);
      if (err.code === "auth/popup-blocked") {
        setError("Sign-in popup was blocked by your browser. Please enable popups.");
      } else if (err.code === "auth/cancelled-popup-request") {
        setError("Sign-in was cancelled.");
      } else {
        setError(err.message || "Failed to sign in with Google.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    if (mode === "signup") {
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        setLoading(false);
        return;
      }

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const user = userCredential.user;
        const isAdmin = email.trim().toLowerCase() === "indiafff568@gmail.com";

        // Save profile in Firestore
        const userRef = doc(firestoreDb, "users", user.uid);
        try {
          await setDoc(userRef, {
            email: email.trim().toLowerCase(),
            isAdmin: isAdmin
          });
        } catch (dbErr) {
          handleFirestoreError(dbErr, OperationType.WRITE, `users/${user.uid}`);
        }

        setSuccess("Account created successfully!");
        setTimeout(() => {
          onAuthSuccess({ email: user.email!, isAdmin });
          onClose();
          resetForm();
          setLoading(false);
        }, 1500);
      } catch (err: any) {
        setLoading(false);
        if (err.code === "auth/email-already-in-use") {
          setError("This email address is already registered.");
        } else if (err.code === "auth/weak-password") {
          setError("The password is too weak.");
        } else if (err.code === "auth/invalid-email") {
          setError("The email address is invalid.");
        } else {
          setError(err.message || "Failed to create account.");
        }
      }
    } else {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
        const user = userCredential.user;
        let isAdmin = email.trim().toLowerCase() === "indiafff568@gmail.com";

        // Fetch custom profile settings to verify admin state
        const userRef = doc(firestoreDb, "users", user.uid);
        try {
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            isAdmin = userDoc.data().isAdmin || isAdmin;
          } else {
            // Create user document if it didn't exist
            await setDoc(userRef, {
              email: user.email!.toLowerCase(),
              isAdmin: isAdmin
            });
          }
        } catch (dbErr) {
          console.warn("Could not retrieve user info from Firestore, falling back to local verification:", dbErr);
        }

        setSuccess("Successfully logged in!");
        setTimeout(() => {
          onAuthSuccess({ email: user.email!, isAdmin });
          onClose();
          resetForm();
          setLoading(false);
        }, 1200);
      } catch (err: any) {
        setLoading(false);
        if (err.code === "auth/wrong-password" || err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
          setError("Incorrect email or password. Please try again.");
        } else if (err.code === "auth/invalid-email") {
          setError("The email address is invalid.");
        } else {
          setError(err.message || "Failed to log in.");
        }
      }
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess("");
  };

  const toggleMode = () => {
    setMode(mode === "signin" ? "signup" : "signin");
    setError("");
    setSuccess("");
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-md glassmorphism rounded-3xl border border-white/10 shadow-2xl overflow-hidden relative z-10"
        >
          {/* Accent header indicator */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-accent to-secondary" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>

          <div className="p-8">
            <div className="text-center space-y-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center mx-auto shadow-lg shadow-primary/25">
                <Lock className="text-white" size={20} />
              </div>
              <h2 className="text-xl font-extrabold text-white font-display">
                {mode === "signin" ? "Sign In to xrok" : "Create xrok Account"}
              </h2>
              <p className="text-xs text-gray-400">
                {mode === "signin" 
                  ? "Access verified packages, bookmark applications, and write reviews." 
                  : "Join xrok App Market to manage sandbox files & personalized app feeds."}
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-500/15 border border-red-500/25 rounded-xl text-xs text-red-400 font-semibold mb-4 flex items-center gap-2"
              >
                <AlertCircle size={14} className="shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-emerald-500/15 border border-emerald-500/25 rounded-xl text-xs text-emerald-400 font-semibold mb-4 flex items-center gap-2"
              >
                <Check size={14} className="shrink-0" />
                <span>{success}</span>
              </motion.div>
            )}

            {/* Google Authentication Button */}
            <button
              type="button"
              disabled={loading}
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-white text-gray-900 hover:bg-gray-100 font-bold text-xs transition-all shadow-md active:scale-[0.99] disabled:opacity-50 cursor-pointer mb-5"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="relative flex py-2 items-center mb-5">
              <div className="flex-grow border-t border-white/5"></div>
              <span className="flex-shrink mx-3 text-[10px] text-gray-500 font-mono uppercase font-bold">Or Email Login</span>
              <div className="flex-grow border-t border-white/5"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-gray-400 font-mono">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3.5 flex items-center text-gray-400 pointer-events-none">
                    <Mail size={15} />
                  </span>
                  <input
                    type="email"
                    required
                    disabled={loading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    className="w-full bg-black/30 border border-white/5 focus:border-accent/40 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none transition-colors disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-gray-400 font-mono">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3.5 flex items-center text-gray-400 pointer-events-none">
                    <Lock size={15} />
                  </span>
                  <input
                    type="password"
                    required
                    disabled={loading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-black/30 border border-white/5 focus:border-accent/40 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none transition-colors disabled:opacity-50"
                  />
                </div>
              </div>

              {mode === "signup" && (
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-gray-400 font-mono">Confirm Password</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3.5 flex items-center text-gray-400 pointer-events-none">
                      <Lock size={15} />
                    </span>
                    <input
                      type="password"
                      required
                      disabled={loading}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-black/30 border border-white/5 focus:border-accent/40 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none transition-colors disabled:opacity-50"
                    />
                  </div>
                </div>
              )}

              {email.trim().toLowerCase() === "indiafff568@gmail.com" && (
                <div className="p-2.5 bg-amber-500/10 border border-amber-500/25 rounded-xl text-[10px] text-amber-400 font-semibold flex items-center gap-2">
                  <Sparkles size={12} className="shrink-0 animate-pulse text-amber-400" />
                  <span>Admin permissions will be assigned to this email!</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-primary to-secondary hover:from-accent hover:to-primary text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-1.5 mt-2 disabled:opacity-50"
              >
                <span>{loading ? "Please Wait..." : (mode === "signin" ? "Sign In" : "Sign Up")}</span>
                {!loading && <ArrowRight size={13} />}
              </button>
            </form>

            {/* Account Switch Prompt */}
            <div className="mt-6 text-center border-t border-white/5 pt-4">
              <button
                disabled={loading}
                onClick={toggleMode}
                className="text-xs text-accent hover:underline font-semibold bg-transparent border-none cursor-pointer disabled:opacity-50"
              >
                {mode === "signin" 
                  ? "Don't have an account? Sign Up" 
                  : "Already have an account? Sign In"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
