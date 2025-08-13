
'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

type Profile = {
    name: string;
    email: string;
    avatar_url: string;
    power_coins: number;
    created_at: string;
    phone: string;
    address: string;
    [key: string]: any;
};

type ProfileContextType = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const supabase = getSupabaseBrowserClient();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (user: User) => {
    setLoading(true);
    let { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (error && error.code === 'PGRST116') { // Profile not found
        console.log("Profile not found, creating a new one.");
        const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({
                id: user.id,
                name: user.user_metadata?.name || user.email?.split('@')[0],
                email: user.email,
                avatar_url: user.user_metadata?.avatar_url,
            })
            .select()
            .single();

        if (insertError) {
            console.error('Error creating profile:', insertError);
            setProfile(null);
        } else {
            setProfile(newProfile);
        }
    } else if (error) {
        console.error('Error fetching profile:', error);
        setProfile(null);
    } else {
        setProfile(profileData);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    const getInitialUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user);
      } else {
        setLoading(false);
      }
    };
    
    getInitialUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user || null;
        setUser(currentUser);
        
        if (event === 'SIGNED_IN' && currentUser) {
            await fetchProfile(currentUser);
        } else if (event === 'SIGNED_OUT') {
            setProfile(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  const value = { user, profile, loading };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
