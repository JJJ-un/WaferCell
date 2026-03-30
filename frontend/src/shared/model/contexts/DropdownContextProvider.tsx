"use client"

import { createContext, useState, type PropsWithChildren } from "react";

export type DropdownContextType = {
  isBoxOpen: boolean;
  toggleBoxOpen: () => void;
  closeBox: () => void;
};

export const DropdownContext = createContext<DropdownContextType>({
  isBoxOpen: false,
  toggleBoxOpen: () => {},
  closeBox: () => {},
});

function DropdownContextProvider({ children }: PropsWithChildren) {
  const [isBoxOpen, setIsBoxOpen] = useState(false);

  const toggleBoxOpen = () => setIsBoxOpen(prev => !prev);
  const closeBox = () => setIsBoxOpen(false);

  return (
    <DropdownContext.Provider
      value={{
        isBoxOpen,
        toggleBoxOpen,
        closeBox,
      }}
    >
      {children}
    </DropdownContext.Provider>
  );
}

export { DropdownContextProvider }