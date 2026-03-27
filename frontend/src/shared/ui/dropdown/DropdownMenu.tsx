"use client";

import { type HTMLAttributes, useContext } from "react";
import { DropdownContext } from "@/shared/model/contexts/DropdownContextProvider";

interface DropdownMenuProps extends HTMLAttributes<HTMLDivElement> {

}

function DropdownMenu({
  children,
  className,
  ...props
}: DropdownMenuProps) {

  const { isBoxOpen } = useContext(DropdownContext);
  const isOpen = isBoxOpen;

  return isOpen ? (
    <div className={className} {...props}>
      {children}
    </div>
  ) : null;
}

export { DropdownMenu };
