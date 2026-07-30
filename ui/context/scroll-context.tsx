import React, { useContext, createContext } from 'react';
import { type SharedValue, useSharedValue } from 'react-native-reanimated';

export const ScrollContext = createContext<SharedValue<number> | null>(null);

export function ScrollProvider({ children }: { children: React.ReactNode }) {
  const scrollY = useSharedValue(0);
  
  return (
    <ScrollContext.Provider value={scrollY}>
      {children}
    </ScrollContext.Provider>
  );
}

export function useScrollContext() {
  const context = useContext(ScrollContext);
  if (context === null) {
    throw new Error('useScrollContext must be used within a ScrollProvider');
  }
  return context;
}

