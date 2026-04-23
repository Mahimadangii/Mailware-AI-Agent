// src/hooks/useAuth.js
import { useState, useEffect } from "react";
import { subscribeToAuthChanges } from "../firebase/config";

/**
 * useAuth — subscribes to Firebase auth state.
 * Returns { user, loading }
 *   user    → Firebase User object or null
 *   loading → true while the initial auth check is in progress
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { user, loading };
}
