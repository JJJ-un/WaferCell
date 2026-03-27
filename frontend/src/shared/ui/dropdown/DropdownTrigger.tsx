import { type ComponentPropsWithoutRef,useContext } from "react";
import { DropdownContext } from "@/shared/model/contexts/DropdownContextProvider";

interface DropdownTriggerProps extends ComponentPropsWithoutRef<"button">{

}

function DropdownTrigger({
  className,
  children,
  ...props
}: DropdownTriggerProps) {
  const { toggleBoxOpen } = useContext(DropdownContext);

  const handleClick = () => {
    toggleBoxOpen();
  };

  return (
    <button
      onClick={handleClick}
      type="button" 
      className={className}
      {...props}
    >
      {children}
    </button>
  );
}

export { DropdownTrigger };