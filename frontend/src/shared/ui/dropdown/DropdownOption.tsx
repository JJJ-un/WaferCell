'use client' 

import { type ComponentPropsWithoutRef} from "react";
import { useContext } from "react";
import { DropdownContext } from "@/shared/model/contexts/DropdownContextProvider";

interface DropdownOptionProps extends ComponentPropsWithoutRef<'div'> {
  // 필수 사용
  optionId: string | number | null;
}

function DropdownOption({
  optionId,
  onClick,
  className,
  children,
  ...props
}: DropdownOptionProps) {
  const { selectOption, toggleBoxOpen } = useContext(DropdownContext);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    selectOption(optionId, children);
    toggleBoxOpen();
    onClick?.(e);
  };

  return (
    <div
      onClick={handleClick}
      className={className}
      {...props}
    >
      {children}
    </div>
  );
}

export { DropdownOption };
