import { type ComponentPropsWithoutRef,useContext } from "react";
import { DropdownContext } from "@/shared/model/contexts/DropdownContextProvider";

/**
 * DropdownTrigger 컴포넌트 Props
 *
 * @param {"none" | "solid" | "ghost"} [variant]  
 * 트리거 버튼의 스타일 변형을 지정합니다.  
 * - `none`: 기본 스타일 없음  
 * - `solid`: 배경/테두리가 있는 기본형  
 * - `ghost`: 배경 없는 투명형
 *
 * @param {"sm" | "md" | "lg" | "xl" | "2xl" | "2xl-tall" | "3xl" | "4xl"} [size]  
 * 트리거 버튼의 너비와 높이를 지정합니다.  
 * (Dropdown.css에 정의된 size variant를 따릅니다.)
 */

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
      {...props}
    >
      {children}
    </button>
  );
}

export { DropdownTrigger };