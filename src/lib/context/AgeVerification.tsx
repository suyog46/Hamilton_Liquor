"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface AgeVerificationContextValue {
  verified: boolean;
  markVerified: () => void;
}

const AgeVerificationContext = createContext<AgeVerificationContextValue | null>(null);

export const AgeVerificationProvider = ({
  initiallyVerified,
  children,
}: {
  initiallyVerified: boolean;
  children: ReactNode;
}) => {
  const [verified, setVerified] = useState(initiallyVerified);

  return (
    <AgeVerificationContext.Provider value={{ verified, markVerified: () => setVerified(true) }}>
      {children}
    </AgeVerificationContext.Provider>
  );
};

export const useAgeVerification = () => {
  const context = useContext(AgeVerificationContext);
  if (!context) {
    throw new Error("useAgeVerification must be used within an AgeVerificationProvider");
  }
  return context;
};
