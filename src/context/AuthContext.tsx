import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { authService } from '../services/authService';
import { AuthContextType, Profile, RegisterPayload, SignInPayload } from '../types/auth.types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async (userId: string) => {
    try {
      const p = await authService.getProfile(userId);
      setProfile(p);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load profile';
      console.error('Failed to load user profile:', errorMsg);
      setError(errorMsg);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (payload: SignInPayload) => {
    setError(null);
    try {
      const data = await authService.signIn(payload);
      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        const p = await authService.getProfile(data.user.id);
        setProfile(p);
        return { error: null, profile: p };
      }
      return { error: null, profile: null };
    } catch (err: unknown) {
      const errorObj = err instanceof Error ? err : new Error('Sign in failed');
      setError(errorObj.message);
      return { error: errorObj, profile: null };
    }
  };

  const signUp = async (payload: RegisterPayload) => {
    setError(null);
    try {
      const data = await authService.signUp(payload);
      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        const p = await authService.getProfile(data.user.id);
        setProfile(p);
        return { error: null, profile: p };
      }
      return { error: null, profile: null };
    } catch (err: unknown) {
      const errorObj = err instanceof Error ? err : new Error('Sign up failed');
      setError(errorObj.message);
      return { error: errorObj, profile: null };
    }
  };

  const signOut = async () => {
    setError(null);
    try {
      await authService.signOut();
      setUser(null);
      setProfile(null);
      setSession(null);
      return { error: null };
    } catch (err: unknown) {
      const errorObj = err instanceof Error ? err : new Error('Sign out failed');
      setError(errorObj.message);
      return { error: errorObj };
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        error,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
