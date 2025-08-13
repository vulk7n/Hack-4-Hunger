
'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';

type DeliveryContextType = {
  isDutyOn: boolean;
  setIsDutyOn: (isOn: boolean) => void;
};

const DeliveryContext = createContext<DeliveryContextType | undefined>(undefined);

export const DeliveryProvider = ({ children }: { children: ReactNode }) => {
  const [isDutyOn, setIsDutyOn] = useState(true);

  return (
    <DeliveryContext.Provider value={{ isDutyOn, setIsDutyOn }}>
      {children}
    </DeliveryContext.Provider>
  );
};

export const useDelivery = () => {
  const context = useContext(DeliveryContext);
  if (context === undefined) {
    throw new Error('useDelivery must be used within a DeliveryProvider');
  }
  return context;
};
