"use client"

import { createContext, type PropsWithChildren, type ReactNode } from "react";
import { useDropdown } from "@/shared/model/hooks/useDropdown";

export type DropdownContextType = {
  isBoxOpen: boolean;
  toggleBoxOpen: () => void;
  closeBox: () => void;
  selectedId: string | number | null;
  selectedOption: ReactNode | null;
  selectOption: (id: string | number | null, option: ReactNode) => void; 
};

export const DropdownContext = createContext<DropdownContextType>({
  isBoxOpen: false,
  toggleBoxOpen: () => {},
  closeBox: () => {},
  selectedId: null,
  selectedOption: null,
  selectOption: () => {},
});

interface DropdownContextProviderProps extends PropsWithChildren {
  onSelect?: (id: string | number) => void;
}

function DropdownContextProvider({ children, onSelect }: DropdownContextProviderProps) {
  const {
    selectedOption,
    selectedId,
    selectOption: baseSelectOption,
    isBoxOpen,
    toggleBoxOpen,
    closeBox,
  } = useDropdown<string | number | null>();

  const selectOption = (id: string | number | null, option: ReactNode) => {
    baseSelectOption(id, option);
    if (id !== null) {
      onSelect?.(id);
    }
  };

  return (
    <DropdownContext.Provider
      value={{
        isBoxOpen,
        toggleBoxOpen,
        closeBox,
        selectedOption,
        selectedId,
        selectOption,
      }}
    >
      {children}
    </DropdownContext.Provider>
  );
}


export { DropdownContextProvider }
