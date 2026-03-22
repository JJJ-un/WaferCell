import { useState, type ReactNode } from "react";

export const useDropdown= <T>() => {
  const [selectedId, setSelectedId] = useState<T | null>(null);
  const [selectedOption, setSelectedOption] = useState<ReactNode | null>(null);
  const [isBoxOpen, setIsBoxOpen] = useState(false);

  const toggleBoxOpen = () => {
    setIsBoxOpen(prev => !prev);
  };

  const closeBox = () => {
    setIsBoxOpen(false);
  };

  const selectOption = (id: T, option: ReactNode) => {
    setSelectedId(id);
    setSelectedOption(option);
  };

  return {
    selectedOption,
    selectedId, 
    selectOption,
    isBoxOpen,
    toggleBoxOpen,
    closeBox,
  };
};
