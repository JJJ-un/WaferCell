"use client";

import { type HTMLAttributes, useContext } from "react";
import { DropdownContext } from "@/shared/model/contexts/DropdownContextProvider";

/**
 * DropdownMenu 컴포넌트
 *
 * @param {("left" | "center" | "right")} [placement]  
 * 드롭다운 메뉴가 열릴 위치를 지정합니다.
 *
 * @param {boolean} [independent]  
 * 메뉴를 Context와 무관하게 독립적으로 열지 여부를 설정합니다.
 *
 * @param {Size} [size]  
 * Dropdown.css에 정의된 size variant를 지정합니다.
 */


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
    <div {...props}>
      {children}
    </div>
  ) : null;
}

export { DropdownMenu };
