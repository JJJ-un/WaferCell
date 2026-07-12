'use client'

import { type ComponentPropsWithoutRef, useContext } from "react";
import { DropdownContext } from "@/shared/model/contexts/DropdownContextProvider";

interface DropdownOptionProps extends Omit<ComponentPropsWithoutRef<'div'>, 'onSelect'> {
  optionId: string | number | null;
  onSelect?: (id: string | number | null) => void; // 클릭 시 부모에게 알림
  closeOnSelect?: boolean; // 선택 시 드롭다운을 닫을지 여부 (기본값: true)
}

function DropdownOption({
  optionId,
  onClick,
  onSelect,
  closeOnSelect = true,
  className,
  children,
  ...props
}: DropdownOptionProps) {
  const { toggleBoxOpen } = useContext(DropdownContext);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // 1. 부모에게 선택된 ID 전달
    onSelect?.(optionId);
    // 2. 드롭다운 닫기 (closeOnSelect가 true인 경우에만)
    if (closeOnSelect) {
      toggleBoxOpen();
    }
    // 3. 기존 onClick 실행
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