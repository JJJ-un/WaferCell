import SelectIcon from "@/shared/assets/icons/common/select.svg";
import { type ComponentProps } from "react";

export interface DropdownIconProps extends ComponentProps<"span"> {
}

function DropdownIcon({
  children,
  className,
  ...props
}: DropdownIconProps) {
  return (
    <span {...props}>
      {children ?? <SelectIcon />}
    </span>
  );
}

export { DropdownIcon };
