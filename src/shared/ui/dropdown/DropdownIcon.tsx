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
      {children}
    </span>
  );
}

export { DropdownIcon };
