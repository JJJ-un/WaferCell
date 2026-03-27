import { type ComponentPropsWithoutRef, useContext} from "react";
import { DropdownContext } from "@/shared/model/contexts/DropdownContextProvider";
import { useHideOnClickOutside } from "@/shared/model/hooks/useHideOnClickOutside";

function DropdownWrapper({ children, className, ...props }: ComponentPropsWithoutRef<"div">) {

  const { isBoxOpen, closeBox } = useContext(DropdownContext);

  const dropdownRef = useHideOnClickOutside<HTMLDivElement>({
    onClickOutside: () => {
      closeBox();
    },
    disabled: !isBoxOpen,
  })

  return (
    <div className={className} ref={dropdownRef} {...props}>
      {children}
    </div>
  );
}

export { DropdownWrapper };
