import React, { createContext, useContext, useState } from 'react';
import { calcBMR, calcTDEE, calcCalorieTarget, calcMacros } from '../services/metabolism';

const DEFAULT_PROFILE = {
  sex:      'm',
  age:      '',
  weight:   '',
  height:   '',
  activity: 'moderate',
  goal:     'maintain',
  // calculés après save
  calorieTarget: 2200,
  macros: { protein: 150, carbs: 250, fat: 75 },
};

const ProfileContext = createContext({});

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);

  const saveProfile = (newProfile) => {
    const bmr    = calcBMR(newProfile);
    const tdee   = calcTDEE(bmr, newProfile.activity);
    const target = calcCalorieTarget(tdee, newProfile.goal);
    const macros = calcMacros(target, newProfile.goal, newProfile.weight);
    setProfile({ ...newProfile, calorieTarget: target, macros });
  };

  return (
    <ProfileContext.Provider value={{ profile, saveProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used inside ProfileProvider');
  return ctx;
}
