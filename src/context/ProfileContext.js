import React, { createContext, useContext, useState, useEffect } from 'react';
import { calcBMR, calcTDEE, calcCalorieTarget, calcMacros } from '../services/metabolism';
import { loadProfile, saveProfile as persistProfile } from '../services/storage';

const DEFAULT_PROFILE = {
  sex:      'm',
  age:      '',
  weight:   '',
  height:   '',
  activity: 'moderate',
  goal:     'maintain',
  calorieTarget: 2200,
  macros: { protein: 150, carbs: 250, fat: 75 },
};

const ProfileContext = createContext({});

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [loaded, setLoaded] = useState(false);

  // Charge le profil au démarrage
  useEffect(() => {
    loadProfile().then(saved => {
      if (saved) setProfile(saved);
      setLoaded(true);
    });
  }, []);

  const saveProfile = async (newProfile) => {
    const bmr    = calcBMR(newProfile);
    const tdee   = calcTDEE(bmr, newProfile.activity);
    const target = calcCalorieTarget(tdee, newProfile.goal);
    const macros = calcMacros(target, newProfile.goal, newProfile.weight);
    const updated = { ...newProfile, calorieTarget: target, macros };
    setProfile(updated);
    await persistProfile(updated); // sauvegarde persistante
  };

  return (
    <ProfileContext.Provider value={{ profile, saveProfile, loaded }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used inside ProfileProvider');
  return ctx;
}
