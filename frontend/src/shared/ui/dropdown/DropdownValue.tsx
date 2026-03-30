import { type ReactNode } from "react";

interface DropdownValueProps {
  value: ReactNode | null; // 현재 선택된 값 (외부에서 주입받음)
}

function DropdownValue({ value }: DropdownValueProps) {
  return (
    <div>
      {value}
    </div>
  );
}

export { DropdownValue };