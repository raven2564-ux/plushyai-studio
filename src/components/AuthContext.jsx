import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { auth, db, googleProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged, doc, setDoc, onSnapshot, getDoc } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const loginInFlightRef = useRef(false);

  // Handle redirect result error catching
  useEffect(() => {
    if (!auth) return;
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          console.log("Redirect login successful for user:", result.user.email);
        }
      })
      .catch((error) => {
        console.error("Error with Google redirect sign-in:", error);
        alert(`Authentication Error: ${error.message}`);
      });
  }, []);

  const loginWithGoogle = async () => {
    if (!auth) {
      alert("Autentificarea necesita Firebase configurat. Urmareste pasii din walkthrough.md!");
      return;
    }
    if (loginInFlightRef.current) return;
    loginInFlightRef.current = true;
    try {
      const isStandalone =
        (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
        window.navigator.standalone;

      if (isStandalone) {
        await signInWithRedirect(auth, googleProvider);
        return;
      }

      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
      const code = error?.code || "";
      if (
        code === "auth/cancelled-popup-request" ||
        code === "auth/popup-blocked" ||
        code === "auth/operation-not-supported-in-this-environment"
      ) {
        await signInWithRedirect(auth, googleProvider);
        return;
      }
      if (code === "auth/popup-closed-by-user") return;
      if (code === "auth/unauthorized-domain") {
        alert("Domeniu neautorizat în Firebase. Trebuie adăugat domeniul în Authentication > Settings > Authorized domains.");
        return;
      }
      alert(`Login Failed: ${error.message}`);
    } finally {
      loginInFlightRef.current = false;
    }
  };

  const logout = () => {
    if (auth) return signOut(auth);
  };

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const unsubSnapshot = onSnapshot(userRef, (snapshot) => {
          if (snapshot.exists()) {
            setCredits(snapshot.data().credits || 0);
            setLoading(false);
          } else {
            // Document does not exist yet (e.g., first login). Create it.
            setDoc(userRef, {
              email: user.email,
              displayName: user.displayName || '',
              credits: 60,
              tier: 'free',
              createdAt: new Date().toISOString()
            }).catch(err => {
              console.error("Failed to create user document inside snapshot listener:", err);
              setLoading(false);
            });
          }
        }, (error) => {
          console.error("Firestore snapshot error:", error);
          setLoading(false);
        });
        
        return () => unsubSnapshot();
      } else {
        setCredits(0);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    credits,
    loginWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
